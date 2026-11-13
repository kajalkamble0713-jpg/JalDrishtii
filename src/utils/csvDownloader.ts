/**
 * JalDrishti Resilient CSV Downloader
 * Ensures official reports are ALWAYS downloaded as genuine CSV data files,
 * never intercepted by SPA router HTML fallbacks (<!DOCTYPE html>).
 */

export interface CsvDownloadOptions {
  filename: string;
  endpoint?: string;
  fallbackGenerator?: () => string;
}

/**
 * Downloads a CSV file to the user's browser with strict content verification
 */
export async function downloadCsvFile(options: CsvDownloadOptions): Promise<{ success: boolean; byteLength: number; source: 'SERVER_API' | 'LOCAL_ENGINE' }> {
  let csvContent: string | null = null;
  let source: 'SERVER_API' | 'LOCAL_ENGINE' = 'SERVER_API';

  // 1. Attempt fetch from server REST endpoint if provided
  if (options.endpoint) {
    try {
      const response = await fetch(options.endpoint, {
        method: 'GET',
        headers: {
          Accept: 'text/csv, text/plain, */*',
        },
      });

      if (response.ok) {
        const text = await response.text();
        const trimmed = text.trim();
        // Check if the response is erroneously an HTML document from SPA router
        const isHtml =
          trimmed.startsWith('<!DOCTYPE') ||
          trimmed.startsWith('<!doctype') ||
          trimmed.startsWith('<html') ||
          trimmed.startsWith('<head');

        if (!isHtml && trimmed.length > 0) {
          csvContent = text;
          source = 'SERVER_API';
        } else {
          console.warn('[CSV Downloader] Server returned HTML document instead of CSV. Falling back to local engine generation.');
        }
      } else {
        console.warn(`[CSV Downloader] Server returned HTTP ${response.status}. Using local engine fallback.`);
      }
    } catch (err) {
      console.warn('[CSV Downloader] Network request failed. Falling back to local engine generation.', err);
    }
  }

  // 2. Fallback to client-side engine generation if server fetch failed or returned HTML
  if (!csvContent && options.fallbackGenerator) {
    try {
      csvContent = options.fallbackGenerator();
      source = 'LOCAL_ENGINE';
    } catch (err) {
      console.error('[CSV Downloader] Fallback generator failed:', err);
    }
  }

  if (!csvContent || csvContent.trim().length === 0) {
    throw new Error('Unable to generate valid CSV data. Please check user permissions and try again.');
  }

  // Double check that content is not HTML
  if (csvContent.trim().startsWith('<')) {
    throw new Error('Generated file contains HTML formatting instead of CSV table data.');
  }

  // 3. Trigger direct browser download via Blob and Object URL
  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel / Google Sheets parses UTF-8 correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const objectUrl = URL.createObjectURL(blob);

  const cleanFilename = options.filename.endsWith('.csv') ? options.filename : `${options.filename}.csv`;

  const link = document.createElement('a');
  link.href = objectUrl;
  link.setAttribute('download', cleanFilename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL after download starts
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 2000);

  return {
    success: true,
    byteLength: blob.size,
    source,
  };
}
