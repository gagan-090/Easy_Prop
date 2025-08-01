# EasyProp - User Guide

## Overview
EasyProp is a modern real estate web application built with React that allows users to browse, search, and manage property listings. The platform provides both public browsing capabilities and a comprehensive dashboard for property owners and agents.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Public Features](#public-features)
3. [User Authentication](#user-authentication)
4. [Dashboard Features](#dashboard-features)
5. [Property Management](#property-management)
6. [Search and Filters](#search-and-filters)
7. [Technical Requirements](#technical-requirements)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Installation & Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### First Time Setup
- The application runs in demo mode with mock data
- No backend configuration required for basic functionality
- All user data is stored locally in browser storage

## Public Features

### Home Page
The home page showcases:
- **Hero Section**: Featured property with detailed information
- **Search Interface**: Quick property search with filters
- **Popular Properties**: Grid of trending property listings
- **Call-to-Action**: Links to browse all properties or register

### Property Browsing
Navigate to `/properties` to:
- View all available properties in grid or list format
- Use advanced search filters (location, type, price, bedrooms)
- Sort properties by price, date, or popularity
- View detailed property information

### Property Information
Each property listing displays:
- High-quality images
- Price in Indian Rupees (₹)
- Property specifications (beds, baths, square footage)
- Location details
- Property type (apartment, villa, commercial, land)
- Contact information for inquiries

## User Authentication

### Registration Process
1. Click "Register" or "Create Account"
2. Fill in required information:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Confirm Password
3. Accept terms and conditions
4. Click "Create Account"

### Login Process
1. Navigate to `/login`
2. Enter your email and password
3. Optional: Check "Remember me" for persistent login
4. Click "Sign in"

### Demo Credentials
For testing purposes, any valid email and password combination will work in demo mode.

### Social Login Options
- Google Sign-in integration
- Facebook Sign-in integration
- One-click authentication for faster access

## Dashboard Features

### Dashboard Overview
After logging in, access your dashboard at `/dashboard` to view:

#### Key Metrics
- **Total Properties**: Number of your listed properties
- **Total Views**: Aggregate views across all listings
- **Inquiries**: Number of potential buyer inquiries
- **Revenue**: Total earnings from property transactions

#### Recent Activities
- New property inquiries
- Property view notifications
- Listing status updates
- Scheduled site visits

#### Quick Actions
- Add new property listing
- Manage existing properties
- View analytics and performance
- Update profile settings

### Property Analytics
Track your property performance with:
- View counts and trends
- Inquiry conversion rates
- Price comparison with similar properties
- Geographic performance data

## Property Management

### Adding New Properties
1. Click "Add Property" in the dashboard
2. Fill in property details:
   - **Basic Information**: Title, description, price
   - **Location**: Address, city, area details
   - **Specifications**: Bedrooms, bathrooms, square footage
   - **Property Type**: Apartment, villa, commercial, land
   - **Images**: Upload high-quality photos
   - **Amenities**: List available facilities
   - **Contact Information**: Agent details

3. Preview your listing
4. Publish or save as draft

### Managing Existing Properties
- Edit property information
- Update pricing and availability
- Manage photo galleries
- Respond to inquiries
- Track performance metrics
- Archive or delete listings

### Property Status Management
- **Active**: Visible to public, accepting inquiries
- **Pending**: Under review or awaiting approval
- **Sold**: Completed transaction, archived
- **Draft**: Work in progress, not published

## Search and Filters

### Basic Search
Use the search bar to find properties by:
- Location (city, area, landmark)
- Property type
- Price range
- Number of bedrooms

### Advanced Filters
Access detailed filtering options:
- **Location**: Specific areas within cities
- **Property Type**: Apartments, villas, commercial spaces, land
- **Price Range**: Custom min/max pricing
- **Bedrooms**: 1 BHK to 4+ BHK options
- **Bathrooms**: Number of bathrooms
- **Square Footage**: Property size requirements
- **Amenities**: Parking, gym, swimming pool, etc.

### Search Results
- Grid or list view options
- Sort by price, date, popularity
- Save favorite properties
- Quick contact options
- Detailed property previews

## Navigation Structure

### Public Pages
- `/` - Home page with featured properties
- `/properties` - All property listings with search
- `/about` - Company information and mission
- `/contact` - Contact form and office details

### Authentication Pages
- `/login` - User sign-in page
- `/register` - New user registration

### Protected Dashboard Pages
- `/dashboard` - Main dashboard overview
- `/dashboard/properties` - Manage your property listings
- `/dashboard/add` - Add new property form
- `/dashboard/analytics` - Performance metrics
- `/dashboard/profile` - Account settings

## Technical Requirements

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Device Support
- **Desktop**: Full functionality on all screen sizes
- **Tablet**: Responsive design with touch optimization
- **Mobile**: Mobile-first responsive interface

### Performance Features
- Lazy loading for images
- Optimized bundle sizes
- Fast page transitions
- Offline capability for cached content

## Key Features Summary

### For Property Seekers
- Browse extensive property database
- Advanced search and filtering
- Save favorite properties
- Contact property owners directly
- Compare properties side-by-side

### For Property Owners
- List unlimited properties
- Professional property management tools
- Real-time analytics and insights
- Inquiry management system
- Revenue tracking

### For Real Estate Agents
- Multi-property portfolio management
- Client inquiry tracking
- Performance analytics
- Professional property presentation
- Lead generation tools

## Troubleshooting

### Common Issues

#### Login Problems
- Ensure email and password are correct
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check internet connection

#### Property Images Not Loading
- Verify image file formats (JPG, PNG, WebP)
- Check file size limits (max 5MB per image)
- Ensure stable internet connection
- Try refreshing the page

#### Search Not Working
- Clear search filters and try again
- Check spelling of location names
- Try broader search criteria
- Refresh the page

#### Dashboard Not Loading
- Verify you're logged in
- Clear browser cache
- Check for JavaScript errors in browser console
- Try logging out and back in

### Getting Help
- Check the FAQ section
- Contact support through the contact form
- Email: support@easyprop.com
- Phone: +91-XXXX-XXXX-XX

## Security & Privacy

### Data Protection
- All user data is encrypted
- Secure authentication protocols
- Regular security updates
- GDPR compliant data handling

### Privacy Features
- Control visibility of contact information
- Manage inquiry preferences
- Data export and deletion options
- Transparent privacy policy

## Updates & Maintenance

### Regular Updates
- New features added monthly
- Security patches applied automatically
- Performance improvements
- Bug fixes and optimizations

### Planned Features
- Mobile app development
- Advanced property comparison tools
- Virtual property tours
- AI-powered property recommendations
- Integration with mortgage calculators

---

*This guide covers the current version of EasyProp. For the latest updates and features, please check our website or contact support.*