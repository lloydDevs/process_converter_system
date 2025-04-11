import React, { useState, useCallback, useEffect } from "react";
import PrimaryInformationForm from "./PrimaryInformationForm";
import ItemDetails from "./ItemDetails/ItemDetails";
import "./DataForm.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import chedLogo from "../assets/CHED-LOGO_orig.png";
import NavBar from "./NavBar/NavBar";
import config from "../config";
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

const DataForm = () => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    filename: "Purchase_Request",
    prNumber: "",
    officeSection: "",
    date: "",
    fundCluster: "",
    responsibilityCode: "",
    purpose: "",
    requestedBy: "",
    approvedBy: "",
    requestedByPosition: "",
    approvedByPosition: "",
    note: "",
    items: [
      {
        stockNo: "",
        unit: "",
        itemDescription: "",
        quantity: "",
        unitCost: "",
      },
    ],
  });
  // Generate PR number in YYYY-MM-XXX format
  const generatePRNumber = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      // Try configured endpoints with timeout
      const endpoints = [
        `${config.API_BASE_URL}/api/entries/latest-count`,
        `http://localhost:3001/api/entries/latest-count`
      ].filter(url => url && !url.includes('undefined'));

      let response;
      if (endpoints.length > 0) {
        for (const endpoint of endpoints) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            response = await fetch(endpoint, {
              signal: controller.signal,
              headers: { 'Content-Type': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              console.debug('Successfully connected to PR count API at', endpoint);
              const data = await response.json();
              // Ensure count is a number and increment by 1
              const nextCount = (parseInt(data.count) || 0) + 1;
              return `${year}-${month}-${String(nextCount).padStart(3, '0')}`;
            }
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug(`PR count API unavailable at ${endpoint}:`, e.message);
            }
          }
        }
      } else {
        console.debug('No valid PR count API endpoints configured');
      }

      // Fallback if API not available
      console.log("Using fallback PR number generation");
      const fallbackCount = Math.floor(Math.random() * 50) + 1; // Random number 1-50
      return `${year}-${month}-${String(fallbackCount).padStart(3, '0')}`;
    } catch (err) {
      console.error("Error generating PR number:", err);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      // Emergency fallback (001-050)
      return `${year}-${month}-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`;
    }
  }
  // Set initial PR number
  useEffect(() => {
    const setPRNumber = async () => {
      const prNumber = await generatePRNumber();
      setFormData(prev => ({ ...prev, prNumber }));
    };
    setPRNumber();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          stockNo: "",
          unit: "",
          itemDescription: "",
          quantity: "",
          unitCost: "",
        },
      ],
    }));
  }, []);

  const removeItem = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const handleItemChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][name] = value;
      return { ...prev, items: newItems };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const entryResponse = await fetch("http://192.168.56.1:3001/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (entryResponse.ok) {
        const entryData = await entryResponse.json();
        console.log("Entry created successfully:", entryData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error("Error creating entry:", entryResponse.statusText);
      }
    } catch (err) {
      console.error("Error in form submission:", err);
    }

    if (exportFormat === "pdf") {
      generatePR(formData)
    }
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
      doc.setFont("times", "italic"); // Set italic font
      doc.text("Appendix 60", 180, 15);

      doc.setFont("times", "normal"); // Reset font to normal
      doc.setFontSize(10);

      doc.setFont("times", "normal");
      doc.setFontSize(10);

      // Adjust the Y position for spacing
      const fundClusterY = 55; // Move Fund Cluster text lower
      doc.text(
        entry.fundCluster
          ? "Fund Cluster: " + entry.fundCluster
          : "Fund Cluster: _____________",
        130,
        fundClusterY
      );

      // Adjust the Y position for the table
      const tableStartY = fundClusterY + 2; // Add extra space after "Fund Cluster"

      const headerData = [
        [
          "Office/Section:" + "\n" + entry.officeSection || "________________",
          "PR No.: " +
          (entry.prNumber || "AUTO-GENERATED") +
          "\n" +
          "Responsibility Center Code: " +
          (entry.responsibilityCode || "________________"),
          "Date: " + (entry.date || "________________") + "\n",
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
      const tableData = entry.items.map((item) => [
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
      // Add note to the PDF
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

  return (
    <div className="container">
      <NavBar />
      {showSuccess && (
        <div className="alert alert-success border-success position-fixed appear-mid m-3" style={{ zIndex: 1000 }}>
          <div className="d-flex flex-column align-items-center md">
            <i className="bi bi-check-circle-fill me-2"></i>

            <lord-icon
              src="https://cdn.lordicon.com/fjvfsqea.json"
              trigger="in"
              state= "in-reveal"
              colors="primary:black,secondary:green"
              style={{ width: '150px', height: '150px' }}
            ></lord-icon>

            <br />
            <div>
              <h4 className="saved">Saved 
                <span className="check-ico ms-2">  
                  <lord-icon
                  src=" https://cdn.lordicon.com/hrtsficn.json"
                  trigger="in"
                  state= "in-reveal"
                  colors="primary:green"
                  style={{ width: '20px', height: '20px' }}
                ></lord-icon>
                </span>
              </h4>
            </div>
            <a className="visually-hidden" href="https://lordicon.com/">Icons by Lordicon.com</a>
          </div>
        </div>

      )}
      <form onSubmit={handleSubmit} className="container mt-2 p-1">
        <h2 className="text-center mb-4">Purchase Requisition Form</h2>
        <PrimaryInformationForm formData={formData} handleChange={handleChange} />
        <hr />
        <h4 className="mt-2">Item Details ({formData.items.length})</h4>
        <ItemDetails
          formData={formData}
          handleItemChange={handleItemChange}
          removeItem={removeItem}
          addItem={addItem}
        />
        <div className="d-flex gap-2 mt-3">
          <select
            className="form-select w-25"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="pdf">PDF (.pdf)</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Generate PR
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataForm;

