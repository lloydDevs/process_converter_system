import React, { useState, useCallback, useEffect } from "react";
import PrimaryInformationForm from "./PrimaryInformationForm";
import ItemDetails from "./ItemDetails/ItemDetails";
import "./DataForm.css";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable from "jspdf-autotable"; // Import autoTable
import chedLogo from "../assets/CHED-LOGO_orig.png";
import XlsxPopulate from "xlsx-populate";
import NavBar from "./NavBar/NavBar";

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
    note: "", // Add this line
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

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    },
    [formData]
  );

  const addItem = useCallback(() => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          stockNo: "",
          unit: "",
          itemDescription: "",
          quantity: "",
          unitCost: "",
        },
      ],
    });
  }, [formData]);

  const removeItem = useCallback(
    (index) => {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    },
    [formData]
  );

  const handleItemChange = useCallback(
    (index, e) => {
      const { name, value } = e.target;
      const newItems = [...formData.items];
      newItems[index][name] = value;
      setFormData({ ...formData, items: newItems });
    },
    [formData]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send data to the backend
    const response = await fetch("http://localhost:3001/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Entry created successfully:", result);
      setShowSuccess(true); 
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      console.error("Error creating entry:", response.statusText);
    }
    if (exportFormat === "xlsx") {
    } else {
      // PDF export logic using jsPDF for generating the document
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
          formData.fundCluster
            ? "Fund Cluster: " + formData.fundCluster
            : "Fund Cluster: _____________",
          130,
          fundClusterY
        );

        // Adjust the Y position for the table
        const tableStartY = fundClusterY + 2; // Add extra space after "Fund Cluster"

        const headerData = [
          [
            "Office/Section:" + "\n" + formData.officeSection ||
              "________________",
            "PR No.: " +
              (formData.prNumber || "AUTO-GENERATED") +
              "\n" +
              "Responsibility Center Code: " +
              (formData.responsibilityCode || "________________"),
            "Date: " + (formData.date || "________________") + "\n",
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
        const tableData = formData.items.map((item) => [
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
          body: [["", "", `${formData.note}`, "", "", ""]],
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
          body: [["Purpose:" + " " + formData.purpose || "N/A"]],
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
            ` ${formData.requestedBy || ""}`,
            `${formData.approvedBy ?? ""}`,
          ],
          [
            "Designation: ",
            ` ${formData.requestedByPosition || ""}`,
            `${formData.approvedByPosition ?? ""}`,
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
        doc.save(`${formData.filename || "purchase_request"}.pdf`);

        console.log("PDF generated successfully.");
      };
    }
  };

  const totalItems = formData.items.length;

  return (
    <div className="container ">
      <NavBar />
      {/* Success Notification */}
      {showSuccess && (
        <div
          className="alert alert-success position-fixed top-0 end-0 m-3"
          style={{ zIndex: 1000, animation: "fadeIn 0.5s" }}
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <span>Form successfully saved to database!</span>
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setShowSuccess(false)}
            ></button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="container mt-2 p-1 ">
        <h2 className="text-center mb-4">Purchase Requisition Form</h2>

        <PrimaryInformationForm
          formData={formData}
          handleChange={handleChange}
        />
        <hr />
        <h4 className="mt-2">Item Details ({totalItems}) </h4>
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
            <option value="xlsx">Excel (.xlsx)</option>
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
