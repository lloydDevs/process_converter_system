import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const POForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry, poData: initialPoData } = location.state || {};
  const [poData, setPoData] = useState(initialPoData || {
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
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPoData({
      ...poData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/po-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...poData,
          entry_id: entry.id,
          items: entry.items
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      navigate("/po-view", { state: { entry } });
    } catch (err) {
      console.error("Error saving PO data:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entry) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">No entry data found</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>{initialPoData ? "Edit" : "Create"} Purchase Order</h2>
      <h4>{entry.filename}</h4>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>PO Number</Form.Label>
              <Form.Control
                type="text"
                name="po_number"
                value={poData.po_number}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Control
                type="text"
                name="supplier"
                value={poData.supplier}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Supplier Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="supplierAddress"
                value={poData.supplierAddress}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Supplier TIN</Form.Label>
              <Form.Control
                type="text"
                name="supplierTIN"
                value={poData.supplierTIN}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Mode of Procurement</Form.Label>
              <Form.Control
                type="text"
                name="modeOfProcurement"
                value={poData.modeOfProcurement}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Place of Delivery</Form.Label>
              <Form.Control
                type="text"
                name="placeOfDelivery"
                value={poData.placeOfDelivery}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Delivery</Form.Label>
              <Form.Control
                type="date"
                name="dateOfDelivery"
                value={poData.dateOfDelivery}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Delivery Term</Form.Label>
              <Form.Control
                type="text"
                name="deliveryTerm"
                value={poData.deliveryTerm}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Term</Form.Label>
              <Form.Control
                type="text"
                name="paymentTerm"
                value={poData.paymentTerm}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save PO Data"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default POForm;
