import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import BookingRequest from './components/BookingRequest';
import Review from './components/Review';
import Navbar from './components/Navbar';
import Home from './components/Home';
import './App.css';

// Protected Route Component
const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          
          {/* Auth Routes - Only accessible when not logged in */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/bookings" element={
            <PrivateRoute>
              <div>My Bookings</div>
            </PrivateRoute>
          } />
          <Route path="/book/:propertyId" element={
            <PrivateRoute>
              <BookingRequest />
            </PrivateRoute>
          } />
          <Route path="/reviews/:propertyId" element={
            <PrivateRoute>
              <Review />
            </PrivateRoute>
          } />
          
          {/* Host Only Routes */}
          <Route path="/host/dashboard" element={
            <PrivateRoute roles={['host', 'admin']}>
              <div>Host Dashboard</div>
            </PrivateRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </main>
      
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} StayNest. All rights reserved.
          </p>
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
