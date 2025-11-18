# ERP Construction - AI Coding Agent Instructions

## Architecture Overview

This is a **full-stack TypeScript ERP system** for construction project management with:
- **Frontend**: React 18 + Vite + wouter routing + TanStack Query + shadcn/ui
- **Backend**: Express.js with ESM modules + Drizzle ORM + PostgreSQL (Neon)
- **Shared**: Zod schemas and TypeScript types in `shared/`
- **Monorepo**: Client and server in same repo with shared dependencies

## Key Development Patterns

### 1. Database Schema & Type Safety
- **Schema definition**: `shared/schema.ts` - Drizzle tables + Zod validation schemas
- **Pattern**: Every table has UUID primary keys (`gen_random_uuid()`)
- **Naming**: PostgreSQL snake_case → TypeScript camelCase (Drizzle handles mapping)
- **Foreign Keys**: Proper relations with onDelete behaviors
- **Decimals**: Use `decimal(12,2)` for budgets, `decimal(10,2)` for rates

```typescript
// shared/schema.ts pattern
export const myTable = pgTable("my_table", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  relatedId: varchar("related_id").references(() => otherTable.id, { onDelete: "set null" }),
});

export const insertMyTableSchema = createInsertSchema(myTable).omit({ id: true, createdAt: true });
export type InsertMyTable = z.infer<typeof insertMyTableSchema>;
```

### 2. API Layer Architecture
- **Routes**: `server/routes.ts` - RESTful endpoints with Zod validation
- **Storage**: `server/storage.ts` - Database abstraction layer with `DbStorage` class
- **Services**: `server/services/` - Business logic (e.g., `chantier-details.ts`)
- **Pattern**: Validate input → Storage method → Return JSON

### 3. Frontend State Management
- **TanStack Query**: All server state in `client/src/lib/queryClient.ts`
- **Query Keys**: Use route paths `['/api/endpoint']`
- **Mutations**: Always invalidate relevant queries after success
- **No local state**: Server state via queries, form state via react-hook-form

```typescript
// Query pattern
const { data: items } = useQuery<Item[]>({ queryKey: ['/api/items'] });

// Mutation pattern
const createItem = useMutation({
  mutationFn: (data: InsertItem) => apiRequest('POST', '/api/items', data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/items'] })
});
```

### 4. Internationalization (i18n)
- **Setup**: `client/src/i18n/config.ts` with fr/ru/ro locales
- **Usage**: `const { t } = useTranslation()` then `{t('nav.dashboard')}`
- **Storage**: Language preference in localStorage
- **Pattern**: Nested keys like `nav.dashboard`, `common.save`, `equipements.title`

### 5. UI Components & Forms
- **shadcn/ui**: Pre-built components in `client/src/components/ui/`
- **Custom components**: In `client/src/components/` (e.g., `DataTable.tsx`)
- **Forms**: react-hook-form + Zod resolvers + shadcn Form components
- **Dialogs**: Modal patterns with controlled open/close state

### 6. Excel Import System
- **Script**: `server/import-data.ts` - Intelligent column mapping & bulk insert
- **Pattern**: XLSX → JSON → Zod validation → Database insert
- **Matching**: Smart name matching for FK relations (e.g., operator names → IDs)

## Critical File Structure

```
shared/schema.ts          # Single source of truth for all data types
server/routes.ts          # All API endpoints
server/storage.ts         # Database operations abstraction
client/src/App.tsx        # Root component with routing
client/src/lib/queryClient.ts  # TanStack Query setup
client/src/pages/         # Route components
client/src/components/ui/ # shadcn components (don't edit)
```

## Developer Workflows

### Database Changes
1. Edit `shared/schema.ts` (both Drizzle table + Zod schema)
2. Run `npm run db:push` to sync PostgreSQL
3. **IMPORTANT**: Restart dev server (`npm run dev`) - Drizzle mappings cached at startup

### Adding New Pages/Features
1. Add table to `shared/schema.ts` with Insert/Select types
2. Add CRUD routes to `server/routes.ts` with Zod validation
3. Add storage methods to `server/storage.ts`
4. Create page component in `client/src/pages/`
5. Add route to `client/src/App.tsx`
6. Add translations to i18n locales

### Development Commands
- `npm run dev` - Start development server (port 5000)
- `npm run db:push` - Sync database schema
- `npm run build` - Production build

## Project-Specific Conventions

### Zero Value Handling
Always use explicit checks for zero values in displays:
```typescript
// ✅ Correct - shows legitimate zero values
{value !== undefined && value !== null ? `${value} €` : '-'}
// ❌ Wrong - hides zero values
{value ? `${value} €` : '-'}
```

### Multi-language Data
Some fields store operator names as strings while maintaining FK relationships:
```typescript
equipements.operatorId    // FK to salaries.id
equipements.operatorName  // Denormalized for multi-language display
```

### File Upload Pattern
Base64 encoding for file storage in database (photos, Excel):
```typescript
photo_facture_path: string  // Store as "data:image/jpeg;base64,..."
```

### Component Naming
- **Pages**: PascalCase (e.g., `Equipements.tsx`)
- **Components**: PascalCase (e.g., `DataTable.tsx`)  
- **Hooks**: camelCase starting with 'use' (e.g., `usePlanning.ts`)

### Critical Dependencies
- **wouter**: Lightweight routing (not React Router)
- **Drizzle**: Type-safe ORM (not Prisma)
- **TanStack Query v5**: Server state (not SWR)
- **i18next**: Internationalization

## Debugging Common Issues

### "Table not found" after schema changes
1. Ensure `npm run db:push` completed successfully
2. Restart development server - Drizzle caches schema mappings

### Import/Export Excel issues
1. Check column mapping in `server/import-data.ts`
2. Verify Excel headers match expected patterns
3. Use xlsx library for Excel manipulation

### Translation keys not found
1. Check all three locale files have the key: `fr.json`, `ru.json`, `ro.json`
2. Restart dev server if translations cached

Remember: This system prioritizes **type safety**, **developer experience**, and **real-world construction industry workflows**.