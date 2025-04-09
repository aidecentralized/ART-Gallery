# Nanda Gallery

## About

Nanda Gallery is a comprehensive web application developed by the MIT Media Lab that serves as a platform for exploring and managing MCP Servers. The application provides a decentralized registry and explorer for various types of AI capabilities including agents, resources, and tools.

## Project Overview

Nanda Gallery offers a modern React-based web interface that allows users to:

- Explore available servers
- Register and manage their own servers
- View detailed information about specific Nanda serers
- Filter and search through the gallery using various criteria
- Verify and validate server authenticity

## Technical Architecture

### Frontend Framework

- Built with React (v18.2.0)
- Uses React Router (v6.15.0) for navigation
- Styling with CSS modules

### Project Structure

```
├── api_spec.yaml          # API specification document
├── build/                 # Compiled production build
├── public/                # Static public assets
└── src/                   # Source code
    ├── App.jsx            # Main application component
    ├── index.js           # Application entry point
    ├── index.css          # Global styles
    ├── api/               # API client and services
    │   ├── analytics.js   # Analytics API integration
    │   ├── auth.js        # Authentication API integration
    │   ├── client.js      # Base API client configuration
    │   ├── discovery.js   # Discovery/search API integration
    │   ├── index.js       # API exports
    │   ├── servers.js     # Server management API
    │   ├── verification.js # Verification API integration
    │   └── webhooks.js    # Webhook API integration
    ├── assets/            # Static assets (images, icons, etc.)
    ├── components/        # React components
    │   ├── common/        # Shared/reusable components
    │   │   ├── ErrorMessage.jsx    # Error display component
    │   │   ├── LoadingSpinner.jsx  # Loading indicator
    │   │   └── ServerCard.jsx      # Server/item display card
    │   ├── layout/        # Layout components
    │   │   ├── Footer.jsx          # Site footer
    │   │   ├── Header.jsx          # Site header/navigation
    │   │   ├── Layout.jsx          # Main layout wrapper
    │   │   └── MainLayout.jsx      # Page layout structure
    │   └── pages/         # Page components
    │       ├── NotFoundPage.jsx    # 404 error page
    │       ├── auth/               # Authentication pages
    │       ├── dashboard/          # User dashboard
    │       ├── explorer/           # Gallery explorer
    │       ├── home/               # Homepage
    │       ├── registry/           # Registry management
    │       └── server/             # Server/item detail pages
    ├── context/           # React context providers
    │   └── AuthContext.js # Authentication context
    ├── styles/            # Global styles
    │   └── globals.css    # Global CSS variables and styles
    └── utils/             # Utility functions
```

### Key Features

#### Explorer

The Explorer page allows users to browse and search through the gallery's collection. Features include:

- Advanced filtering by type, verification status, and categories
- Full-text search functionality
- Interactive card-based interface
- Pagination for large result sets
- Sorting by relevance, popularity, recency, and rating

#### Registry

The Registry section enables authenticated users to:

- Register new servers in the gallery
- Update existing servers they own
- Manage their contributions
- View statistics and analytics about their servers

#### Authentication

The application includes a complete authentication system with:

- User registration
- Login functionality
- Protected routes for authenticated users
- Authentication state management via React Context

#### Verification

The verification system ensures the quality and authenticity of servers by:

- Providing verification status indicators
- Supporting a verification workflow
- Displaying verification details to users

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Build

To create a production build:

```
npm run build
```

## API Integration

The application integrates with several backend APIs:

- Authentication API for user management
- Server API for server data
- Discovery API for search functionality
- Verification API for validation processes
- Analytics API for usage statistics
- Webhook API for event notifications

## Future Enhancements

- Improve the UI
- Simplify the registration process
- Open-source the package

## License

This project was developed by the MIT Media Lab and a team of Industry and Independent Contributors.
