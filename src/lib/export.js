/**
 * Triggers a file download in the browser.
 * The anchor must be briefly appended to the document for Firefox compatibility.
 * @param {string} url - data URL
 * @param {string} filename
 */
function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Downloads the chart canvas as a PNG file.
 * @param {HTMLCanvasElement} canvas
 * @param {string} [filename]
 * @param {(error: string) => void} [onError]
 * @param {() => void} [onSuccess]
 */
export function downloadPNG(canvas, filename = 'illusion-knitting-chart.png', onError, onSuccess) {
  try {
    const url = canvas.toDataURL('image/png')
    if (!url || url === 'data:,') {
      onError?.('Could not generate PNG. The canvas may be empty.')
      return
    }
    triggerDownload(url, filename)
    onSuccess?.()
  } catch (err) {
    onError?.('Could not generate PNG: ' + err.message)
  }
}

/**
 * Downloads the chart as a CSV file.
 * Cells contain: LK, LP, DK, or DP
 *   L/D = light or dark ridge | K/P = knit or purl
 * Row 1 of the CSV = ridge 1 (cast-on edge, bottom of chart).
 * Uses \r\n line endings for Excel on Windows compatibility.
 * @param {string[][]} chart - chart[ridgeIndex][stitchIndex], ridge 0 = bottom
 * @param {string} [filename]
 * @param {(error: string) => void} [onError]
 * @param {() => void} [onSuccess]
 */
export function downloadCSV(chart, filename = 'illusion-knitting-chart.csv', onError, onSuccess) {
  try {
    const csv = chart.map((row) => row.join(',')).join('\r\n')
    const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    triggerDownload(url, filename)
    onSuccess?.()
  } catch (err) {
    onError?.('Could not generate CSV: ' + err.message)
  }
}
