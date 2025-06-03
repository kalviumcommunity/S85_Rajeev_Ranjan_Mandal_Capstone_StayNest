import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        // Parse user data
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set axios default header
        import('axios').then(axios => {
          axios.default.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        });
        
        // Set user in context
        setUser(userData);
        
        // Show success message
        const successMessage = `Welcome ${userData.name}! You've successfully logged in with Google.`;
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/', { 
            state: { 
              message: successMessage,
              type: 'success' 
            } 
          });
        }, 2000);
        
      } catch (error) {
        console.error('Error processing OAuth success:', error);
        navigate('/login?error=oauth_processing_failed');
      }
    } else {
      // Missing parameters, redirect to login with error
      navigate('/login?error=oauth_missing_params');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
          {/* Loading Spinner */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg mb-6">
            <svg
              className="w-8 h-8 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Processing your login...
          </p>
          
          {/* Success Animation */}
          <div className="flex justify-center">
            <div className="animate-pulse">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
