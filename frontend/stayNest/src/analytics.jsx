// Set the user ID in Google Analytics
export const setUserId = (userId) => {
  try {
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID && userId) {
      ReactGA.set({ user_id: userId });
      console.log("GA: Set user_id", userId);
    }
  } catch (error) {
    console.error("Failed to set user ID in GA:", error);
  }
};

// Set custom user properties in Google Analytics (GA4)
export const setUserProperties = (properties) => {
  try {
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID && properties) {
      ReactGA.set(properties);
      console.log("GA: Set user properties", properties);
    }
  } catch (error) {
    console.error("Failed to set user properties in GA:", error);
  }
};
import ReactGA from "react-ga4";
import * as React from "react";

// Error boundary for analytics
const AnalyticsErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    // If there's an error, just return null (analytics won't work but app will)
    return null;
  }

  return children;
};

export const initializeAnalytics = () => {
  try {
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
      console.log(
        "Initializing Google Analytics with ID:",
        import.meta.env.VITE_GOOGLE_ANALYTICS_ID
      );
      ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
        debug_mode: true,
        test_mode: false,
      });
    }
  } catch (error) {
    console.error("Failed to initialize Google Analytics:", error);
  }
};

export const trackPageView = (pagePath) => {
  try {
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
      console.log("Tracking page view:", pagePath);
      ReactGA.send({
        hitType: "pageview",
        page: pagePath,
        title: document.title,
      });
    }
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
};

export const trackEvent = (category, action, label, value) => {
  try {
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
      console.log("Tracking event:", { category, action, label, value });
      ReactGA.event({
        category: category,
        action: action,
        label: label,
        value: value,
      });
    }
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};

// Wrap your App component with the error boundary
export const AnalyticsWrapper = ({ children }) => {
  return <AnalyticsErrorBoundary>{children}</AnalyticsErrorBoundary>;
};
