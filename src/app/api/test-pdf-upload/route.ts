import { extractTextFromPdfBuffer } from "@/lib/pdf-text-extractor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text } = await extractTextFromPdfBuffer(buffer);

    return new Response(JSON.stringify({ text }), { status: 200 });

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

