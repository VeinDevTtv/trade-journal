# TradeProp Journal

A comprehensive Notion-style trade journaling application designed specifically for prop firm traders. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🎯 Overview

TradeProp Journal is a modern, responsive web application that helps forex traders track, analyze, and improve their trading performance. The application provides a clean, intuitive interface for logging trades, calculating profits/losses, analyzing performance metrics, and managing multiple trading accounts.

## ✨ Features

### 🏠 Dashboard
- **Real-time Performance Metrics**: Total P&L, win rate, trade count, and best trading day
- **Interactive Calendar View**: Visual representation of trading activity with profit/loss indicators
- **Recent Trades Overview**: Quick access to latest trading entries
- **Account Balance Tracking**: Monitor multiple prop firm accounts

### 📊 Analytics
- **Equity Curve Visualization**: Track account growth over time using Recharts
- **Performance Breakdown**: Analyze profits by currency pairs, trading days, and win/loss ratios
- **Interactive Charts**: Area charts, bar charts, and pie charts for comprehensive analysis
- **Performance Metrics**: Detailed statistics and KPIs

### 📝 Trade Journal
- **Comprehensive Trade Entry**: Record all trade details including entry/exit prices, volume, stop loss, take profit
- **Smart Calculations**: Automatic profit/loss calculation, pip calculation, and risk-reward ratio
- **Trade Tagging System**: Categorize trades with predefined and custom tags
- **Screenshot Support**: Attach trade screenshots for visual reference
- **Trade Filtering**: Filter trades by win/loss status and other criteria

### 📅 Calendar
- **Monthly Trade Calendar**: Visual calendar showing trading activity
- **Trade Density Indicators**: Color-coded days based on trading activity
- **Quick Trade Access**: Click on calendar days to view trades

### 🧮 Trade Calculator
- **Real-time Profit/Loss Calculator**: Calculate potential profits before entering trades
- **Position Size Calculator**: Determine optimal position size based on risk percentage
- **Multi-Currency Support**: Support for major forex pairs with accurate pip values
- **Risk Management Tools**: Calculate risk-reward ratios and position sizing

### ⚙️ Settings
- **Profile Management**: User profile and account information
- **Trading Preferences**: Default trading settings and preferences
- **Account Management**: Manage multiple prop firm accounts
- **Appearance Settings**: Dark/light theme toggle and UI customization
- **Notification Settings**: Configure alerts and notifications
- **Data Management**: Import/export functionality for trading data

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives with custom styling
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Themes**: next-themes for dark/light mode

### UI Components
- **Design System**: Custom component library built on Radix UI
- **Form Components**: Input, Select, Textarea, Calendar, etc.
- **Layout Components**: Cards, Tabs, Dialog, Popover, etc.
- **Data Display**: Tables, Charts, Badges, Progress indicators
- **Navigation**: Responsive sidebar and header navigation

### State Management
- **Form State**: React Hook Form for complex form handling
- **Local State**: React useState and useEffect hooks
- **Theme State**: next-themes for theme persistence

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── analytics/           # Analytics page
│   │   ├── calculator/          # Trade calculator page
│   │   ├── calendar/            # Calendar page
│   │   ├── dashboard/           # Main dashboard page
│   │   ├── journal/             # Trade journal page
│   │   ├── settings/            # Settings page
│   │   └── layout.tsx           # Dashboard layout with navigation
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Root page (redirects to dashboard)
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── settings/                # Settings-specific components
│   ├── analytics-header.tsx     # Analytics page header
│   ├── calendar-*.tsx           # Calendar components
│   ├── dashboard-*.tsx          # Dashboard components
│   ├── journal-*.tsx            # Journal components
│   ├── main-nav.tsx             # Main navigation
│   ├── side-nav.tsx             # Sidebar navigation
│   ├── trade-*.tsx              # Trade-related components
│   └── user-nav.tsx             # User navigation
├── lib/                         # Utility libraries
│   ├── trade-calculations.ts    # Trading calculations and utilities
│   └── utils.ts                 # General utilities
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
└── styles/                      # Additional styles
```

## 🔧 Core Functionality

### Trade Calculations (`lib/trade-calculations.ts`)
- **Pip Calculation**: Accurate pip calculations for different currency pairs
- **Profit/Loss Calculation**: Real-time P&L calculation with currency conversion
- **Position Sizing**: Risk-based position size calculation
- **Risk-Reward Ratio**: Automatic RRR calculation
- **Currency Pair Support**: Comprehensive support for major forex pairs

### Trade Form (`components/trade-form.tsx`)
- **Multi-step Form**: Tabbed interface for trade entry
- **Real-time Validation**: Zod schema validation with React Hook Form
- **Auto-calculations**: Live profit/loss and RRR calculations
- **File Upload**: Screenshot attachment functionality
- **Tag Management**: Dynamic tag system for trade categorization

### Data Visualization
- **Recharts Integration**: Professional charts for analytics
- **Responsive Design**: Charts adapt to different screen sizes
- **Interactive Elements**: Hover effects and data tooltips
- **Color Coding**: Consistent color scheme for profits/losses

## 🚧 Implementation Status

### ✅ Completed Features
- [x] **Core UI Framework**: Complete component library with Radix UI
- [x] **Navigation System**: Responsive sidebar and header navigation
- [x] **Dashboard Layout**: Main dashboard with key metrics and overview
- [x] **Trade Form**: Comprehensive trade entry form with validation
- [x] **Trade Calculations**: Accurate forex calculations and utilities
- [x] **Analytics Charts**: Performance visualization with Recharts
- [x] **Calendar View**: Trade calendar with activity indicators
- [x] **Trade Calculator**: Standalone profit/loss calculator
- [x] **Settings Framework**: Complete settings page structure
- [x] **Theme System**: Dark/light mode toggle
- [x] **Responsive Design**: Mobile-friendly layouts

### 🔄 Partially Implemented
- [ ] **Data Persistence**: Currently using mock data, needs backend integration
- [ ] **Trade CRUD Operations**: Edit/delete functionality exists in UI but not connected
- [ ] **Import/Export**: UI exists but functionality not implemented
- [ ] **User Authentication**: No authentication system implemented
- [ ] **Real-time Data**: Static data, needs live market data integration

### ❌ Missing Features
- [ ] **Backend API**: No server-side implementation
- [ ] **Database Integration**: No data persistence layer
- [ ] **User Management**: No user accounts or authentication
- [ ] **Real Market Data**: No live price feeds
- [ ] **Trade Execution**: No broker integration
- [ ] **Notifications**: Notification system not implemented
- [ ] **Mobile App**: Web-only, no native mobile app

## 🎨 Design System

### Color Scheme
- **Primary**: Blue-based color palette
- **Success**: Green for profits and wins
- **Danger**: Red for losses and errors
- **Neutral**: Gray scale for text and backgrounds
- **Theme Support**: Automatic dark/light mode adaptation

### Typography
- **Font**: Inter font family for clean, modern appearance
- **Hierarchy**: Consistent heading and text sizing
- **Readability**: Optimized contrast ratios

### Layout
- **Grid System**: CSS Grid and Flexbox for responsive layouts
- **Spacing**: Consistent spacing scale using Tailwind CSS
- **Components**: Modular, reusable component architecture

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (preferred) or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd trade-journal

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Development
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## 📋 Next Steps for Development

### High Priority
1. **Backend Integration**: Implement API endpoints for data persistence
2. **Database Setup**: Set up database schema for trades, users, and settings
3. **Authentication**: Implement user registration and login system
4. **CRUD Operations**: Connect edit/delete functionality to backend
5. **Data Validation**: Server-side validation for trade data

### Medium Priority
1. **Import/Export**: Implement CSV/JSON import/export functionality
2. **Real-time Updates**: Add live data updates and notifications
3. **Advanced Analytics**: More sophisticated performance metrics
4. **Mobile Optimization**: Enhanced mobile experience
5. **Testing**: Unit and integration tests

### Low Priority
1. **Broker Integration**: Connect to trading platforms
2. **Advanced Charting**: More chart types and indicators
3. **Social Features**: Trade sharing and community features
4. **AI Insights**: Machine learning for trade analysis
5. **Mobile App**: Native mobile application

## 🤝 Contributing

This project uses modern React patterns and TypeScript for type safety. When contributing:

1. Follow the existing code structure and naming conventions
2. Use TypeScript for all new components
3. Implement responsive design for all UI components
4. Add proper error handling and validation
5. Update this README for any significant changes

## 📄 License

[Add your license information here]

---

**Note**: This application currently uses mock data for demonstration purposes. A backend implementation is required for production use with real trading data. 