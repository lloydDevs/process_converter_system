import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import config from '../config';

const POForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry, poData: initialPoData } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    const fetchPoCount = async () => {
      if (initialPoData?.po_number) return; // Skip if editing existing PO
      
      setIsLoading(true);
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
        console.error("Error fetching PO count:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoCount();
  }, [initialPoData]);

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
      const response = await fetch(`${config.API_BASE_URL}/api/po-data`, {
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
    <div className="container mt-3" style={{ maxWidth: '800px' }}>
      <Card>
        <Card.Header className="p-2 bg-primary text-white">
          <h4 className="mb-0">{initialPoData ? "Edit" : "Create"} Purchase Order</h4>
          <small className=" text-white">{entry.filename}</small>
        </Card.Header>

        <Card.Body className="p-2">
          {error && <Alert variant="danger" className="py-1">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
        <Row className="g-2">
          <Col md={6}>
            <Form.Group className="mb-1">
              <Form.Label className="small">PO Number</Form.Label>
              <Form.Control
                type="text"
                name="po_number"
                value={poData.po_number}
                onChange={handleChange}
                required
                disabled={isLoading}
                readOnly
                size="sm"
              />
              {isLoading && <small className="text-muted" style={{ fontSize: '0.7rem' }}>Generating PO number...</small>}
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="small">Supplier</Form.Label>
              <Form.Control
                type="text"
                name="supplier"
                value={poData.supplier}
                onChange={handleChange}
                required
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="small">Supplier Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="supplierAddress"
                value={poData.supplierAddress}
                onChange={handleChange}
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="small">Supplier TIN</Form.Label>
              <Form.Control
                type="text"
                name="supplierTIN"
                value={poData.supplierTIN}
                onChange={handleChange}
                size="sm"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-1">
              <Form.Label className="small">Mode of Procurement</Form.Label>
              <Form.Control
                type="text"
                name="modeOfProcurement"
                value={poData.modeOfProcurement}
                onChange={handleChange}
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="small">Place of Delivery</Form.Label>
              <Form.Control
                type="text"
                name="placeOfDelivery"
                value={poData.placeOfDelivery}
                onChange={handleChange}
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="small">Date of Delivery</Form.Label>
              <Form.Control
                type="date"
                name="dateOfDelivery"
                value={poData.dateOfDelivery}
                onChange={handleChange}
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="small">Delivery Term</Form.Label>
              <Form.Control
                type="text"
                name="deliveryTerm"
                value={poData.deliveryTerm}
                onChange={handleChange}
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label className="small">Payment Term</Form.Label>
              <Form.Control
                type="text"
                name="paymentTerm"
                value={poData.paymentTerm}
                onChange={handleChange}
                size="sm"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(-1)}
            size="sm"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : 'Save'}
          </Button>
        </div>
      </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default POForm;
