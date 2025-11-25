import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/global.css";

interface Analysis {
  rows: number;
  columns: number;
  column_names: string[];
  column_types: Record<string, string>;
  missing_values: Record<string, number>;
  missing_percentage: Record<string, number>;
  unique_values: Record<string, number>;
  top_values: Record<string, Record<string, number>>;
  numeric_stats: Record<string, Record<string, number>> | null;
  preview: Record<string, any>[];
}

const DataPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setAnalysis(null);
    setError(null);
    setSelectedCols([]);
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Please choose a file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setAnalysis(null);
      } else {
        setAnalysis(data as Analysis);
        setSelectedCols(data.column_names);
      }
    } catch {
      setError("Failed to analyze file");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!analysis) return;
    const csvContent = [
      selectedCols.join(","),
      ...analysis.preview.map((row) =>
        selectedCols.map((col) => row[col]).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cleaned_data.csv";
    link.click();
  };

  const handleEditCSV = () => {
    if (!file) return;
    navigate("/edit-csv", { state: { file } });
  };

  return (
    <div className="datapage-container">
      <div className="upload-card">
        <h2>Upload CSV/Excel File</h2>

        <div className="file-input-wrapper">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) =>
              handleFileChange(e.target.files ? e.target.files[0] : null)
            }
          />
          <div
            className="choose-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </div>
        </div>

        {file && <p className="selected-file">Selected: {file.name}</p>}

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="analyze-btn"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {file && (
          <button onClick={handleEditCSV} className="edit-btn">
            Edit CSV
          </button>
        )}

        {analysis && (
          <button onClick={handleDownload} className="download-btn">
            Download CSV
          </button>
        )}

        {error && <p className="error-text">Error: {error}</p>}
      </div>

      {analysis && (
        <div className="analysis-grid">
          <div className="top-cards">
            <div className="card">
              <p>Rows</p>
              <p>{analysis.rows}</p>
            </div>
            <div className="card">
              <p>Columns</p>
              <p>{analysis.columns}</p>
            </div>
            <div className="card">
              <p>Total Missing</p>
              <p>
                {Object.values(analysis.missing_values).reduce(
                  (a, b) => a + b,
                  0
                )}
              </p>
            </div>
          </div>

          <div className="card">
            <h4>Missing Values (%)</h4>
            {Object.entries(analysis.missing_percentage).map(([col, percent]) => (
              <p key={col}>
                <strong>{col}</strong>: {percent}%
              </p>
            ))}
          </div>

          <div className="card">
            <h4>Unique Values Count</h4>
            {Object.entries(analysis.unique_values).map(([col, count]) => (
              <p key={col}>
                <strong>{col}</strong>: {count}
              </p>
            ))}
          </div>

          <div className="card">
            <h4>Top Values</h4>
            {Object.entries(analysis.top_values).map(([col, values]) => (
              <div key={col}>
                <strong>{col}</strong>:{" "}
                {Object.entries(values)
                  .map(([val, count]) => `${val} (${count})`)
                  .join(", ")}
              </div>
            ))}
          </div>

          {analysis.numeric_stats && (
            <div className="card">
              <h4>Numeric Column Statistics</h4>
              {Object.entries(analysis.numeric_stats).map(([col, stats]) => (
                <div key={col}>
                  <strong>{col}</strong>: Mean={stats.mean?.toFixed(2)}, Median={
                    stats["50%"]?.toFixed(2)
                  }, Min={stats.min}, Max={stats.max}, Std={stats.std?.toFixed(2)}
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <label>
              <strong>Select Columns to Preview:</strong>
            </label>
            <div className="column-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={selectedCols.length === analysis.column_names.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCols([...analysis.column_names]);
                    } else {
                      setSelectedCols([]);
                    }
                  }}
                />
                <strong>Select All</strong>
              </label>
              {analysis.column_names.map((col) => (
                <label key={col}>
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCols((prev) => [...prev, col]);
                      } else {
                        setSelectedCols((prev) =>
                          prev.filter((c) => c !== col)
                        );
                      }
                    }}
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>

          <div className="card overflow-auto">
            <h4>Preview (first 5 rows)</h4>
            <table>
              <thead>
                <tr>
                  {selectedCols.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysis.preview.map((row, idx) => (
                  <tr key={idx}>
                    {selectedCols.map((col) => (
                      <td key={col}>{String(row[col] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPage;
