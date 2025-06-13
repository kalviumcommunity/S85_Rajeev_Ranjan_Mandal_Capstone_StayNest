import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Properties from "./components/Properties";
import PropertyDetail from "./components/PropertyDetail";
import BookingRequest from "./components/BookingRequest";
import Review from "./components/Review";
import Navbar from "./components/Navbar";
import OAuthSuccess from "./components/OAuthSuccess";
import Home from "./components/Home";
import AddProperty from "./components/AddProperty";
import EditProperty from "./components/EditProperty";
import HostDashboard from "./components/HostDashboard";
import AdminDashboard from "./components/AdminDashboard";
import UserProfile from "./components/UserProfile";
import Contact from "./components/Contact";
import Support from "./components/Support";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import "./App.css";

// Protected Route Component
const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (for routes that should only be accessible when not logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/auth/success" element={<OAuthSuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Auth Routes - Only accessible when not logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div className="max-w-md mx-auto">
                  <Login />
                </div>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <div className="max-w-md mx-auto">
                  <Register />
                </div>
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <div className="max-w-6xl mx-auto">My Bookings</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/book/:propertyId"
            element={
              <PrivateRoute>
                <div className="max-w-4xl mx-auto">
                  <BookingRequest />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/reviews/:propertyId"
            element={
              <PrivateRoute>
                <div className="max-w-4xl mx-auto">
                  <Review />
                </div>
              </PrivateRoute>
            }
          />

          {/* Host Only Routes */}
          <Route
            path="/host/dashboard"
            element={
              <PrivateRoute roles={["host", "admin"]}>
                <HostDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/host/add-property"
            element={
              <PrivateRoute roles={["host", "admin"]}>
                <AddProperty />
              </PrivateRoute>
            }
          />
          <Route
            path="/host/edit-property/:id"
            element={
              <PrivateRoute roles={["host", "admin"]}>
                <EditProperty />
              </PrivateRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto mt-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  404 - Page Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                  to="/"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Go back home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="bg-white mt-auto border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center text-gray-500 text-sm mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} StayNest. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/privacy-policy"
                className="text-gray-500 hover:text-blue-600 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-gray-500 hover:text-blue-600 text-sm"
              >
                Terms of Service
              </Link>
              <Link
                to="/contact"
                className="text-gray-500 hover:text-blue-600 text-sm"
              >
                Contact Us
              </Link>
              <Link
                to="/support"
                className="text-gray-500 hover:text-blue-600 text-sm"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
