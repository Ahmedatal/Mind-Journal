# Mindful Journal

## Overview

Mindful Journal is a full-stack AI-powered journaling application that helps users reflect on their thoughts and emotions. The platform combines personal journaling with intelligent analysis, providing users with sentiment analysis, theme extraction, mood tracking, and personalized insights about their writing patterns. Built as a modern web application, it offers a clean interface for writing journal entries while leveraging AI to provide meaningful feedback and analytics about the user's journaling journey.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with:

- **UI Framework**: Radix UI components with shadcn/ui styling system for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend is organized into logical sections: pages for main routes, components for reusable UI elements, hooks for shared logic, and lib utilities for common functions.

### Backend Architecture
The server uses Express.js with TypeScript in an ESM module setup:

- **API Structure**: RESTful endpoints organized by feature (auth, journal, insights, analytics)
- **Request Handling**: Express middleware for logging, error handling, and request parsing
- **Validation**: Zod schemas for runtime type checking of API requests and responses
- **Development**: Development server with hot reload capabilities through Vite integration

### Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM:

- **Database Provider**: Neon serverless PostgreSQL for cloud hosting
- **ORM**: Drizzle ORM with type-safe database queries and schema management
- **Schema Design**: Relational database design with proper foreign key relationships
- **Migrations**: Automated database schema migrations through Drizzle Kit

Key database entities include users, journal entries, AI prompts, insights, and session storage for authentication.

### Authentication System
Authentication is handled through Replit's OpenID Connect integration:

- **Provider**: Replit OIDC for secure authentication
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Middleware**: Passport.js strategy for OIDC authentication flow
- **Security**: Secure session cookies with proper HTTP security headers

### AI Integration
The application integrates with OpenAI's GPT models for intelligent content analysis:

- **Sentiment Analysis**: Analyzes journal entries to determine emotional tone and confidence levels
- **Theme Extraction**: Identifies recurring topics and themes across journal entries
- **Insight Generation**: Creates personalized insights about writing patterns and emotional trends
- **Prompt Generation**: Suggests writing prompts to inspire new journal entries

All AI processing is done server-side with proper error handling and fallback mechanisms.

## External Dependencies

### Core Framework Dependencies
- **React 18+**: Frontend framework with hooks and modern React patterns
- **Express.js**: Node.js web framework for API server
- **TypeScript**: Static typing for both client and server code
- **Vite**: Build tool and development server with hot reload

### Database and ORM
- **PostgreSQL**: Primary database (via Neon serverless)
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **Drizzle Kit**: Database migration and introspection tools

### Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with OIDC strategy
- **OpenID Client**: OIDC client library for authentication flows

### UI and Styling
- **Radix UI**: Headless UI component library for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component system built on Radix + Tailwind
- **Lucide React**: Icon library for consistent iconography

### State Management and Data Fetching
- **TanStack Query**: Powerful data synchronization for React
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation library

### AI and Analysis
- **OpenAI API**: GPT models for content analysis and generation
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **ESLint + TypeScript**: Code linting and type checking
- **PostCSS**: CSS processing with Tailwind integration
- **Replit Runtime**: Development environment integration