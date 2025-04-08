import React, { useState, useCallback } from "react";
import PrimaryInformationForm from "./PrimaryInformationForm";
import ItemDetails from "./ItemDetails/ItemDetails";
import "./DataForm.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import chedLogo from "../assets/CHED-LOGO_orig.png";
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
      const entryResponse = await fetch("http://localhost:3001/api/entries", {
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
      const img = new Image();
      img.src = chedLogo;

      img.onload = () => {
        const doc = new jsPDF();
        // ... rest of the PDF generation code remains unchanged ...
        doc.save(`${formData.filename || "purchase_request"}.pdf`);
      };
    }
  };

  return (
    <div className="container">
      <NavBar />
      {showSuccess && (
        <div className="alert alert-success position-fixed top-0 end-0 m-3" style={{ zIndex: 1000 }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <span>Form successfully saved to database!</span>
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
