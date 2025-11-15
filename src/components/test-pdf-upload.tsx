"use client";

export default function TestPDF() {
  async function handleUpload(e: any) {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/test-pdf-upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  }

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
    </div>
  );
}

