# 📊 Trade Journal

A modern, Notion-style trading journal built with React, TypeScript, and shadcn/ui. Track your trades with beautiful table and calendar views, analyze your performance, and improve your trading strategy.

## ✨ Features

### 📊 Table View
- **Notion-style table** with inline editing for all fields
- **Add/delete trades** with intuitive controls
- **Real-time summary** showing total P&L, R:R, win rate, and trade count
- **Editable columns**: Pair, Date, Direction, P&L, Result, R:R, Account, Emotions
- **Smart formatting**: Currency formatting, color-coded results (Win/Loss/Breakeven)

### 🗓️ Calendar View
- **Monthly calendar layout** showing all trades at a glance
- **Trade details per day**: Pair, P&L, R:R, Result, Account type
- **Visual indicators**: Color-coded results (green=win, red=loss, yellow=breakeven)
- **No-trade days**: Clearly marked with "No Trade" and default values
- **Monthly statistics**: Trading days, best day, worst day

### 🛠️ Core Features
- **Month navigation**: Navigate between months with arrow controls
- **Dark/Light theme toggle**: Beautiful theme switching
- **Data persistence**: All data saved to localStorage
- **Responsive design**: Works perfectly on desktop and mobile
- **TypeScript**: Fully typed for better development experience

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd trade-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 How to Use

### Adding Trades
1. Go to the **Table View**
2. Click **"Add Trade"** button
3. Click on any cell to edit inline:
   - **Pair**: Trading instrument (e.g., XAUUSD, US100)
   - **Date**: Use date picker or type YYYY-MM-DD
   - **Direction**: Select Long, Short, or -
   - **P&L**: Enter profit/loss amount (supports negatives)
   - **Result**: Select Win, Loss, or Breakeven
   - **R:R**: Risk-to-reward ratio
   - **Account**: Select Funded, Demo, or Personal
   - **Emotions**: Free text for trading psychology notes

### Viewing Calendar
1. Switch to **Calendar View**
2. See all trades laid out in calendar format
3. Each day shows:
   - Trading pair
   - Profit/Loss amount
   - Risk-reward ratio
   - Account type
4. Days without trades show "No Trade" with default values

### Navigation
- **Month arrows**: Navigate between months
- **Theme toggle**: Switch between light and dark modes
- **Tab switching**: Toggle between Table and Calendar views

## 🧰 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation utilities

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 💾 Data Persistence

All trade data is automatically saved to your browser's localStorage. Your data persists between sessions and browser restarts.

## 🎨 Theming

The app supports both light and dark themes:
- **Light theme**: Clean, professional look
- **Dark theme**: Easy on the eyes for extended use
- **System preference**: Respects your OS theme setting

## 🔌 Integrations

### TradeLocker (optional)
This app can sync trades from TradeLocker. Use the “TradeLocker Integration” card on the Dashboard to:
- Connect with your TradeLocker credentials
- Select an account
- Pick a date range
- Sync and upsert trades into your journal

Notes:
- Browser apps can be restricted by CORS. If TradeLocker’s API requires secrets or blocks browser CORS, proxy the calls through your backend and set `VITE_TRADELOCKER_BASE_URL` to your proxy URL.
- Trade deduplication uses `externalId`. Mapping logic lives in `src/lib/tradelocker.ts`.

### Import/Export
- Import CSV/JSON via the Trades view Import button
- Export CSV/JSON via the Trades view Export button

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the icon set
- [Zustand](https://github.com/pmndrs/zustand) for state management

---

Built with ❤️ for traders who want to improve their performance through better journaling. 