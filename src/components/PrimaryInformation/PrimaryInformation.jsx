import React, { useCallback } from "react";

const PrimaryInformation = ({ formData, handleChange }) => {
    return (
        <div className="row">
            <div className="col-md-4 mb-2 d-flex justify-content-center">
                <label className="form-label text-center">Filename:</label>
                <input
                    type="text"
                    name="filename"
                    className="form-control w-75"
                    value={formData.filename}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-4 mb-2 d-flex justify-content-center">
                <label className="form-label text-center">Office/Section:</label>
                <input
                    type="text"
                    name="officeSection"
                    className="form-control w-75"
                    value={formData.officeSection}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-4 mb-2 d-flex justify-content-center">
                <label className="form-label text-center">Date:</label>
                <input
                    type="date"
                    name="date"
                    className="form-control w-75"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-4 mb-2 d-flex justify-content-center">
                <label className="form-label text-center">Requested By:</label>
                <input
                    type="text"
                    name="requestedBy"
                    className="form-control w-75"
                    value={formData.requestedBy}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-4 mb-2 d-flex justify-content-center">
                <label className="form-label text-center">Requested By Position:</label>
                <input
                    type="text"
                    name="requestedByPosition"
                    className="form-control w-75"
                    value={formData.requestedByPosition}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-4 mb-2 d-flex justify-content-center">
                <label className="form-label text-center">Approved By:</label>
                <input
                    type="text"
                    name="approvedBy"
                    className="form-control w-75"
                    value={formData.approvedBy}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-4 mb-2 d-flex justify-content-center">
                <label className="form-label text-center">Approved By Position:</label>
                <input
                    type="text"
                    name="approvedByPosition"
                    className="form-control w-75"
                    value={formData.approvedByPosition}
                    onChange={handleChange}
                    required
                />
            </div>
        </div>
    );
};

export default PrimaryInformation;
