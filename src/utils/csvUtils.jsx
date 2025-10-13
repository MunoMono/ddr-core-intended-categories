import Papa from "papaparse";

/**
 * Load and parse a CSV file using PapaParse.
 * @param {string} path - URL or relative path to the CSV file.
 * @param {Function} setter - React state setter for parsed data.
 */
export function loadCSV(path, setter) {
  if (!path) return console.error("⚠️ No path provided to loadCSV");
  Papa.parse(path, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const rows = Array.isArray(result.data) ? result.data.filter(Boolean) : [];
      setter(rows);
    },
    error: (err) => console.error(`❌ Error loading ${path}:`, err.message || err),
  });
}

/**
 * Escape regex special characters in a string.
 */
export function escapeRegExp(string = "") {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlight matching query terms in text with <mark>.
 */
export function highlight(text, query) {
  if (!query?.trim() || !text) return text;
  const regex = new RegExp(`(${escapeRegExp(query.trim())})`, "gi");
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: String(text).replace(
          regex,
          `<mark style="background: yellow; color: inherit;">$1</mark>`
        ),
      }}
    />
  );
}

/**
 * Download an array of objects as a CSV file.
 * @param {Array} data - Parsed data to download.
 * @param {string} filename - Desired CSV filename.
 */
export function handleDownload(data, filename = "data.csv") {
  if (!data?.length) {
    console.warn("⚠️ No data available for download.");
    return;
  }
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}