// Utility helpers to make pdfjs-dist work reliably in Next.js Node runtimes
// Ensures the worker is disabled and DOMMatrix exists.

let setupPromise: Promise<void> | null = null;
let pdfjsPromise: Promise<any> | null = null;

async function polyfillDomMatrix() {
  if (typeof globalThis === 'undefined' || (globalThis as any).DOMMatrix) {
    return;
  }

  try {
    const canvasMod: any = await import('@napi-rs/canvas');
    const domMatrix =
      canvasMod.DOMMatrix ||
      canvasMod.default?.DOMMatrix ||
      canvasMod.default?.DOMMatrixReadOnly;

    if (domMatrix) {
      (globalThis as any).DOMMatrix = domMatrix;
    }
  } catch (error) {
    console.warn('⚠️ Unable to polyfill DOMMatrix for pdfjs-dist', error);
  }
}

export async function ensurePdfNodeSupport() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    if (typeof process !== 'undefined' && process.env) {
      process.env.PDFJS_DISABLE_WORKER = 'true';
    }

    await polyfillDomMatrix();

    try {
      const pdfjs: any = await import('pdfjs-dist');
      if (pdfjs?.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = undefined as any;
        return;
      }
    } catch (error) {
      try {
        const legacyPdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
        if (legacyPdfjs?.GlobalWorkerOptions) {
          legacyPdfjs.GlobalWorkerOptions.workerSrc = undefined as any;
          return;
        }
      } catch (legacyError) {
        console.warn('⚠️ Unable to configure pdfjs-dist worker', legacyError);
      }
    }
  })();

  return setupPromise;
}

export async function loadPdfjsDist() {
  await ensurePdfNodeSupport();

  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      try {
        return await import('pdfjs-dist');
      } catch {
        return await import('pdfjs-dist/legacy/build/pdf.mjs');
      }
    })();
  }

  return pdfjsPromise;
}

