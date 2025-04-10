# Handling CORS Issues with NANDA API

This guide explains how to resolve Cross-Origin Resource Sharing (CORS) issues when connecting to the NANDA API.

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers that blocks frontend JavaScript code from making requests to a different domain than the one that served the web page. This is happening because the NANDA backend server doesn't have CORS headers configured to allow requests from your local development environment.

## Solutions

We've implemented several approaches to fix this issue:

### 1. Development Proxy (Recommended)

The simplest way to bypass CORS issues in development is to use the proxy feature of Create React App. We've already configured this in `package.json`:

```json
{
  "proxy": "https://nanda-registry.com"
}
```

This will automatically proxy all relative API requests (like `/api/auth/register`) to the NANDA backend.

### 2. Custom CORS Proxy Server

For cases where the built-in proxy doesn't work, we've created a custom proxy server:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the proxy server:

   ```bash
   npm run proxy
   ```

3. In a separate terminal, start the React app:
   ```bash
   npm start
   ```

Or run both simultaneously:

```bash
npm run dev
```

The proxy server will run on port 3030 and forward requests to the NANDA API.

### 3. Direct API Calls with CORS Workarounds

As a fallback, we've implemented direct API calls in `src/api/directApi.js` that try different approaches to bypass CORS restrictions.

## Troubleshooting

If you're still encountering CORS issues:

1. Check the browser console for specific error messages
2. Make sure to restart the development server after any configuration changes
3. Try using a browser extension like CORS Unblock (for testing only)
4. Check if your network or firewall is blocking connections to the NANDA API

## Production Deployment

For production deployment, you'll need to properly configure the NANDA backend to allow requests from your production domain, or set up a proper API proxy on your server.
