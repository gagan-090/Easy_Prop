import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from "./contexts/AuthContext";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import ScheduleTour from "./pages/ScheduleTour";
import VirtualTour from "./pages/VirtualTour";
import EMICalculator from "./pages/EMICalculator";
import AgentContact from "./pages/AgentContact";
import PropertyShare from "./pages/PropertyShare";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import DashboardHome from "./pages/Dashboard/Home";
import AddProperty from "./pages/Dashboard/AddProperty";
import EditProperty from "./pages/Dashboard/EditProperty";
import EmailDebugger from "./components/EmailDebugger";
import MyProperties from "./pages/Dashboard/MyProperties";
import Sold from "./pages/Dashboard/Sold";
import ViewProperty from "./pages/Dashboard/ViewProperty";
import ShareProperty from "./pages/Dashboard/ShareProperty";
import Leads from "./pages/Dashboard/Leads";
import WebsitePreview from "./pages/Dashboard/WebsitePreview";
import Analytics from "./pages/Dashboard/Analytics";
import Tours from "./pages/Dashboard/Tours";
import Settings from "./pages/Dashboard/Settings";
import SearchFilterDemo from "./pages/SearchFilterDemo";

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Public routes with navbar and footer */}
            <Route path="/" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <About />
                </main>
                <Footer />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Contact />
                </main>
                <Footer />
              </>
            } />
            <Route path="/properties" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Properties />
                </main>
                <Footer />
              </>
            } />
            <Route path="/search" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <SearchResults />
                </main>
                <Footer />
              </>
            } />
            <Route path="/search-demo" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <SearchFilterDemo />
                </main>
                <Footer />
              </>
            } />
            <Route path="/property/:id" element={
              <>
                <main className="flex-grow">
                  <PropertyDetails />
                </main>
              </>
            } />
            <Route path="/schedule-tour/:id" element={
              <>
                <main className="flex-grow">
                  <ScheduleTour />
                </main>
              </>
            } />
            <Route path="/virtual-tour/:id" element={
              <>
                <main className="flex-grow">
                  <VirtualTour />
                </main>
              </>
            } />
            <Route path="/emi-calculator/:id?" element={
              <>
                <main className="flex-grow">
                  <EMICalculator />
                </main>
              </>
            } />
            <Route path="/agent-contact/:agentId/:id?" element={
              <>
                <main className="flex-grow">
                  <AgentContact />
                </main>
              </>
            } />
            <Route path="/property-share/:id" element={
              <>
                <main className="flex-grow">
                  <PropertyShare />
                </main>
              </>
            } />
            
            {/* Auth routes without navbar/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Debug route - remove in production */}
            <Route path="/email-debug" element={<EmailDebugger />} />
            
            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="add-property" element={<AddProperty />} />
              <Route path="edit-property/:propertyId" element={<EditProperty />} />
              <Route path="view-property/:propertyId" element={<ViewProperty />} />
              <Route path="share-property/:propertyId" element={<ShareProperty />} />
              <Route path="my-properties" element={<MyProperties />} />
              <Route path="sold" element={<Sold />} />
              <Route path="website-preview" element={<WebsitePreview />} />
              <Route path="leads" element={<Leads />} />
              <Route path="tours" element={<Tours />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 
