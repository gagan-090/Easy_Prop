# 🏠 EasyProp - Modern Real Estate Dashboard

A stunning, highly animated client dashboard for EasyProp, a real estate listing and management platform. Built with React, Framer Motion, and modern web technologies.

## ✨ Features

### 🎨 Modern UI/UX
- **Stunning Animations**: Powered by Framer Motion for smooth, professional animations
- **Dark/Light Mode**: Seamless theme switching with animated transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Gradient Designs**: Beautiful gradient backgrounds and components

### 🏠 Property Management
- **Add Property**: Multi-step animated form with drag & drop image upload
- **My Properties**: Grid/List view with advanced filtering and sorting
- **Property Analytics**: Interactive charts showing views, inquiries, and performance
- **Status Management**: Track property status (Active, Pending, Sold, etc.)

### 📊 Dashboard Analytics
- **Overview Cards**: Animated stats cards with trend indicators
- **Performance Charts**: Line charts, area charts, and pie charts using Recharts
- **Real-time Data**: Live updates on property views and inquiries
- **Revenue Tracking**: Monitor earnings and conversion rates

### 💬 Lead Management
- **Leads & Inquiries**: Comprehensive lead tracking system
- **Contact Management**: Email, phone, and message integration
- **Lead Scoring**: Priority and rating system for leads
- **Status Tracking**: New, Contacted, Qualified, Converted pipeline

### 🎯 Advanced Features
- **Multi-step Forms**: Smooth step-by-step property addition
- **Image Upload**: Drag & drop with preview functionality
- **Search & Filter**: Advanced filtering across all sections
- **Notifications**: Animated notification system
- **Profile Management**: User settings and preferences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd easyprop-client
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:5173](http://localhost:5173)

### Dashboard Access
The dashboard is available at: `http://localhost:5173/dashboard`

## 🛠️ Tech Stack

### Core Technologies
- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Animation & UI
- **Framer Motion** - Production-ready motion library
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library
- **React Hook Form** - Performant forms with easy validation

### Additional Libraries
- **React Router DOM** - Client-side routing
- **React Dropzone** - Drag & drop file uploads
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications
- **Yup** - Schema validation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── PropertyCard.jsx
│   └── ...
├── pages/              # Page components
│   ├── Dashboard/      # Dashboard pages
│   │   ├── Home.jsx    # Dashboard overview
│   │   ├── AddProperty.jsx  # Multi-step property form
│   │   ├── MyProperties.jsx # Property management
│   │   └── Leads.jsx   # Lead management
│   ├── Auth/          # Authentication pages
│   └── ...
├── layouts/           # Layout components
│   └── DashboardLayout.jsx
├── contexts/          # React contexts
│   └── AuthContext.jsx
├── utils/            # Utility functions
├── styles/           # Global styles
└── assets/           # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue to Purple gradients (#3B82F6 → #8B5CF6)
- **Success**: Green tones (#10B981)
- **Warning**: Orange/Yellow tones (#F59E0B)
- **Error**: Red tones (#EF4444)
- **Neutral**: Gray scale with dark mode support

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable text with proper contrast

### Animations
- **Page Transitions**: Smooth fade and slide effects
- **Hover Effects**: Scale, glow, and color transitions
- **Loading States**: Skeleton screens and spinners
- **Micro-interactions**: Button presses, form interactions

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing
npm run test         # Run tests (when configured)
```

## 🌟 Key Features Breakdown

### Dashboard Overview
- **Animated Stats Cards**: Property count, views, inquiries, revenue
- **Performance Charts**: Interactive analytics with Recharts
- **Recent Activities**: Timeline of property interactions
- **Quick Actions**: Fast access to common tasks

### Property Management
- **Multi-step Form**: 6-step property addition process
  1. Property Basics (type, bedrooms, area)
  2. Location & Details (address, floor info)
  3. Pricing (price, maintenance, booking amount)
  4. Media Upload (drag & drop images)
  5. Description & Amenities (detailed info)
  6. Preview & Publish (final review)

### Lead Management
- **Comprehensive Lead Tracking**: Contact info, property interest, status
- **Priority System**: High, Medium, Low priority leads
- **Communication Tools**: Direct email, phone, message integration
- **Lead Analytics**: Conversion rates and performance metrics

## 🎯 Future Enhancements

- **Voice Assistant**: Guided tour functionality
- **AI Integration**: Smart description generation
- **Advanced Analytics**: Heatmaps and detailed insights
- **Mobile App**: React Native companion app
- **Real-time Chat**: Live chat with potential buyers
- **Virtual Tours**: 360° property viewing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Motion** for incredible animation capabilities
- **Tailwind CSS** for rapid UI development
- **Recharts** for beautiful, responsive charts
- **Lucide** for the comprehensive icon library
- **Unsplash** for high-quality property images

---

**Built with ❤️ for modern real estate management**