import React from "react";

const PrimaryInformationForm = ({ formData, handleChange }) => {
  return (
    <div>
      <h4>Primary Information</h4>
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label>Office Section:</label>
            <input
              type="text"
              name="officeSection"
              value={formData.officeSection}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label>Fund Cluster:</label>
            <input
              type="text"
              name="fundCluster"
              value={formData.fundCluster}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label>Responsibility Code:</label>
            <input
              type="text"
              name="responsibilityCode"
              value={formData.responsibilityCode}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label>Purpose:</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label>Requested By:</label>
            <input
              type="text"
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label>Approved By:</label>
            <input
              type="text"
              name="approvedBy"
              value={formData.approvedBy}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label>Requested By Position:</label>
            <input
              type="text"
              name="requestedByPosition"
              value={formData.requestedByPosition}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label>Approved By Position:</label>
            <input
              type="text"
              name="approvedByPosition"
              value={formData.approvedByPosition}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label>Filename:</label>
            <input
              type="text"
              name="filename"
              value={formData.filename}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label>PR Number:</label>
            <input
              type="text"
              name="prNumber"
              value={formData.prNumber}
              onChange={handleChange}
              readOnly
              className="form-control"
            />
          </div>
        </div>
      <div className="col-4">
        <div className="form-group">
          <label>Note:</label>
          <input
            type="text"
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="form-control"
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default PrimaryInformationForm;
