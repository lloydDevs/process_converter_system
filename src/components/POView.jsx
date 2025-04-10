import React, { useState, useEffect } from "react";
import { Button, Table, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import config from '../config';

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
          `${config.API_BASE_URL}/api/po-data?entry_id=${entry.id}`
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
                        size="md"
                        onClick={() => navigate('/create-po', { state: { entry } })}
                        className="fw-bold"
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create New Purchase Order
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="md"
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
            <h5 className="mb-0">Purchase Order View</h5>
          </div>
          <div className="card-body">
            <h6 className="text-muted">{entry.filename}.pdf</h6>
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-excel display-4 text-warning mb-3"></i>
              <h3>No Purchase Order Found</h3>
              <p className="lead">
                This request doesn't have an associated Purchase Order yet.
              </p>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button 
                  variant="warning"
                  size="md"
                  onClick={() => navigate('/create-po', { state: { entry } })}
                  className="fw-bold"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Purchase Order
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="md"
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

  const generatePOPDF = () => {
    const img = new Image();
    img.src = "/src/assets/CHED-LOGO_orig.png";

    img.onload = () => {
      const doc = new jsPDF();
      const filename = `${entry.filename.replace(".pdf", "")}_PO.pdf`;
      
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
      ];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY, 
        body: subhead,
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
          0: { cellWidth: 115 },
          1: { cellWidth: 70 }
        },
      });

      // Table Data
      const tableData = items.map((item) => [
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
            "Stock/Property No.",
            "Unit",
            "Item Description",
            "Quantity",
            "Unit Cost",
            "Total Cost",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
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

      const totalCost = tableData.reduce((sum, row) => {
        const cost = parseFloat(row[5]) || 0;
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
      
            const maxLength = 30; // Adjust this based on your column width
      
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
    };
  };

  const handleGeneratePO = () => {
    generatePOPDF();
  };

  // Helper function to convert numbers to words
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

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-0">
                <i className="bi bi-file-earmark-text"></i>
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
                        variant="btn-outline-danger"
                        size="sm"
                        onClick={() => handleDeleteItem(index)}
                      >
                        <i className="bi bi-trash me-1"></i> 
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
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
