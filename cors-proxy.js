// cors-proxy.js - Simple CORS proxy server for development
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: true, // Allow any origin
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create a proxy middleware for the API
const apiProxy = createProxyMiddleware({
  target: "http://https://nanda-registry.com",
  changeOrigin: true,
  pathRewrite: {
    "^/api": "/api", // Don't rewrite the path
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the proxied request
    console.log(`Proxying ${req.method} ${req.url} -> ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error", message: err.message });
  },
});

// Apply the proxy middleware to /api path
app.use("/api", apiProxy);

// Define the port
const PORT = process.env.PORT || 3030;

// Start the server
app.listen(PORT, () => {
  console.log(`CORS Proxy server is running on port ${PORT}`);
  console.log(
    `Proxying requests from http://localhost:${PORT}/api to http://https://nanda-registry.com/api`
  );
  console.log(
    `To use this proxy, set REACT_APP_API_URL=http://localhost:${PORT}/api in your .env file`
  );
});
