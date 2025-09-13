# FloodWatch - Disaster Management System

## Overview

FloodWatch is a comprehensive web application for disaster management, specifically focused on flood relief and risk zone identification. The system provides real-time flood monitoring, resource allocation, affected population tracking, and coordination between relief organizations, district authorities, and field workers. Built as a full-stack application with modern web technologies, it enables effective disaster response through data-driven decision making and streamlined operations management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds
- **Maps Integration**: Leaflet for interactive geospatial visualization of flood zones and affected areas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL via Neon serverless for scalable, cloud-native data storage
- **Session Management**: Express sessions with PostgreSQL store for persistent user sessions
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **API Design**: RESTful endpoints with standardized error handling and logging middleware

### Data Storage Solutions
- **Primary Database**: PostgreSQL with the following core entities:
  - **Flood Zones**: Geographic areas with risk levels, coordinates, and monitoring data
  - **Affected Population**: Individuals and families with location, needs, and evacuation status
  - **Resources**: Inventory tracking for food, medical supplies, shelter materials
  - **Relief Distribution**: Distribution records linking resources to recipients and locations
  - **Weather Alerts**: Real-time alerts with severity levels and geographic targeting
  - **Response Teams**: Team coordination with status tracking and assignment management
  - **Activity Logs**: Comprehensive audit trail for all system operations
- **Schema Management**: Drizzle migrations for version-controlled database evolution
- **Connection Pooling**: Neon serverless connection pooling for optimal performance

### Authentication and Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role-Based Access**: Multi-tier user roles (district_officer, ngo, field_worker) with appropriate permissions
- **Security Headers**: HTTPS enforcement, secure cookies, and CORS configuration
- **User Profile Management**: Integrated user data synchronization with authentication provider

### Component Architecture
- **Design System**: Consistent component library built on Radix UI primitives
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **Data Visualization**: Recharts integration for analytics dashboards and reporting
- **Real-time Updates**: Polling-based data refresh for live dashboard updates
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes

## External Dependencies

### Core Infrastructure
- **Database Hosting**: Neon PostgreSQL serverless for scalable cloud database
- **Authentication**: Replit Auth service for secure user management
- **Map Tiles**: OpenStreetMap for base map layers and geographic data
- **Session Storage**: PostgreSQL-based session persistence

### Development and Build Tools
- **Package Manager**: npm with lockfile for reproducible builds
- **Development Server**: Vite dev server with HMR and React Fast Refresh
- **TypeScript Compiler**: Strict mode configuration for enhanced type safety
- **Build Pipeline**: ESBuild for server bundling, Vite for client optimization
- **Replit Integration**: Cartographer and dev banner plugins for Replit environment

### Third-Party Libraries
- **UI Components**: Comprehensive Radix UI component collection for accessibility
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for localized date formatting and manipulation
- **Validation**: Zod schemas for runtime type validation and form validation
- **Charts**: Recharts for data visualization and analytics dashboards
- **Maps**: Leaflet with React integration for interactive geospatial features

### API Integrations
- **Weather Data**: Configurable weather API integration for real-time meteorological data
- **Geospatial Services**: OpenStreetMap for mapping and geocoding services
- **WebSocket Support**: Infrastructure in place for future real-time features