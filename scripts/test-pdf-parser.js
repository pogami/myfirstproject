
const { extractTextFromPdfBuffer } = require('../src/lib/pdf-text-extractor');
const { PDFDocument } = require('pdf-lib');

async function test() {
    try {
        // Create a dummy PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText('Hello World! This is a test PDF.');
        const pdfBytes = await pdfDoc.save();
        const buffer = Buffer.from(pdfBytes);

        console.log('Created dummy PDF buffer of size:', buffer.length);

        // Test extraction
        console.log('Testing extraction...');
        const result = await extractTextFromPdfBuffer(buffer);
        console.log('Extraction result:', result);

        if (result.text.includes('Hello World')) {
            console.log('✅ SUCCESS: Text extracted correctly');
        } else {
            console.error('❌ FAILURE: Text not found');
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
    }
}

test();
