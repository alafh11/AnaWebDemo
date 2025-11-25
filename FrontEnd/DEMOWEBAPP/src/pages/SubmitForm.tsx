import React, { useState } from "react";

const SubmitForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Analyzing your data…");

    const formData = new FormData();
    formData.append("email", email);
    if (file) formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/submit-form", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setStatus("✅ Analysis complete! Check your email for insights.");
        setResult(data.result); 
      } else {
        setStatus(`Failed: ${data.message}`);
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Submit CSV for Analysis</h2>

      <label>Email:
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>


      <label>Upload CSV or Excel:
        <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} required />
      </label>

      <button type="submit">Submit</button>
      {status && <p>{status}</p>}

{Array.isArray(result) && result.length > 0 && typeof result[0] === "object" && (
  <table border={1}>
    <thead>
      <tr>
        {Object.keys(result[0]).map((key) => (
          <th key={key}>{key}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {result.map((row: any, idx: number) => (
        <tr key={idx}>
          {Object.values(row).map((val, i) => (
            <td key={i}>{String(val)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)}

      {result && typeof result === "string" && (
        <a href={result} download>Download Processed File</a>
      )}
    </form>
  );
};

export default SubmitForm;