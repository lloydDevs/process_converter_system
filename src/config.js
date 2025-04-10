// Central configuration for API endpoints
const config = {
  // Default to localhost if no env variable is set
  API_BASE_URL:
    process.env.REACT_APP_API_BASE_URL || "http://192.168.1.39:3001",
};

export default config;
