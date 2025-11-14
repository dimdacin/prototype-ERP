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

### Equipment Module Architecture (Excel-Driven)
- **Dynamic Columns**: Equipment module uses 29 columns (28 Excel data columns + 1 UI actions column) sourced directly from Excel file structure, not hardcoded definitions.
- **Column Metadata**: `shared/equipement-columns.ts` serves as single source of truth for column definitions, translations (FR/RU/RO), data types, formats, visibility defaults, and calculated column flags.
- **Column API**: GET `/api/equipements/excel-columns` endpoint delivers column metadata to frontend for dynamic rendering and visibility management.
- **Data Flow**: `Equipements.tsx` uses TanStack Query with query keys `['/api/equipements/excel-columns']` for metadata and `['/api/equipements']` for equipment data. Metadata loads first, triggers `useColumnVisibility` initialization via `useRef` guard, then table renders with `visibleColumns.map()` applying `formatColumnValue()` for each cell.
- **Generic Formatting**: `client/src/lib/equipmentFormatter.ts` provides type-safe formatters respecting dataType (text, number, currency, date, percent), format specifications, and decimal precision. `getColumnValue()` returns `undefined` for calculated columns (no `dbField`), triggering placeholder rendering in `formatColumnValue()`.
- **Calculated Columns**: Columns without database fields (e.g., hourly costs, balance values) display contextual placeholders ("À calculer", "Non disponible", "N/A") via `calculatedReason` flags ("pending_calculation", "requires_formula", "external_source"). These remain UI-only until calculation logic is implemented and corresponding DB columns are added.
- **Column Visibility**: `client/src/hooks/useColumnVisibility.ts` manages per-column show/hide state with localStorage key `'equipements-column-visibility'`. On first load, checks localStorage; if absent, uses `defaultVisible` from metadata. Late initialization via `useRef(hasInitialized)` ensures state hydrates after async metadata arrives, preventing empty ColumnSelector on mount.
- **Future Extensibility**: Calculated columns can be added to database incrementally as calculation logic is implemented, maintaining Excel structure parity for exports and audits. Current boundary: 12 columns have `dbField` (persisted), 16 columns are calculated/UI-only (pending implementation).

## External Dependencies

- **Core Infrastructure**: Neon Database (PostgreSQL), Drizzle Kit (migrations).
- **UI & Visualization**: Recharts (data visualization), Radix UI (headless components), Lucide React (icons), cmdk (command palette).
- **Form & Data Handling**: React Hook Form, @hookform/resolvers (Zod integration), date-fns, xlsx (Excel parsing).
- **Styling & Theming**: Tailwind CSS, class-variance-authority, tailwind-merge.
- **Development Tools**: TypeScript, ESBuild, Replit Vite Plugins.
- **File Upload**: Multer (multipart form data, in-memory storage).
- **Session Management**: connect-pg-simple (PostgreSQL session store).