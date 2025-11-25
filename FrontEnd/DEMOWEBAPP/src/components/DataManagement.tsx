import { Link } from "react-router-dom";

const DataManagement = () => {
  return (
    <div className="data-section">
      <h2>Data Management</h2>
      <p>
In the Data Management section, you can easily upload and download CSV files. Once analyzed, AnaWeb provides a clear summary of your data along with a preview for quick inspection. You can then edit your CSV using powerful tools  including conditional edits, adding new columns, filtering data, and keeping a complete log of changes  making data management efficient and transparent.
      </p>
      <Link to="/data" className="data-btn">Go to Data Management</Link>
    </div>
  );
};

export default DataManagement;
