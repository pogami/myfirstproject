import type { NextRequest } from "next/server";
import { extractTextFromPdfBuffer } from "@/lib/pdf-text-extractor";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const mammoth = require("mammoth"); // For DOCX

// TXT files can be read as plain text

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const filename = file.name.toLowerCase();

    let text = "";

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    if (filename.endsWith(".pdf")) {
      const { text: pdfText } = await extractTextFromPdfBuffer(buffer);
      text = pdfText;
    } else if (filename.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });

      text = result.value;
    } else if (filename.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return new Response(JSON.stringify({ error: "Unsupported file type" }), { status: 400 });
    }

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Failed to extract text: " + error.toString() }),
      { status: 500 }
    );
  }
}

