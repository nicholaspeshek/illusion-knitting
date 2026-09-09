<script>
  import { cellColor, MARGIN_LEFT } from '../pattern.js'

  /** @type {{ chart: string[][]|null, canvasRef: HTMLCanvasElement|null, cellSize: number, scrollContainerRef: HTMLElement|null, gridColor: string, cellGridColor: string }} */
  let { chart = null, canvasRef = $bindable(null), cellSize = 12, scrollContainerRef = $bindable(null), gridColor = '#6b7280', cellGridColor = '#f3f4f6' } = $props()

  const GAP = 1
  const MARGIN_BOTTOM = 20
  const LABEL_FONT_SIZE = 9
  const LABEL_FONT_FAMILY = 'system-ui, -apple-system, sans-serif'

  let rafId = 0

  $effect(() => {
    if (!canvasRef || !chart || chart.length === 0) return
    const currentCanvas = canvasRef
    const currentChart = chart
    const currentCellSize = cellSize
    const currentGridColor = gridColor
    const currentCellGridColor = cellGridColor
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      renderChart(currentCanvas, currentChart, currentCellSize, currentGridColor, currentCellGridColor)
    })
    return () => cancelAnimationFrame(rafId)
  })

  function renderChart(canvas, chart, cell, gridColor, cellGridColor) {
    const stride = cell + GAP
    const ridges = chart.length
    const stitches = chart[0].length

    const width = MARGIN_LEFT + stitches * stride + GAP
    const height = ridges * stride + GAP + MARGIN_BOTTOM

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    ctx.fillStyle = cellGridColor
    ctx.fillRect(0, 0, width, height)

    for (let r = 0; r < ridges; r++) {
      const y = (ridges - 1 - r) * stride + GAP

      for (let s = 0; s < stitches; s++) {
        const x = MARGIN_LEFT + s * stride + GAP
        ctx.fillStyle = cellColor(chart[r][s])
        ctx.fillRect(x, y, cell, cell)
      }
    }

    ctx.fillStyle = '#374151'
    ctx.font = `${LABEL_FONT_SIZE}px ${LABEL_FONT_FAMILY}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    const labelIndices = []
    for (let s = 9; s < stitches; s += 10) {
      labelIndices.push(s)
    }
    // Last stitch label (only if not already covered by the multiples-of-10 loop)
    if (stitches % 10 !== 0) {
      labelIndices.push(stitches - 1)
    }

    if (labelIndices.length > 0) {
      const labels = labelIndices.map((s) => {
        const text = String(s + 1)
        const metrics = ctx.measureText(text)
        return { s, text, metrics }
      })
      const maxAscent = labels.reduce(
        (max, { metrics }) => Math.max(max, Number.isFinite(metrics.actualBoundingBoxAscent) ? metrics.actualBoundingBoxAscent : LABEL_FONT_SIZE),
        LABEL_FONT_SIZE
      )
      const maxDescent = labels.reduce(
        (max, { metrics }) => Math.max(max, Number.isFinite(metrics.actualBoundingBoxDescent) ? metrics.actualBoundingBoxDescent : 0),
        0
      )
      const labelTop = ridges * stride + GAP + Math.max(0, (MARGIN_BOTTOM - maxAscent - maxDescent) / 2)
      const labelBaseline = labelTop + maxAscent

      for (const { s, text, metrics } of labels) {
        drawCenteredLabel(ctx, text, metrics, MARGIN_LEFT + s * stride + GAP + cell / 2, labelBaseline)
      }
    }

    const ridgeLabelIndices = []
    for (let r = 9; r < ridges; r += 10) {
      ridgeLabelIndices.push(r)
    }
    if (ridges % 10 !== 0) {
      ridgeLabelIndices.push(ridges - 1)
    }

    if (ridgeLabelIndices.length > 0) {
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'

      for (const r of ridgeLabelIndices) {
        ctx.fillText(String(r + 1), MARGIN_LEFT - 4, (ridges - 1 - r) * stride + GAP + cell / 2)
      }
    }

    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1 / dpr
    for (let s = 10; s < stitches; s += 10) {
      const x = MARGIN_LEFT + s * stride + GAP - 1
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, ridges * stride + GAP)
      ctx.stroke()
    }
    for (let r = 10; r < ridges; r += 10) {
      const y = (ridges - r) * stride + GAP - 1
      ctx.beginPath()
      ctx.moveTo(MARGIN_LEFT, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  function drawCenteredLabel(ctx, text, metrics, centerX, baselineY) {
    const left = Number.isFinite(metrics.actualBoundingBoxLeft) ? metrics.actualBoundingBoxLeft : 0
    const right = Number.isFinite(metrics.actualBoundingBoxRight) ? metrics.actualBoundingBoxRight : metrics.width
    ctx.fillText(text, centerX - (right - left) / 2, baselineY)
  }
</script>

<section aria-labelledby="preview-heading">
  <h2 id="preview-heading">Chart Preview</h2>

  {#if chart}
    <div
      class="canvas-scroll"
      bind:this={scrollContainerRef}
      tabindex="0"
      aria-labelledby="preview-heading"
    >
      <canvas
        bind:this={canvasRef}
        aria-label="Illusion knitting chart: {chart[0]?.length} stitches wide, {chart.length} ridges tall. Use the Download CSV button to access the full chart data as LK, LP, DK, or DP values."
      ></canvas>
    </div>
  {:else}
    <div class="empty-state" aria-live="polite">
      <p>Upload an image to see the chart preview.</p>
    </div>
  {/if}
</section>

<style>
  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
  }

  .canvas-scroll {
    overflow: auto;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    resize: both;
    min-height: 120px;
    height: min(65vh, 700px);
  }

  .canvas-scroll:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  canvas {
    display: block;
  }

  .empty-state {
    border: 1px dashed #d1d5db;
    border-radius: 6px;
    padding: 3rem 1rem;
    text-align: center;
    color: #9ca3af;
  }
</style>
