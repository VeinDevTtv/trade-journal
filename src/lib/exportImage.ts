import html2canvas from 'html2canvas'

export interface ExportImageOptions {
  fileName?: string
  scale?: number
  backgroundColor?: string
  width?: number
  height?: number
  quality?: number
}

export interface ExportData {
  title: string
  subtitle?: string
  data: any
  type: 'dashboard' | 'calendar' | 'table' | 'insights'
}

// Create a dedicated export template with proper styling
function createExportTemplate(data: ExportData): HTMLElement {
  const template = document.createElement('div')
  template.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 1200px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    padding: 50px;
    border-radius: 24px;
    box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.8);
    z-index: -1;
    border: 1px solid rgba(59, 130, 246, 0.2);
  `

  // Header section with enhanced styling
  const header = document.createElement('div')
  header.style.cssText = `
    text-align: center;
    margin-bottom: 50px;
    padding-bottom: 40px;
    border-bottom: 3px solid #3b82f6;
    position: relative;
  `
  
  // Add decorative elements
  const headerDecoration = document.createElement('div')
  headerDecoration.style.cssText = `
    position: absolute;
    bottom: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 6px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd);
    border-radius: 3px;
  `
  
  const title = document.createElement('h1')
  title.textContent = data.title
  title.style.cssText = `
    font-size: 56px;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.02em;
  `
  
  if (data.subtitle) {
    const subtitle = document.createElement('p')
    subtitle.textContent = data.subtitle
    subtitle.style.cssText = `
      font-size: 24px;
      color: #94a3b8;
      margin: 20px 0 0 0;
      font-weight: 500;
      opacity: 0.9;
    `
    header.appendChild(subtitle)
  }
  
  header.appendChild(title)
  header.appendChild(headerDecoration)
  template.appendChild(header)

  // Content section based on type
  const content = createContentForType(data)
  template.appendChild(content)

  // Enhanced footer with timestamp
  const footer = document.createElement('div')
  footer.style.cssText = `
    text-align: center;
    margin-top: 50px;
    padding-top: 40px;
    border-top: 2px solid rgba(59, 130, 246, 0.3);
    color: #64748b;
    font-size: 16px;
    position: relative;
  `
  
  const timestamp = document.createElement('div')
  timestamp.textContent = `Generated on ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })} at ${new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })}`
  timestamp.style.cssText = `
    font-weight: 500;
    color: #94a3b8;
  `
  
  const watermark = document.createElement('div')
  watermark.textContent = 'Trading Journal Pro'
  watermark.style.cssText = `
    font-size: 14px;
    color: #475569;
    margin-top: 8px;
    font-weight: 400;
    opacity: 0.7;
  `
  
  footer.appendChild(timestamp)
  footer.appendChild(watermark)
  template.appendChild(footer)

  return template
}

function createContentForType(data: ExportData): HTMLElement {
  switch (data.type) {
    case 'dashboard':
      return createDashboardContent(data.data)
    case 'calendar':
      return createCalendarContent(data.data)
    case 'table':
      return createTableContent(data.data)
    case 'insights':
      return createInsightsContent(data.data)
    default:
      return createGenericContent(data.data)
  }
}

function createDashboardContent(data: any): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    margin-bottom: 30px;
  `

  // Summary cards
  const summaryCard = createMetricCard('Total P&L', formatCurrency(data.totalProfitLoss), data.totalProfitLoss >= 0 ? '#10b981' : '#ef4444')
  const winRateCard = createMetricCard('Win Rate', `${data.winRate.toFixed(1)}%`, '#3b82f6')
  const tradesCard = createMetricCard('Total Trades', data.totalTrades.toString(), '#8b5cf6')
  const avgTradeCard = createMetricCard('Avg Trade', formatCurrency(data.avgTrade), '#f59e0b')

  container.appendChild(summaryCard)
  container.appendChild(winRateCard)
  container.appendChild(tradesCard)
  container.appendChild(avgTradeCard)

  return container
}

function createMetricCard(title: string, value: string, color: string): HTMLElement {
  const card = document.createElement('div')
  card.style.cssText = `
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  `

  // Add subtle glow effect
  const glow = document.createElement('div')
  glow.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, ${color}20 0%, transparent 70%);
    opacity: 0.3;
    pointer-events: none;
  `

  const valueEl = document.createElement('div')
  valueEl.textContent = value
  valueEl.style.cssText = `
    font-size: 36px;
    font-weight: 800;
    color: ${color};
    margin-bottom: 12px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.01em;
  `

  const titleEl = document.createElement('div')
  titleEl.textContent = title
  titleEl.style.cssText = `
    font-size: 16px;
    color: #cbd5e1;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `

  card.appendChild(glow)
  card.appendChild(valueEl)
  card.appendChild(titleEl)
  return card
}

function createCalendarContent(data: any): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    text-align: center;
    padding: 20px;
  `

  const monthTitle = document.createElement('h2')
  monthTitle.textContent = `${data.month} ${data.year}`
  monthTitle.style.cssText = `
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #e2e8f0;
  `

  const stats = document.createElement('div')
  stats.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 30px;
  `

  const totalTrades = createStatItem('Total Trades', data.totalTrades.toString())
  const winRate = createStatItem('Win Rate', `${data.winRate.toFixed(1)}%`)
  const totalPnL = createStatItem('Total P&L', formatCurrency(data.totalPnL))

  stats.appendChild(totalTrades)
  stats.appendChild(winRate)
  stats.appendChild(totalPnL)

  container.appendChild(monthTitle)
  container.appendChild(stats)

  return container
}

function createStatItem(label: string, value: string): HTMLElement {
  const item = document.createElement('div')
  item.style.cssText = `
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 16px;
  `

  const valueEl = document.createElement('div')
  valueEl.textContent = value
  valueEl.style.cssText = `
    font-size: 24px;
    font-weight: 600;
    color: #60a5fa;
    margin-bottom: 4px;
  `

  const labelEl = document.createElement('div')
  labelEl.textContent = label
  labelEl.style.cssText = `
    font-size: 12px;
    color: #94a3b8;
  `

  item.appendChild(valueEl)
  item.appendChild(labelEl)
  return item
}

function createTableContent(data: any): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  `

  const title = document.createElement('h3')
  title.textContent = 'Monthly Summary'
  title.style.cssText = `
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #e2e8f0;
  `

  const grid = document.createElement('div')
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  `

  const items = [
    { label: 'Total Trades', value: data.totalTrades },
    { label: 'Winning Trades', value: data.winningTrades },
    { label: 'Losing Trades', value: data.losingTrades },
    { label: 'Win Rate', value: `${data.winRate.toFixed(1)}%` },
    { label: 'Total P&L', value: formatCurrency(data.totalPnL) },
    { label: 'Average R:R', value: data.avgRiskReward.toFixed(2) }
  ]

  items.forEach(item => {
    const itemEl = createTableItem(item.label, item.value)
    grid.appendChild(itemEl)
  })

  container.appendChild(title)
  container.appendChild(grid)
  return container
}

function createTableItem(label: string, value: string | number): HTMLElement {
  const item = document.createElement('div')
  item.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
  `

  const labelEl = document.createElement('span')
  labelEl.textContent = label
  labelEl.style.cssText = `
    color: #94a3b8;
    font-size: 14px;
  `

  const valueEl = document.createElement('span')
  valueEl.textContent = value.toString()
  valueEl.style.cssText = `
    color: #e2e8f0;
    font-weight: 600;
    font-size: 14px;
  `

  item.appendChild(labelEl)
  item.appendChild(valueEl)
  return item
}

function createInsightsContent(data: any): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 24px;
  `

  const title = document.createElement('h3')
  title.textContent = 'Trading Insights'
  title.style.cssText = `
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #e2e8f0;
  `

  const insights = document.createElement('div')
  insights.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 16px;
  `

  if (data.topPairs && data.topPairs.length > 0) {
    const pairsSection = document.createElement('div')
    pairsSection.innerHTML = `
      <h4 style="color: #60a5fa; font-size: 18px; margin-bottom: 12px;">Top Performing Pairs</h4>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        ${data.topPairs.slice(0, 4).map((pair: any) => `
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
            <div style="font-weight: 600; color: #e2e8f0;">${pair.pair}</div>
            <div style="color: #94a3b8; font-size: 12px;">${pair.winRate.toFixed(1)}% win rate</div>
          </div>
        `).join('')}
      </div>
    `
    insights.appendChild(pairsSection)
  }

  container.appendChild(title)
  container.appendChild(insights)
  return container
}

function createGenericContent(_data: any): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
  `

  const message = document.createElement('p')
  message.textContent = 'Data export completed successfully'
  message.style.cssText = `
    font-size: 18px;
    color: #e2e8f0;
    margin: 0;
  `

  container.appendChild(message)
  return container
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export async function exportElementAsPng(
  element: HTMLElement,
  options: ExportImageOptions = {}
): Promise<void> {
  const { fileName = 'export.png', scale = 2, backgroundColor = '#0f172a', width = 1200, height = 800, quality = 1.0 } = options

  if (!element) return

  try {
    // Create a dedicated export template
    const exportData: ExportData = {
      title: 'Trading Journal Export',
      subtitle: new Date().toLocaleDateString(),
      data: {},
      type: 'dashboard'
    }

    const template = createExportTemplate(exportData)
    document.body.appendChild(template)

    // Use html2canvas with optimized settings
    const canvas = await html2canvas(template, {
      backgroundColor: backgroundColor,
      scale: scale,
      useCORS: true,
      logging: false,
      width: width,
      height: height,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      removeContainer: true,
      // Better font handling
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.firstChild as HTMLElement
        if (clonedElement) {
          clonedElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      }
    })

    // Create high-quality image
    const dataUrl = canvas.toDataURL('image/png', quality)
    
    // Download the image
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Cleanup
    document.body.removeChild(template)
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

// New function for creating styled exports with custom data
export async function createStyledExport(
  data: ExportData,
  options: ExportImageOptions = {}
): Promise<void> {
  const { fileName = 'export.png', scale = 3, backgroundColor = '#0f172a', width = 1200, height = 800, quality = 1.0 } = options

  try {
    const template = createExportTemplate(data)
    document.body.appendChild(template)

    const canvas = await html2canvas(template, {
      backgroundColor: backgroundColor,
      scale: scale,
      useCORS: true,
      logging: false,
      width: width,
      height: height,
             allowTaint: true,
       foreignObjectRendering: false,
       imageTimeout: 15000,
       removeContainer: true,
       onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.firstChild as HTMLElement
        if (clonedElement) {
          clonedElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      }
    })

    const dataUrl = canvas.toDataURL('image/png', quality)
    
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    document.body.removeChild(template)
  } catch (error) {
    console.error('Styled export failed:', error)
    throw error
  }
}


