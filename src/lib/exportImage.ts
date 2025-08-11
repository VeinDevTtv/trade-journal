import html2canvas from 'html2canvas'

export interface ExportImageOptions {
  fileName?: string
  scale?: number
  backgroundColor?: string
}

export async function exportElementAsPng(
  element: HTMLElement,
  options: ExportImageOptions = {}
): Promise<void> {
  const { fileName = 'export.png', scale, backgroundColor } = options

  if (!element) return

  const html = document.documentElement
  const body = document.body

  const originalHtmlWidth = html.style.width
  const originalBodyWidth = body.style.width

  // Ensure full width is captured (for horizontally scrollable content)
  const fullWidth = element.scrollWidth
  if (fullWidth > 0) {
    html.style.width = `${fullWidth}px`
    body.style.width = `${fullWidth}px`
  }

  // Prefer computed background to keep design parity
  const computedBg = backgroundColor || getComputedStyle(document.body).backgroundColor || '#111827'

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: computedBg,
      scale: scale ?? Math.max(2, Math.floor(window.devicePixelRatio || 2)),
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    const dataUrl = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    html.style.width = originalHtmlWidth
    body.style.width = originalBodyWidth
  }
}


