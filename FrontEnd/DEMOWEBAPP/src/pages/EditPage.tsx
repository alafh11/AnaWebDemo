import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../style/global.css";

interface CSVRow {
  [key: string]: any;
}

const MAX_PREVIEW_ROWS = 50;

const EditPage = () => {
  const location = useLocation();
  const file = location.state?.file as File | undefined;

  const [data, setData] = useState<CSVRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [newColName, setNewColName] = useState<string>("");
  const [formula, setFormula] = useState<string>("");

  const [pendingRow, setPendingRow] = useState<CSVRow | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const [conditionCol, setConditionCol] = useState("");
  const [conditionOp, setConditionOp] = useState("=");
  const [conditionVal, setConditionVal] = useState("");
  const [trueVal, setTrueVal] = useState("");
  const [falseVal, setFalseVal] = useState("");

  const [filters, setFilters] = useState<{ [col: string]: string }>({});

  const getTimestamp = () => {
    const now = new Date();
    return `[${now.toLocaleDateString()} ${now.toLocaleTimeString()}]`;
  };

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
      if (lines.length === 0) return;

      const headers = lines[0].split(",");
      setColumns(headers);
      setSelectedCols([...headers]);

      const rows = lines.slice(1).map((line) => {
        const values = line.split(",");
        const row: CSVRow = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ?? "";
        });
        return row;
      });
      setData(rows);
      setLogs([`${getTimestamp()} Loaded file: ${file.name}`]);
    };
    reader.readAsText(file);
  }, [file]);

  if (!file) {
    return (
      <div className="datapage-container">
        <h2>Edit CSV</h2>
        <p>No file selected. Go back to upload page.</p>
      </div>
    );
  }

  const addColumn = () => {
    if (!newColName) return;
    let newData = [...data];

    if (formula.trim()) {
      newData = newData.map((row) => {
        let expr = formula;
        for (const col of columns) {
          const val = row[col];
          const safeVal =
            typeof val === "number" || !isNaN(Number(val))
              ? val
              : `"${String(val).replace(/"/g, '\\"')}"`;
          expr = expr.replace(new RegExp(`\\b${col}\\b`, "g"), safeVal);
        }
        let result: any = "";
        try {
          result = eval(expr);
        } catch {
          result = "ERR";
        }
        return { ...row, [newColName]: result };
      });
    } else {
      newData = newData.map((row) => ({ ...row, [newColName]: "" }));
    }

    setColumns((prev) => [...prev, newColName]);
    setSelectedCols((prev) => [...prev, newColName]);
    setData(newData);
    setLogs((prev) => [...prev, `${getTimestamp()} Added column: ${newColName}`]);
    setNewColName("");
    setFormula("");
  };

  const addConditionalColumn = () => {
    if (!newColName || !conditionCol) return;

    const newData = data.map((row) => {
      let result: any = "";
      try {
        const cell = row[conditionCol];
        const valNum = parseFloat(conditionVal);
        const cellNum = parseFloat(cell);

        let conditionMet = false;
        switch (conditionOp) {
          case "=":
            conditionMet = String(cell) === conditionVal; break;
          case "!=":
            conditionMet = String(cell) !== conditionVal; break;
          case ">":
            conditionMet = !isNaN(cellNum) && cellNum > valNum; break;
          case "<":
            conditionMet = !isNaN(cellNum) && cellNum < valNum; break;
          case ">=":
            conditionMet = !isNaN(cellNum) && cellNum >= valNum; break;
          case "<=":
            conditionMet = !isNaN(cellNum) && cellNum <= valNum; break;
        }
        result = conditionMet ? trueVal : falseVal;
      } catch {
        result = "ERR";
      }
      return { ...row, [newColName]: result };
    });

    setColumns((prev) => [...prev, newColName]);
    setSelectedCols((prev) => [...prev, newColName]);
    setData(newData);
    setLogs((prev) => [
      ...prev,
      `${getTimestamp()} Added conditional column: ${newColName}`
    ]);

    setNewColName("");
    setConditionCol("");
    setConditionOp("=");
    setConditionVal("");
    setTrueVal("");
    setFalseVal("");
  };

  const dropColumns = () => {
    setColumns((prev) => prev.filter((c) => !selectedCols.includes(c)));
    setData((prev) =>
      prev.map((row) => {
        selectedCols.forEach((c) => delete row[c]);
        return row;
      })
    );
    setLogs((prev) => [
      ...prev,
      `${getTimestamp()} Dropped columns: ${selectedCols.join(", ")}`
    ]);
    setSelectedCols([]);
  };

  const startAddRow = () => {
    const emptyRow = Object.fromEntries(columns.map((c) => [c, ""]));
    setPendingRow(emptyRow);
  };

  const savePendingRow = () => {
    if (!pendingRow) return;
    setData((prev) => [...prev, pendingRow]);
    setLogs((prev) => [...prev, `${getTimestamp()} Added a new row`]);
    setPendingRow(null);
  };

  const cancelPendingRow = () => setPendingRow(null);

  const deleteRows = () => {
    setData((prev) => prev.filter((_, idx) => !selectedRows.includes(idx)));
    setLogs((prev) => [
      ...prev,
      `${getTimestamp()} Deleted rows: ${selectedRows.map((r) => r + 1).join(", ")}`
    ]);
    setSelectedRows([]);
  };

  const downloadCSV = () => {
    const csvContent = [
      columns.join(","),
      ...data.map((row) => columns.map((col) => row[col] ?? "").join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `edited_${file.name}`;
    link.click();

    setLogs((prev) => [...prev, `${getTimestamp()} Downloaded edited CSV`]);
  };

  const downloadLogs = () => {
    const logContent = logs.join("\n");
    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${file.name.replace(".csv", "")}.txt`;
    link.click();

    setLogs((prev) => [...prev, `${getTimestamp()} Downloaded logs file`]);
  };

  const filteredData = data.filter((row) =>
    Object.keys(filters).every(
      (col) => !filters[col] || filters[col] === "All" || String(row[col]) === filters[col]
    )
  );

  const previewData = filteredData.slice(0, MAX_PREVIEW_ROWS);

  return (
    <div className="datapage-container">
      <h2>Edit CSV: {file.name}</h2>

      {/* Operations */}
      <div className="edit-operations">
        <input
          type="text"
          placeholder="New column name"
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Formula (optional)"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
        />
        <button className="edit-btn" onClick={addColumn} disabled={!newColName}>
          Add Column
        </button>
        <button
          className="edit-btn"
          onClick={dropColumns}
          disabled={selectedCols.length === 0}
        >
          Drop Selected Columns
        </button>
        <button className="edit-btn" onClick={startAddRow}>
          Add Row
        </button>
        <button
          className="edit-btn"
          onClick={deleteRows}
          disabled={selectedRows.length === 0}
        >
          Delete Selected Rows
        </button>
        <button className="download-btn" onClick={downloadCSV}>
          Download CSV
        </button>
        <button className="download-btn" onClick={downloadLogs}>
          Download Logs
        </button>
      </div>

      <div className="conditional-col-builder">
        <h3>Add Conditional Column</h3>
        <input
          type="text"
          placeholder="New column name"
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
        />
        <select value={conditionCol} onChange={(e) => setConditionCol(e.target.value)}>
          <option value="">Select column</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
        <select value={conditionOp} onChange={(e) => setConditionOp(e.target.value)}>
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
        </select>
        <input
          type="text"
          placeholder="Compare value"
          value={conditionVal}
          onChange={(e) => setConditionVal(e.target.value)}
        />
        <input
          type="text"
          placeholder="Value if true"
          value={trueVal}
          onChange={(e) => setTrueVal(e.target.value)}
        />
        <input
          type="text"
          placeholder="Value if false"
          value={falseVal}
          onChange={(e) => setFalseVal(e.target.value)}
        />
        <button
          className="edit-btn"
          onClick={addConditionalColumn}
          disabled={!newColName || !conditionCol}
        >
          Add Conditional Column
        </button>
      </div>

      {pendingRow && (
        <div className="new-row-editor">
          <h3>Fill New Row</h3>
          <div className="new-row-inputs">
            {columns.map((col) => (
              <div key={col} className="input-group">
                <label>{col}</label>
                <input
                  type="text"
                  value={pendingRow[col]}
                  onChange={(e) =>
                    setPendingRow((prev) =>
                      prev ? { ...prev, [col]: e.target.value } : null
                    )
                  }
                />
              </div>
            ))}
          </div>
          <div className="new-row-actions">
            <button className="edit-btn" onClick={savePendingRow}>
              Save Row
            </button>
            <button className="download-btn" onClick={cancelPendingRow}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="column-checkboxes">
        <label>
          <input
            type="checkbox"
            checked={selectedCols.length === columns.length}
            onChange={(e) => {
              if (e.target.checked) setSelectedCols([...columns]);
              else setSelectedCols([]);
            }}
          />
          <strong>Select All Columns</strong>
        </label>
        {columns.map((col) => (
          <label key={col}>
            <input
              type="checkbox"
              checked={selectedCols.includes(col)}
              onChange={(e) => {
                if (e.target.checked) setSelectedCols((prev) => [...prev, col]);
                else setSelectedCols((prev) => prev.filter((c) => c !== col));
              }}
            />
            {col}
          </label>
        ))}
      </div>

      {/* Editable Table */}
      <div className="card overflow-auto" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              {columns
                .filter((c) => selectedCols.includes(c))
                .map((col) => (
                  <th key={col}>{col}</th>
                ))}
              <th>Select Row</th>
            </tr>

            <tr>
              <th></th>
              {columns
                .filter((c) => selectedCols.includes(c))
                .map((col) => (
                  <th key={`filter-${col}`}>
                    <select
                      value={filters[col] || "All"}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, [col]: e.target.value }))
                      }
                    >
                      <option value="All">All</option>
                      {[...new Set(data.map((row) => row[col]))].map((val, idx) => (
                        <option key={idx} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </th>
                ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td>{rowIdx + 1}</td>
                {columns
                  .filter((c) => selectedCols.includes(c))
                  .map((col) => (
                    <td
                      key={col}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newData = [...data];
                        newData[rowIdx][col] = e.currentTarget.textContent ?? "";
                        setData(newData);
                        setLogs((prev) => [
                          ...prev,
                          `${getTimestamp()} Edited row ${rowIdx + 1}, column "${col}"`
                        ]);
                      }}
                    >
                      {row[col]}
                    </td>
                  ))}
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIdx)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedRows((prev) => [...prev, rowIdx]);
                      else
                        setSelectedRows((prev) =>
                          prev.filter((i) => i !== rowIdx)
                        );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length > MAX_PREVIEW_ROWS && (
          <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
            Showing first {MAX_PREVIEW_ROWS} rows out of {filteredData.length}.
          </p>
        )}
      </div>

      <div className="activity-logs">
        <h3>Activity Logs</h3>
        <div className="logs-container">
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditPage;
