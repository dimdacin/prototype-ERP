# ERP SaaS - Enterprise Resource Management

## Overview
This is a comprehensive Enterprise Resource Planning (ERP) system designed as a SaaS application for managing construction projects and business operations. It provides modules for project management (chantiers), employee tracking (salariés), equipment management (équipements), purchasing, finances, budgeting, and documentation. The system targets construction and industrial businesses, offering features like budget tracking, resource allocation, workload planning, and multi-language support (French, Russian, Romanian).

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite for bundling, Wouter for routing, TanStack Query v5 for server state.
- **UI/UX**: shadcn/ui components (Radix UI primitives), Tailwind CSS for styling with custom design tokens. Design is inspired by Carbon Design System and Linear, optimized for dark mode with a professional enterprise aesthetic and a custom HSL color palette.
- **State Management**: TanStack Query for server state, React hooks for local UI state, React Hook Form with Zod for forms.
- **Internationalization**: i18next with react-i18next for French, Russian, and Romanian language support, with language persistence in localStorage.

### Backend Architecture
- **Server**: Express.js on Node.js (ESM architecture) for RESTful API endpoints.
- **API Structure**: RESTful endpoints for `chantiers`, `salaries`, `equipements`, `depenses`, supporting standard CRUD operations. Multer handles file uploads.
- **Data Validation**: Zod schemas for runtime type validation, derived from Drizzle ORM definitions.
- **Development**: Vite middleware for HMR, Replit-specific plugins, esbuild for production server bundling.

### Data Storage
- **Database**: PostgreSQL via Neon serverless database, with Drizzle ORM for type-safe queries and schema management. Connection pooling with `@neondatabase/serverless`.
- **Schema**: Core tables include `users`, `chantiers`, `salaries`, `equipements`, `affectations_salaries`, `affectations_equipements`, `depenses`. Features include UUID primary keys, decimal precision for financial data, array columns, timestamp tracking, and status enums.
- **Data Handling**: Excel file parsing using `xlsx` library, with auto-detection for column mappings and bulk insert capabilities.

## External Dependencies

- **Core Infrastructure**: Neon Database (PostgreSQL), Drizzle Kit (migrations).
- **UI & Visualization**: Recharts (data visualization), Radix UI (headless components), Lucide React (icons), cmdk (command palette).
- **Form & Data Handling**: React Hook Form, @hookform/resolvers (Zod integration), date-fns, xlsx (Excel parsing).
- **Styling & Theming**: Tailwind CSS, class-variance-authority, tailwind-merge.
- **Development Tools**: TypeScript, ESBuild, Replit Vite Plugins.
- **File Upload**: Multer (multipart form data, in-memory storage).
- **Session Management**: connect-pg-simple (PostgreSQL session store).