import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import chedLogo from "../assets/CHED-LOGO_orig.png";
import NavBar from "./NavBar/NavBar";
import { Modal, Button, Form } from "react-bootstrap";

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
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [poFormData, setPoFormData] = useState({
    supplier: "",
    supplierAddress: "",
    supplierTIN: "",
    modeOfProcurement: "",
    placeOfDelivery: "",
    dateOfDelivery: "",
    deliveryTerm: "",
    paymentTerm: "",
  });

  useEffect(() => {
    const fetchEntries = async (page = 1) => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/entries?page=${page}`
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
        `http://localhost:3001/api/entries?page=${page}`
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

  const handlePOFormChange = (e) => {
    const { name, value } = e.target;
    setPoFormData({
      ...poFormData,
      [name]: value,
    });
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
        // Assuming "Total Cost" is the 5th column (index 4)
        const cost = parseFloat(row[5]) || 0; // Convert to number, default to 0 if invalid
        return sum + cost;
      }, 0);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: [["", "", "", "", "Total:", totalCost.toFixed(2)]],
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
          "Requested by: ",
          ` ${entry.requestedBy || ""}`,
          `${entry.approvedBy ?? ""}`,
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
        `http://localhost:3001/api/entries/${entry.id}`,
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
      fetchEntries(data.pagination.page); // Refresh the data after deletion
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const generatePOPDF = () => {
    if (!selectedEntry) return;

    const img = new Image();
    img.src = chedLogo;

    img.onload = () => {
      const doc = new jsPDF();
      const filename = `${selectedEntry.filename.replace(".pdf", "")}_PO.pdf`;

      // Set initial position
      let yPos = 20;

      // Add CHED Logo
      doc.addImage(img, "PNG", 15, yPos, 20, 20);
      yPos += 5;

      // Header
      doc.setFontSize(14);
      doc.text("COMMISSION ON HIGHER EDUCATION", 105, yPos, {
        align: "center",
      });
      doc.text("MIMAROPA REGION", 105, yPos + 7, { align: "center" });
      doc.setFontSize(16);
      doc.text("PURCHASE ORDER", 105, yPos + 20, { align: "center" });
      yPos += 35;

      // Supplier Information Table
      autoTable(doc, {
        startY: yPos,
        body: [
          [
            {
              content: `Supplier: ${
                poFormData.supplier || "Manna's General Merchandise"
              }`,
              styles: { lineWidth: 0 },
            },
            {
              content: `TIN: ${poFormData.supplierTIN || "903-369-690-00000"}`,
              styles: { lineWidth: 0 },
            },
          ],
          [
            {
              content: `Address: ${
                poFormData.supplierAddress ||
                "05 Don Buenavista Santiago City, Isabela"
              }`,
              styles: { lineWidth: 0 },
            },
            {
              content: `R.O. No.: ${poFormData.roNumber || "2025-03-005"}`,
              styles: { lineWidth: 0 },
            },
          ],
          [
            {
              content: `Date: ${poFormData.date || "March 25, 2025"}`,
              styles: { lineWidth: 0 },
            },
            {
              content: `Mode of Procurement: ${
                poFormData.modeOfProcurement ||
                "Negotiated Procurement under Section 53.9"
              }`,
              styles: { lineWidth: 0 },
            },
          ],
        ],
        styles: {
          fontSize: 10,
          cellPadding: 1,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 95, lineWidth: 0 },
          1: { cellWidth: 95, lineWidth: 0 },
        },
        tableWidth: "wrap",
      });

      yPos = doc.lastAutoTable.finalY + 5;

      // Gentlemen section
      doc.setFontSize(10);
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.rect(15, yPos, 180, 15);
      doc.text("Gentlemen:", 20, yPos + 5);
      doc.text(
        "Please furnish this Office the following articles subject to the terms and conditions contained herein:",
        20,
        yPos + 10
      );

      yPos += 20;

      // Delivery information table
      autoTable(doc, {
        startY: yPos,
        body: [
          [
            {
              content: `Place of Delivery: ${
                poFormData.placeOfDelivery || "CHED Mimaropa"
              }`,
              styles: { lineWidth: 0 },
            },
            {
              content: `Date of Delivery: ${
                poFormData.dateOfDelivery || "______"
              }`,
              styles: { lineWidth: 0 },
            },
          ],
          [
            {
              content: `Delivery Term: ${poFormData.deliveryTerm || "______"}`,
              styles: { lineWidth: 0 },
            },
            {
              content: `Payment Term: ${poFormData.paymentTerm || "______"}`,
              styles: { lineWidth: 0 },
            },
          ],
        ],
        styles: {
          fontSize: 10,
          cellPadding: 1,
          lineWidth: 0,
        },
        columnStyles: {
          0: { cellWidth: 95, lineWidth: 0 },
          1: { cellWidth: 95, lineWidth: 0 },
        },
      });

      yPos = doc.lastAutoTable.finalY + 5;

      // Items Table
      const tableData = selectedEntry.items.map((item) => [
        item.stockNo || "",
        item.unit || "PC",
        {
          content: [
            {
              text: item.itemDescription || "Procurement of Monitor for IZN",
              styles: { fontStyle: "bold" },
            },
            '\n- at least 27" Full HD IPS display or higher specification',
            "\n- slim bezel display with at least 75Hz refresh rate",
            "\n- matte non-reflective display",
            "\n- design flicker free eye protection",
          ],
        },
        item.quantity || "2",
        item.unitCost ? parseFloat(item.unitCost).toFixed(2) : "8,500.00",
        item.quantity && item.unitCost
          ? (parseFloat(item.quantity) * parseFloat(item.unitCost)).toFixed(2)
          : "17,000.00",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [
          [
            "Stock/Proper",
            "Unit",
            "Description",
            "Quantity",
            "Unit Cost",
            "Amount",
          ],
        ],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [242, 242, 242],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0.1,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 20, halign: "center" },
          1: { cellWidth: 15, halign: "center" },
          2: { cellWidth: 70 },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 25, halign: "right" },
          5: { cellWidth: 25, halign: "right" },
        },
      });

      yPos = doc.lastAutoTable.finalY + 5;

      // Total Amount in Words
      const total = tableData.reduce(
        (sum, row) => sum + parseFloat(row[5].replace(/,/g, "") || 0),
        0
      );
      const amountInWords = numberToWords(total) + " Pesos Only";

      autoTable(doc, {
        startY: yPos,
        body: [
          [
            { content: "Total Amount in Words", styles: { fontStyle: "bold" } },
            { content: amountInWords, styles: { fontStyle: "normal" } },
          ],
        ],
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 130 },
        },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Terms and Conforme Section
      autoTable(doc, {
        startY: yPos,
        body: [
          [
            {
              content: [
                "In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed on the undelivered item/s.",
                "\n\nConforme:",
                "\n\n_________________________",
                "\nSignature over Printed Name of Supplier",
                "\nDate",
              ],
              styles: { lineWidth: 0 },
            },
            {
              content: [
                "ALDWIN C. AVES",
                "Accountant III",
                "Signature over Printed Name of Chief Accountant/Head of Accounting Division/Unit",
              ],
              styles: { lineWidth: 0, halign: "left" },
            },
          ],
        ],
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 95, lineWidth: 0 },
          1: { cellWidth: 95, lineWidth: 0 },
        },
      });

      yPos = doc.lastAutoTable.finalY + 20;

      // Signature Lines
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 80, yPos);
      doc.text("Very truly yours.", 20, yPos + 10);

      yPos += 30;
      doc.line(15, yPos, 80, yPos);
      doc.text("EDNA IMELDA T. LEGAZPI", 20, yPos + 10);
      doc.text(
        "Signature over Printed Name of Authorized Official Director of Designation",
        20,
        yPos + 15
      );

      yPos += 30;
      doc.text(`ORB/BURS No.: ${poFormData.orbBursNo || "______"}`, 20, yPos);
      doc.text(
        `Date of the ORB/BURS: ${poFormData.orbBursDate || "______"}`,
        20,
        yPos + 5
      );
      doc.text(`Amount: ${total.toFixed(2)}`, 20, yPos + 10);

      doc.save(filename);
      setShowPOModal(false);
    };
  };

  // Helper function to convert numbers to words (you'll need to implement this or use a library)
  function numberToWords(num) {
    // Implement number to words conversion or use a library
    // This is a simplified version - you might want to use a proper library
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );

    // For simplicity, this handles up to thousands - you might need more complex logic
    return "Seventeen Thousand"; // Placeholder - implement proper conversion
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
    <div className="container mt-4 d-flex flex-column align-items-center">
      <NavBar />
      {/* Success Notification */}
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
      <h2 className="mb-4">Saved Entries</h2>
      {data.entries.length === 0 ? (
        <div className="alert alert-info">No saved entries found</div>
      ) : (
        <>
          <table className="table table-striped table-hover table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Filename</th>
                <th>PR Number</th>
                <th>Date</th>
                <th style={{ textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.filename}</td>
                  <td>{entry.prNumber || "N/A"}</td>
                  <td>{formatDate(entry.date) || "N/A"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => generatePR(entry)}
                      className="btn btn-outline-primary btn-sm me-1"
                    >
                      Generate PR
                    </button>
                    <button
                      onClick={() => handleGeneratePO(entry)}
                      className="btn btn-primary btn-sm me-1"
                    >
                      Generate PO
                    </button>
                    <button
                      onClick={() => view(entry)}
                      className="btn btn-no-outline btn-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#1f1f1f"
                      >
                        <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setClicked(entry)}
                      className="btn btn-no-outline btn-sm me-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#EA3323"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
                  <Form.Label>Supplier Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={poFormData.supplier}
                    onChange={handlePOFormChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Supplier Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplierAddress"
                    value={poFormData.supplierAddress}
                    onChange={handlePOFormChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Supplier TIN</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplierTIN"
                    value={poFormData.supplierTIN}
                    onChange={handlePOFormChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Mode of Procurement</Form.Label>
                  <Form.Control
                    as="select"
                    name="modeOfProcurement"
                    value={poFormData.modeOfProcurement}
                    onChange={handlePOFormChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Public Bidding">Public Bidding</option>
                    <option value="Negotiated Procurement">
                      Negotiated Procurement
                    </option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Place of Delivery</Form.Label>
                  <Form.Control
                    type="text"
                    name="placeOfDelivery"
                    value={poFormData.placeOfDelivery}
                    onChange={handlePOFormChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Date of Delivery</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfDelivery"
                    value={formatDate(poFormData.dateOfDelivery)}
                    onChange={handlePOFormChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Delivery Term</Form.Label>
                  <Form.Control
                    type="text"
                    name="deliveryTerm"
                    value={poFormData.deliveryTerm}
                    onChange={handlePOFormChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Payment Term</Form.Label>
                  <Form.Control
                    type="text"
                    name="paymentTerm"
                    value={poFormData.paymentTerm}
                    onChange={handlePOFormChange}
                    required
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPOModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={generatePOPDF}>
                Generate PO
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            size="md"
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
        </>
      )}
    </div>
  );
};

export default SavedEntries;
