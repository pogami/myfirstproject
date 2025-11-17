// Utility helpers to make pdf-parse/pdfjs-dist work reliably in Next.js Node runtimes
// Ensures the worker is disabled, DOMMatrix exists, and pdf-parse is loaded via ESM-friendly imports.

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

export async function loadPdfParse() {
  // Disable pdf-parse workers for serverless environments
  if (typeof process !== 'undefined' && process.env) {
    process.env.PDFJS_DISABLE_WORKER = 'true';
    // Prevent pdf-parse from trying to load worker files
    process.env.PDF_PARSE_DISABLE_WORKER = 'true';
  }
  
  // Set worker path to undefined to prevent loading
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__PDF_PARSE_WORKER_DISABLED__ = true;
  }
  
  const pdfParseModule: any = await import('pdf-parse');
  const pdfParse = pdfParseModule.default ?? pdfParseModule;
  
  // If pdf-parse has worker options, disable them
  if (pdfParse && typeof pdfParse === 'function') {
    // Wrap to ensure no worker is used
    return async (data: any, options?: any) => {
      const safeOptions = {
        ...options,
        // Disable any worker-related options
        max: options?.max || 0,
      };
      return await pdfParse(data, safeOptions);
    };
  }
  
  return pdfParse;
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

