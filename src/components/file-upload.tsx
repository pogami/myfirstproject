"use client";

import { useState } from "react";

export default function FileUpload() {
  const [extractedText, setExtractedText] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setExtractedText(data.text);

      console.log("Extracted Text:", data.text);
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    }
  }

  return (
    <div>
      <input type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} />
      {extractedText && (
        <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
          <strong>Extracted Text:</strong>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}

