export const logEvent = (eventName, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${eventName}:`, data);
  
  // Add your analytics service implementation here
  // Example: Firebase Analytics, Google Analytics, etc.
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(eventName, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};
