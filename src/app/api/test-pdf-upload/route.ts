export const runtime = "nodejs";

const { PDFParse } = require("pdf-parse");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // pdf-parse v2.4.5 exports PDFParse as a class, need to instantiate it
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();

    return new Response(JSON.stringify({ text: pdfData.text }), { status: 200 });

  } catch (err: any) {
    console.error("❌ PDF parsing error:", err);
    return new Response(
      JSON.stringify({
        error: "PDF parsing failed",
        details: err.message
      }),
      { status: 500 }
    );
  }
}

