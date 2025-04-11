import React, { useEffect, useState } from "react";
import config from '../config';
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import chedLogo from "../assets/CHED-LOGO_orig.png";
import NavBar from "./NavBar/NavBar";
import { Modal, Button, Form, FormControl } from "react-bootstrap";

const SavedEntries = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [data, setData] = useState({
    entries: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  });
  const [showViewModal, setShowViewModal] = useState(false);

  const [showPOModal, setShowPOModal] = useState(false);
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isGeneratingPoNumber, setIsGeneratingPoNumber] = useState(false);
  const [poData, setPoData] = useState({
    po_number: "",
    supplier: "",
    supplierAddress: "",
    supplierTIN: "",
    modeOfProcurement: "",
    placeOfDelivery: "",
    dateOfDelivery: "",
    deliveryTerm: "",
    paymentTerm: ""
  });

  const generatePoNumber = async () => {
    if (poData.po_number) return; // Skip if PO number already exists
    
    setIsGeneratingPoNumber(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/po-data/latest-count`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Generate PO number in format YYYY-MM-XXX
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const count = (data.count || 0) + 1;
      const poNumber = `${year}-${month}-${String(count).padStart(3, '0')}`;
      
      setPoData(prev => ({ ...prev, po_number: poNumber }));
    } catch (err) {
      console.error("Error generating PO number:", err);
    } finally {
      setIsGeneratingPoNumber(false);
    }
  };

  useEffect(() => {
    if (showPOModal && !poData.po_number) {
      generatePoNumber();
    }
  }, [showPOModal]);

  const handlePoDataChange = (e) => {
    const { name, value } = e.target;
    setPoData({
      ...poData,
      [name]: value
    });
  };

  const fetchPoData = async (entryId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/po-data?entry_id=${entryId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setPoData(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching PO data:", err);
    }
  };

  useEffect(() => {
    if (selectedEntry) {
      fetchPoData(selectedEntry.id);
    }
  }, [selectedEntry]);

  useEffect(() => {
    const fetchEntries = async (page = 1) => {
      try {
        setLoading(true);
      const response = await fetch(
          `${config.API_BASE_URL}/api/entries?page=${page}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData({
          entries: result.data,
          pagination: result.pagination,
        });
      } catch (err) {
        console.error("Failed to fetch entries:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const fetchEntries = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.API_BASE_URL}/api/entries?page=${page}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData({
        entries: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      console.error("Failed to fetch entries:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Single handleGeneratePO function
  const handleGeneratePO = (entry) => {
    setSelectedEntry(entry);
    setShowPOModal(true);
  };

  const generatePR = (entry) => {
    const img = new Image();
    img.src = chedLogo;

    img.onload = () => {
      const doc = new jsPDF();

      // Add CHED Logo
      doc.addImage(img, "PNG", 15, 10, 20, 20);

      // Header
      doc.setFontSize(14);
      doc.text("COMMISSION ON HIGHER EDUCATION", 105, 20, {
        align: "center",
      });
      doc.text("MIMAROPA REGION", 105, 27, { align: "center" });

      doc.setFontSize(14);
      doc.text("Purchase Request", 105, 40, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("times", "italic"); 
      doc.text("Appendix 60", 180, 15);

      doc.setFont("times", "normal"); 
      doc.setFontSize(10);

      doc.setFont("times", "normal");
      doc.setFontSize(10);

      const fundClusterY = 55; r
      doc.text(
        entry.fundCluster
          ? "Fund Cluster: " + entry.fundCluster
          : "Fund Cluster: _____________",
        130,
        fundClusterY
      );

      // Adjust the Y position for the table  
      const tableStartY = fundClusterY + 2; 

      const headerData = [
        [
          "Office/Section:" + "\n" + entry.officeSection || "________________",
          "PR No.: " +
            (entry.prNumber || "AUTO-GENERATED") +
            "\n" +
            "Responsibility Center Code: " +
            (entry.responsibilityCode || "________________"),
          "Date: " + (formatDate(entry.date) || "________________") + "\n",
        ],
      ];

      autoTable(doc, {
        startY: tableStartY, // Set table Y position after "Fund Cluster"
        body: headerData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1, // Ensures borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0], // Black text
          fontStyle: "bold",
          lineWidth: 0.1, // Ensures header borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: "bold" },
          1: { cellWidth: 100 },
          2: { cellWidth: 50 },
        },
      });

      // Table Data
      const tableData = selectedEntry.items.map((item) => [
        item.stockNo || "-",
        item.unit || "-",
        item.itemDescription || "-",
        item.quantity || 0,
        item.unitCost || 0,
        (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0),
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [
          [
            "Stock/     Property No.",
            "Unit",
            "Item Description",
            "Quantity",
            "Unit Cost",
            "Total Cost",
          ],
        ],
        body: tableData,
        theme: "grid", // Ensures grid-style table
        styles: {
          fontSize: 8,
          lineWidth: 0.1, // Ensures borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0], // Black text
          fontStyle: "bold",
          lineWidth: 0.1, // Ensures header borders are visible
          lineColor: [0, 0, 0], // Black border color
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 80 },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 25, halign: "right" },
          5: { cellWidth: 25, halign: "right" },
        },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: [["", "", `${entry.note}`, "", "", ""]],
        theme: "grid",
        styles: {
          fontSize: 8,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 20 },
          2: { cellWidth: 80 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25, fontStyle: "bold", halign: "right" },
          5: { cellWidth: 25, halign: "right" },
        },
      });

      const yPos = doc.lastAutoTable.finalY;

      const totalCost = tableData.reduce((sum, row) => {
        // Convert to absolute value to ensure positive number
        const cost = Math.abs(parseFloat(row[5]) || 0);
        return sum + cost;
      }, 0);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: [["", "", "", "", "Total:", `${totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]],
        theme: "grid",
        styles: {
          fontSize: 8,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 20 },
          2: { cellWidth: 80 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25, fontStyle: "bold", halign: "right" },
          5: { cellWidth: 25, halign: "right" },
        },
      });

      // Purpose Section
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: [["Purpose:" + " " + entry.purpose || "N/A"]],
        theme: "grid",
        styles: {
          fontSize: 8,
          lineWidth: 0.1, // Ensures borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0], // Black text
          fontStyle: "bold",
          lineWidth: 0.1, // Ensures header borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        columnStyles: {
          0: { cellWidth: 185, fontStyle: "bold", minCellHeight: 20 },
        },
      });

      // Signatures
      const signY = doc.lastAutoTable.finalY;

      const maxLength = 30; // Adjust this based on your column width

      const signatureData = [
        ["Requested by:", "", "Approved by:"],
        ["Signature: ", "", ""],
        [
          "Printed name: ",
          ` ${entry.requestedBy.toUpperCase() || ""}`,
          `${entry.approvedBy.toUpperCase() ?? ""}`,
        ],
        [
          "Designation: ",
          ` ${entry.requestedByPosition || ""}`,
          `${entry.approvedByPosition ?? ""}`,
        ],
      ];

      autoTable(doc, {
        startY: signY,
        body: signatureData,
        theme: "grid",
        styles: {
          fontSize: 8,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: "left",
        },
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0,
        },
        columnStyles: {
          0: { cellWidth: 35, halign: "left", lineColor: [255, 255, 255] },
          1: { cellWidth: 80, halign: "left", lineColor: [255, 255, 255] },
          2: { cellWidth: 70, halign: "left", lineColor: [255, 255, 255] },
        },
        tableWidth: 185,
        tableLineWidth: 0.1, // Outer border width
        tableLineColor: [0, 0, 0], // Outer border color (black)
        didParseCell: (data) => {
          if (
            data.column.index === 1 ||
            (data.column.index === 2 &&
              (data.row.index === 2 || data.row.index === 3))
          ) {
            data.cell.styles.halign = "center";
          }
        },
      });

      // Save the PDF
      doc.save(`${entry.filename || "purchase_request"}.pdf`);

      console.log("PDF generated successfully.");
    };
  };

  const view = (entry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  const setClicked = (entry) => {
    setShowDeleteModal(true);
    setSelectedEntry(entry);
  };

  const handleDelete = async (entry) => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/entries/${entry.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete the entry.");
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowDeleteModal(false);
      fetchEntries(data.pagination.page);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };
  
  const savePoData = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/po-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entry_id: selectedEntry.id,
          ...poData,
          items: selectedEntry.items
        }),
      });
      
      if (response.ok) {
        generatePOPDF();
        console.log("successful");
      }
      if (!response.ok) {
        const error = await response.json();
        console.error("Server error:", error);
      }
      
    } catch (err) {
      console.error("Error saving PO data:", err);  
    }
  };

  const generatePOPDF = () => {
    if (!selectedEntry) return;
    const img = new Image();
    img.src = chedLogo;

    img.onload = () => {
      const doc = new jsPDF();
      const filename = `${selectedEntry.filename.replace(".pdf", "")}_PO.pdf`;
      // Add CHED Logo
      doc.addImage(img, "PNG", 15, 10, 20, 20);

      // Header
      doc.setFontSize(14);
      doc.text("COMMISSION ON HIGHER EDUCATION", 105, 20, {
        align: "center",
      });
      doc.text("MIMAROPA REGION", 105, 27, { align: "center" });

      doc.setFontSize(14);
      doc.text("Purchase Order", 105, 40, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("times", "italic"); 
      doc.text("Appendix 61", 180, 15);

      doc.setFont("times", "normal"); 
      doc.setFontSize(10);

      doc.setFont("times", "normal");
      doc.setFontSize(10);

      const fundClusterY = 45;

      const tableStartY = fundClusterY + 2; 

      const headerData = [
        [
          `Supplier: ${poData.supplier || "________________"}\n` +
          `Address: ${poData.supplierAddress || "______________"}\n` +
          `TIN: ${poData.supplierTIN || "______________"}`,
          `P.O. No.: ${poData.po_number || "______________"}\n` +
          `Date: ${poData.dateOfDelivery || "______________"}\n` +
          `Mode of Procurement: ${poData.modeOfProcurement || "_________________"}`
        ],
      ];

      autoTable(doc, {
        startY: tableStartY, 
        body: headerData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1, 
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [255, 255, 255], 
          textColor: [0, 0, 0], 
          lineWidth: 0.1, 
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 115, fontStyle: "bold" },
          1: { cellWidth: 70 },
        },
      });
      
      const subhead = [
        ["Gentlemen:" +"\n"+
        " Please furnish this Office the following articles subject to the terms and conditions contained herein: "]
      ]

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY, 
        body: subhead,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1, // Ensures borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0], // Black text
          lineWidth: 0.1, // Ensures header borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        columnStyles: {
          0: { cellWidth: 185,}
        },
      });

      const termsAndDelivery = [
       [ `Place of Delivery: ${poData.placeOfDelivery || "__________________"}\n`+
        `Date of Delivery:  ${poData.dateOfDelivery  || "__________________"} \n`,
        `Delivery Term: ${poData.deliveryTerm  || "__________________"}\n` + 
        `Payment Term: ${poData.paymentTerm  || "__________________"}\n`
        ],
      ];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY, 
        body: termsAndDelivery,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1, // Ensures borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0], // Black text
          lineWidth: 0.1, // Ensures header borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        columnStyles: {
          0: { cellWidth: 115,},
          1: { cellWidth: 70,}
        },
      });

      // Table Data
      const tableData = selectedEntry.items.map((item) => [
        item.stockNo || "-",
        item.unit || "-",
        item.itemDescription || "-",
        item.quantity || 0,
        item.unitCost || 0,
        (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0),
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [
          [
            "Stock/     Property No.",
            "Unit",
            "Item Description",
            "Quantity",
            "Unit Cost",
            "Total Cost",
          ],
        ],
        body: tableData,
        theme: "grid", // Ensures grid-style table
        styles: {
          fontSize: 8,
          lineWidth: 0.1, // Ensures borders are visible
          lineColor: [0, 0, 0], // Black border color
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0], // Black text
          fontStyle: "bold",
          lineWidth: 0.1, // Ensures header borders are visible
          lineColor: [0, 0, 0], // Black border color
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 80 },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 25, halign: "right" },
          5: { cellWidth: 25, halign: "right" },
        },
      });
      // Add note to the PDF
      const yPos = doc.lastAutoTable.finalY;

      const totalCost = tableData.reduce((sum, row) => {
        // Assuming "Total Cost" is the 5th column (index 4)
        const cost = parseFloat(row[5]) || 0; // Convert to number, default to 0 if invalid
        return sum + cost;
      }, 0);

      const totalInWords = numberToWords(totalCost);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: [["(Total Amount in Words)", totalInWords, "", "Total:", `PHP ${totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]],
        theme: "grid",
        styles: {
          fontSize: 8,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 80 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25, fontStyle: "bold", halign: "right" },
          4: { cellWidth: 25, halign: "right" },
        },
      });
      const inCase = [
        ["In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed on the undelivered item/s."]
      ]

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY, 
        body: inCase,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 185 }
        },
        didDrawCell: function (data) {
          // Remove bottom border
          if (data.row.index === 0 && data.column.index === 0) {
            const { doc, cell } = data;
            doc.setDrawColor(255, 255, 255); // set to white to "hide" line
            doc.setLineWidth(0);
            doc.line(
              cell.x,
              cell.y + cell.height, // bottom line
              cell.x + cell.width,
              cell.y + cell.height
            );
          }
        }
      });
      

      const finalTerm = [
        [
          "Conforme: " + "\n" +
          "\n" +
          "           __________________________"+ "\n" +
          "    Signature over Printed Name of Supplier"+ "\n" +
          "           _________________________"+ "\n" +
          "                               Date",
          "Very truly yours, " + "\n" +
          "\n" +
          "                     EDNA IMELDA F. LEGAGPI"+ "\n" +
          "    Signature over Printed Name Of Authorized Official"+ "\n" +
          "                                 Director IV"+ "\n" +
          "                               Designation",
        ],
      ];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: finalTerm,
        theme: "plain",
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 115, fontStyle: "bold" },
          1: { cellWidth: 70 },
        },
        didDrawCell: function (data) {
          // Remove top border of the first row
          if (data.row.index === 0) {
            const { doc, cell } = data;
            doc.setDrawColor(255, 255, 255); // white line
            doc.setLineWidth(0.1);
            doc.line(cell.x, cell.y, cell.x + cell.width, cell.y); // overwrite top border
          }
        }
      });

      // Signatures
      const signY = doc.lastAutoTable.finalY;

      const maxLength = 30; 

      const footer = [
        [`Fund Cluster: _____________________\n` +
        `Funds Available: ___________________\n` +
        "\n" +
        `                                   ALDWIN C. AVES\n` +
        `                                       Accountant II\n` +
        `   Signature over Printed Name of Chief Accountant/Head of Accounting\n` +
        `                                       Division/Unit`,
        `ORS/BURS No. ______________________:\n` +
        `Date of the ORS/BURS: ______________\n` +
        "\n" +
        `Amount: PHP ${totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]

      ];

      autoTable(doc, {
        startY: signY,
        body: footer,
        theme: "grid",
        styles: {
          fontSize: 8,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: "left",
        },
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0,
        },
        columnStyles: {
          0: { cellWidth: 115, halign: "left", lineColor: [255, 255, 255] },
          1: { cellWidth: 75, halign: "left", lineColor: [255, 255, 255] },
        },
        tableWidth: 185,
        tableLineWidth: 0.1, // Outer border width
        tableLineColor: [0, 0, 0], // Outer border color (black)
        didParseCell: (data) => {
          if (
            data.column.index === 1 ||
            (data.column.index === 2 &&
              (data.row.index === 2 || data.row.index === 3))
          ) {
            data.cell.styles.halign = "center";
          }
        },
      });
    
      doc.save(filename);
      setShowPOModal(false);
    };
  };
  

  // Helper function to convert numbers to words (supports up to millions)
  function numberToWords(num) {
    
    const absNum = Math.abs(num);
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (absNum === 0) return 'Zero Pesos Only';
    
    function convertLessThanOneThousand(n) {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      }
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
    }
    
    let result = '';
    const million = Math.floor(absNum / 1000000);
    const thousand = Math.floor((absNum % 1000000) / 1000);
    const remainder = absNum % 1000;
    
    if (million > 0) {
      result += convertLessThanOneThousand(million) + ' Million';
    }
    if (thousand > 0) {
      if (result !== '') result += ' ';
      result += convertLessThanOneThousand(thousand) + ' Thousand';
    }
    if (remainder > 0) {
      if (result !== '') result += ' ';
      result += convertLessThanOneThousand(remainder);
    }
    
    return result + ' Pesos Only';
  }

  const handlePageChange = (newPage) => {
    fetchEntries(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
  };

  if (loading) return <div className="container">Loading entries...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container mt-1">
      <NavBar />
      {showSuccess && (
        <div
          className="alert alert-success position-fixed top-0 end-0 m-3"
          style={{ zIndex: 1000, animation: "fadeIn 0.5s" }}
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <span>Data deleted successfully</span>
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setShowSuccess(false)}
            ></button>
          </div>
        </div>
      )}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">
            <i className="bi bi-archive me-2"></i>
            Saved Entries
          </h3>
        </div>
        
        <div className="card-body">
          {data.entries.length === 0 ? (
            <div className="alert alert-info text-center py-3">
              <i className="bi bi-info-circle me-2"></i>
              No saved entries found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="w-25">Filename</th>
                    <th className="w-20">PR Number</th>
                    <th className="w-15">Date</th>
                    <th className="w-40 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="text-truncate" style={{maxWidth: '200px'}} title={entry.filename}>
                        {entry.filename}
                      </td>
                      <td>{entry.prNumber || "N/A"}</td>
                      <td>{formatDate(entry.date) || "N/A"}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => generatePR(entry)}
                            className="btn btn-outline-primary btn-sm"
                            title="Generate PR"
                          >
                            <i className="bi bi-file-earmark-text"></i>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                          </button>
                          <button
                            onClick={async () => {
                              setSelectedEntry(entry);
                              try {
                                const response = await fetch(`${config.API_BASE_URL}/api/po-data?entry_id=${entry.id}`);
                                if (response.ok) {
                                  const poData = await response.json();
                                  navigate('/po-view', { 
                                    state: { 
                                      entry: {
                                        ...entry,
                                        poData: poData.poData,
                                        poItems: poData.poItems
                                      }
                                    } 
                                  });
                                } else {
                                  navigate('/po-view', { state: { entry } });
                                }
                              } catch (err) {
                                console.error("Error fetching PO data:", err);
                                navigate('/po-view', { state: { entry } });
                              }
                            }}
                            className="btn btn-outline-info btn-sm"
                            title="Show PO"
                          >
                            <i className="bi bi-eye"></i>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0000F5"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                          </button>
                          <button
                            onClick={() => handleGeneratePO(entry)}
                            className="btn btn-primary btn-sm"
                            title="Generate PO"
                          >
                            <i className="bi bi-file-earmark-plus"></i>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                            
                          </button>
                          <button
                            onClick={() => view(entry)}
                            className="btn btn-outline-secondary btn-sm"
                            title="View Details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="18px"
                              viewBox="0 -960 960 960"
                              width="18px"
                              fill="#1f1f1f"
                            >
                              <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setClicked(entry)}
                            className="btn btn-outline-danger btn-sm"
                            title="Delete Entry"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="18px"
                              viewBox="0 -960 960 960"
                              width="18px"
                              fill="#EA3323"
                            >
                              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PO Generation Modal */}
          <Modal
            show={showPOModal}
            onHide={() => setShowPOModal(false)}
            size="md"
          >
            <Modal.Header closeButton>
              <Modal.Title>Generate Purchase Order</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-1">
                  <Form.Label>P.O. No. :</Form.Label>
                  <Form.Control
                    type="text"
                    name="po_number"
                    value={poData.po_number}
                    onChange={handlePoDataChange}
                    required
                    readOnly
                    disabled={isGeneratingPoNumber}
                  />
                  {isGeneratingPoNumber && <small className="text-muted">Generating PO number...</small>}
                </Form.Group>
                <Form.Group className="mb-1">
                  <Form.Label>Supplier Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={poData.supplier}
                    onChange={handlePoDataChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Supplier Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplierAddress"
                    value={poData.supplierAddress}
                    onChange={handlePoDataChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Supplier TIN</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplierTIN"
                    value={poData.supplierTIN}
                    onChange={handlePoDataChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Mode of Procurement</Form.Label>
                  <FormControl
                    type="text"
                    name="modeOfProcurement"
                    value={poData.modeOfProcurement}
                    onChange={handlePoDataChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Place of Delivery</Form.Label>
                  <Form.Control
                    type="text"
                    name="placeOfDelivery"
                    value={poData.placeOfDelivery}
                    onChange={handlePoDataChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Date of Delivery</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfDelivery"
                    value={formatDate(poData.dateOfDelivery)}
                    onChange={handlePoDataChange}
                    
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Delivery Term</Form.Label>
                  <Form.Control
                    type="text"
                    name="deliveryTerm"
                    value={poData.deliveryTerm}
                    onChange={handlePoDataChange}
                    
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Payment Term</Form.Label>
                  <Form.Control
                    type="text"
                    name="paymentTerm"
                    value={poData.paymentTerm}
                    onChange={handlePoDataChange}
                    
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPOModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={async () => {
                try {
                  await savePoData();
                  generatePOPDF();
                } catch (err) {
                  console.error("Error saving PO data:", err);
                }
              }}>
                Generate PO
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Entry Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedEntry ? (
                <div>
                  <p>
                    <strong>Filename:</strong> {selectedEntry.filename}
                  </p>
                  <p>
                    <strong>PR Number:</strong>{" "}
                    {selectedEntry.prNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(selectedEntry.date) || "N/A"}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {selectedEntry.purpose || "N/A"}
                  </p>

                  {/* Display Items in a Table */}
                  {selectedEntry.items && selectedEntry.items.length > 0 && (
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Stock No.</th>
                          <th>Unit</th>
                          <th>Description</th>
                          <th>Quantity</th>
                          <th>Unit Cost</th>
                          <th>Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEntry.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.stockNo || "-"}</td>
                            <td>{item.unit || "-"}</td>
                            <td>{item.itemDescription || "-"}</td>
                            <td>{item.quantity || 0}</td>
                            <td>{item.unitCost || 0}</td>
                            <td>
                              {(parseFloat(item.quantity) || 0) *
                                (parseFloat(item.unitCost) || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <p>No entry selected.</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            size="md"
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete this entry?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedEntry)}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
          {/* Pagination controls */}
          <nav>
            <ul className="pagination">
              {Array.from({ length: data.pagination.totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    data.pagination.page === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SavedEntries;
