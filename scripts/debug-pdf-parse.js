const fs = require('fs');
const pdfLib = require('pdf-parse');

async function testPdfParse() {
    console.log('Testing pdf-parse v2...');

    const dummyPdfBuffer = Buffer.from(`%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(Hello World from PDF!) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000256 00000 n
0000000344 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
439
%%EOF`, 'binary');

    try {
        console.log('Keys:', Object.keys(pdfLib));

        if (pdfLib.PDFParse) {
            console.log('Found PDFParse class/function');
            try {
                // Try as a class
                const parser = new pdfLib.PDFParse();
                console.log('Instantiated PDFParse');
                // Check methods
                console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
            } catch (e) {
                console.log('Could not instantiate PDFParse:', e.message);
                // Try as a function
                try {
                    const result = await pdfLib.PDFParse(dummyPdfBuffer);
                    console.log('Called PDFParse as function, result:', result);
                } catch (e2) {
                    console.log('Could not call PDFParse as function:', e2.message);
                }
            }
        }

        // Try default export if it exists (it didn't before but let's be sure)
        if (pdfLib.default) {
            console.log('Found default export');
            const result = await pdfLib.default(dummyPdfBuffer);
            console.log('Result from default:', result);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testPdfParse();
