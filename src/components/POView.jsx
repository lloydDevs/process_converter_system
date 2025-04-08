import React, { useState, useEffect } from "react";
import { Button, Table, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const POView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state || {};
  const [items, setItems] = useState(entry?.items || []);
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoData = async () => {
      if (!entry?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/po-data?entry_id=${entry.id}`
        );
        
        if (!response.ok) {
          return (
            <div className="container mt-4">
              <div className="card border-warning">
                <div className="card-header bg-warning text-white">
                  <h2 className="mb-0">Purchase Order View</h2>
                </div>
                <div className="card-body">
                  <h4 className="text-muted">{entry.filename}</h4>
                  <div className="text-center py-4">
                    <i className="bi bi-file-earmark-excel display-4 text-warning mb-3"></i>
                    <h3>No Purchase Order Found</h3>
                    <p className="lead">
                      This request doesn't have an associated Purchase Order yet.
                    </p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                      <Button 
                        variant="warning"
                        size="lg"
                        onClick={() => navigate('/create-po', { state: { entry } })}
                        className="fw-bold"
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create New Purchase Order
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="lg"
                        onClick={() => navigate(-1)}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to List
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const { poData } = await response.json();
        setPoData(poData || {
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
      } catch (err) {
        console.error("Error fetching PO data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoData();
  }, [entry?.id]);

  if (!entry) {
    return <div className="container mt-4">No entry data found</div>;
  }

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">Error loading PO data: {error}</Alert>
      </div>
    );
  }

  if (!poData || Object.values(poData).every(val => !val)) {
    return (
      <div className="container mt-4">
        <div className="card border-warning">
          <div className="card-header bg-warning text-white">
            <h2 className="mb-0">Purchase Order View</h2>
          </div>
          <div className="card-body">
            <h4 className="text-muted">{entry.filename}</h4>
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-excel display-4 text-warning mb-3"></i>
              <h3>No Purchase Order Found</h3>
              <p className="lead">
                This request doesn't have an associated Purchase Order yet.
              </p>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button 
                  variant="warning"
                  size="lg"
                  onClick={() => navigate('/create-po', { state: { entry } })}
                  className="fw-bold"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Purchase Order
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="lg"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handlePoDataChange = (e) => {
    const { name, value } = e.target;
    setPoData({
      ...poData,
      [name]: value
    });
  };

  const handleGeneratePO = () => {
    // Filter out deleted items and generate PO
    const updatedEntry = {
      ...entry,
      items: items
    };
    // Here you would typically call an API to generate the PO
    console.log("Generating PO with items:", items);
    // Then navigate back or show success message
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Purchase Order View
              </h3>
              <small className="text-white-50 d-block">{entry.filename}</small>
            </div>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </Button>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    <i className="bi bi-123 me-2"></i>
                    PO Number
                  </h6>
                  <p className="card-text ms-2">
                    {poData.po_number || <span className="text-muted">Not specified</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    <i className="bi bi-building me-2"></i>
                    Supplier
                  </h6>
                  <p className="card-text ms-2">
                    {poData.supplier || <span className="text-muted">Not specified</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    <i className="bi bi-gear me-2"></i>
                    Procurement Mode
                  </h6>
                  <p className="card-text ms-2">
                    {poData.modeOfProcurement || <span className="text-muted">Not specified</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h5 className="mb-3 text-primary">
            <i className="bi bi-list-check me-2"></i>
            Items
          </h5>
          <div className="table-responsive">
            <Table striped bordered hover className="align-middle">
              <thead>
                <tr>
                  <th>Stock No.</th>
                  <th>Unit</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.stockNo || "-"}</td>
                    <td>{item.unit || "-"}</td>
                    <td>{item.itemDescription || "-"}</td>
                    <td>{item.quantity || 0}</td>
                    <td>{item.unitCost || 0}</td>
                    <td>{(parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteItem(index)}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="d-flex justify-content-between mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </Button>
            <div>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/edit-po', { state: { entry, poData } })}
                className="me-2"
              >
                <i className="bi bi-pencil-square me-1"></i> Edit PO
              </Button>
              <Button 
                variant="success" 
                onClick={handleGeneratePO}
              >
                <i className="bi bi-file-earmark-pdf me-1"></i> Generate PO Document
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POView;
