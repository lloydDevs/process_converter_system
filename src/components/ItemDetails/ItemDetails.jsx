import React, { useState } from "react";
import './ItemDetails.css';

const ItemDetails = ({ formData, handleItemChange, removeItem, addItem }) => {
    const [hoverIndex, setHoverIndex] = useState(null);

    return (
        <div>
            {formData.items.map((item, index) => (
                <div className="row mb-3"
                    key={index}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                >
                    <div className="col-2">
                        <label className="form-label">Stock No:</label>
                        <input
                            type="text"
                            name="stockNo"
                            className="form-control"
                            value={item.stockNo}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>
                    <div className="col-2">
                        <label className="form-label">Unit:</label>
                        <input
                            type="text"
                            name="unit"
                            className="form-control"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>
                    <div className="col-4">
                        <label className="form-label">Item Description:</label>
                        <input
                            type="text"
                            name="itemDescription"
                            className="form-control"
                            value={item.itemDescription}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>
                    <div className="col-1">
                        <label className="form-label">Quantity:</label>
                        <input
                            type="number"
                            name="quantity"
                            className="form-control"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>
                    <div className="col-2">
                        <label className="form-label">Unit Cost:</label>
                        <input
                            type="number"
                            name="unitCost"
                            className="form-control"
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>

                    <div className="col-1 d-flex align-items-end">
                        {formData.items.length > 1 && (
                            <button
                                type="button"
                                className={`btn action-btn ${hoverIndex === index ? 'show' : ''}`}
                                onClick={() => removeItem(index)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#EA3323"><path d="M342.22-280 480-417.78 617.78-280 680-342.22 542.22-480 680-617.78 617.78-680 480-542.22 342.22-680 280-617.78 417.78-480 280-342.22 342.22-280ZM480-60.78q-87.52 0-163.91-32.96-76.38-32.96-132.88-89.47-56.51-56.5-89.47-132.88Q60.78-392.48 60.78-480t32.96-163.91q32.96-76.38 89.47-132.88 56.5-56.51 132.88-89.47 76.39-32.96 163.91-32.96t163.91 32.96q76.38 32.96 132.88 89.47 56.51 56.5 89.47 132.88 32.96 76.39 32.96 163.91t-32.96 163.91q-32.96 76.38-89.47 132.88-56.5 56.51-132.88 89.47Q567.52-60.78 480-60.78Zm0-106q131.74 0 222.48-90.74 90.74-90.74 90.74-222.48t-90.74-222.48Q611.74-793.22 480-793.22t-222.48 90.74Q166.78-611.74 166.78-480t90.74 222.48q90.74 90.74 222.48 90.74ZM480-480Z"/></svg>
                            </button>
                        )}

                        {formData.items.length === index + 1 && (
                            <button
                                type="button"
                                className={`btn action-btn ${hoverIndex === index ? 'show' : ''}`}
                                onClick={addItem}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#007a0e"><path d="M435.48-275.48h89.04v-160h160v-89.04h-160v-160h-89.04v160h-160v89.04h160v160ZM480-60.78q-87.52 0-163.91-32.96-76.38-32.96-132.88-89.47-56.51-56.5-89.47-132.88Q60.78-392.48 60.78-480t32.96-163.91q32.96-76.38 89.47-132.88 56.5-56.51 132.88-89.47 76.39-32.96 163.91-32.96t163.91 32.96q76.38 32.96 132.88 89.47 56.51 56.5 89.47 132.88 32.96 76.39 32.96 163.91t-32.96 163.91q-32.96 76.38-89.47 132.88-56.5 56.51-132.88 89.47Q567.52-60.78 480-60.78Zm0-106q131.74 0 222.48-90.74 90.74-90.74 90.74-222.48t-90.74-222.48Q611.74-793.22 480-793.22t-222.48 90.74Q166.78-611.74 166.78-480t90.74 222.48q90.74 90.74 222.48 90.74ZM480-480Z"/></svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ItemDetails;