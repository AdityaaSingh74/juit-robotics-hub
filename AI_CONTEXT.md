# AI_CONTEXT.md - Project Architecture & Development Guide

**Purpose**: This document provides comprehensive context for AI assistants and developers to understand the project architecture, design decisions, and common patterns.

**Last Updated**: December 11, 2025
**Project Version**: 0.0.0 (feature/website-improvements)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack Details](#tech-stack-details)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [Key Design Decisions](#key-design-decisions)
8. [Component Architecture](#component-architecture)
9. [API Integration Patterns](#api-integration-patterns)
10. [Common Tasks & Patterns](#common-tasks--patterns)
11. [State Management Strategy](#state-management-strategy)
12. [Styling System](#styling-system)
13. [Error Handling & Validation](#error-handling--validation)
14. [Performance Optimization](#performance-optimization)
15. [Future Improvements](#future-improvements-planned)

---

## Project Overview

### What is JUIT Robotics Hub?

A full-stack web application for managing robotics club operations, featuring:
- Public-facing website for project showcase
- Admin dashboard for content management
- Real-time data synchronization
- Modern responsive UI
- Type-safe development with TypeScript

### Core Objectives
1. **Showcase Projects**: Display robotics projects with details and images
2. **Manage Content**: Admin interface to update projects, faculty, equipment
3. **User Experience**: Fast, responsive, beautiful interface
4. **Maintainability**: Clean code, well-organized structure, good documentation
5. **Scalability**: Ready for growth and additional features

### User Roles
- **Anonymous Users**: View public pages (home, projects, faculty, facilities)
- **Authenticated Admins**: Full control over content via dashboard
- **Guests**: Can browse without authentication

---

## Architecture Overview

### High-Level Architecture

```
┌────────────────────────┐
│  CLIENT (Browser)                 │
│  ┌──────────────────┐ │
│  │ React 18 Components          │ │
│  │ - Pages (routing)            │ │
│  │ - Components (reusable)      │ │
│  │ - Hooks (logic)              │ │
│  └──────────────────┘ │
│                                    │
│  ┌──────────────────┐ │
│  │ State Management Layer       │ │
│  │ - React Query (server state) │ │
│  │ - React Context (UI state)   │ │
│  │ - Hooks (local state)        │ │
│  └──────────────────┘ │
│                                    │
│  ┌──────────────────┐ │
│  │ API Integration Layer        │ │
│  │ - Axios HTTP client          │ │
│  │ - Supabase JS client         │ │
│  │ - Error handling             │ │
│  └──────────────────┘ │
└────────────────────────┘
         HTTPS/WebSocket
         ↓
┌────────────────────────┐
│  SUPABASE (Backend as a Service) │
│  ┌──────────────────┐ │
│  │ PostgreSQL Database         │ │
│  │ - projects                   │ │
│  │ - faculty_members            │ │
│  │ - equipment                  │ │
│  │ - notifications              │ │
│  └──────────────────┘ │
│                                    │
│  ┌──────────────────┐ │
│  │ Authentication              │ │
│  │ - JWT tokens                 │ │
│  │ - Session management        │ │
│  └──────────────────┘ │
│                                    │
│  ┌──────────────────┐ │
│  │ Storage (S3-compatible)     │ │
│  │ - Project images             │ │
│  │ - Facility photos            │ │
│  │ - Team photos                │ │
│  └──────────────────┘ │
└────────────────────────┘
```

### Data Flow

```
User Interaction
      ↓
Component/Hook
      ↓
API Call (axios/supabase)
      ↓
HTTP Request
      ↓
Supabase Server
      ↓
Database Query
      ↓
Database Response
      ↓
HTTP Response
      ↓
React Query Cache
      ↓
Component Re-render
      ↓
UI Update
```

---

## Tech Stack Details

### Why Each Technology?

#### React 18 + TypeScript
- **Why**: Component-based architecture, perfect for UI-heavy apps
- **Benefits**: Reusable components, type safety, better DX
- **Usage**: Building all UI components, managing component state

#### Vite
- **Why**: Lightning-fast build tool and dev server
- **Benefits**: <100ms HMR, instant page reloads, optimal production builds
- **Replaces**: Create React App (CRA) is slower

#### Tailwind CSS
- **Why**: Utility-first CSS framework
- **Benefits**: Fast development, consistent design system, small bundle size
- **Approach**: Use predefined classes, customize via config when needed

#### Shadcn/UI
- **Why**: Unstyled, accessible components built on Radix UI
- **Benefits**: Full control, great for custom theming, well-maintained
- **Components Used**: Button, Dialog, Form, Tabs, Cards, etc.

#### React Router v6
- **Why**: Client-side routing
- **Benefits**: No page reloads, smooth navigation, nested routes
- **Routes**:
  - `/` - Home page
  - `/admin` - Admin login
  - `/admin/dashboard` - Admin dashboard
  - `/*` - 404 page

#### React Query (TanStack Query)
- **Why**: Server state management
- **Benefits**: Automatic caching, background sync, deduplication
- **When to use**: Fetching from API, managing async data

#### Supabase
- **Why**: Backend as a Service (BaaS)
- **Benefits**: PostgreSQL database, built-in auth, real-time subscriptions, S3 storage
- **Replaces**: Need for custom backend infrastructure

#### Zod
- **Why**: TypeScript-first schema validation
- **Benefits**: Type inference, runtime validation, excellent error messages
- **Usage**: Form validation, API response validation

#### Framer Motion
- **Why**: Animation library
- **Benefits**: Smooth animations, gesture support, great performance
- **Usage**: Page transitions, loading animations, parallax effects

---

## Project Structure

### Directory Organization

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── ui/             # Shadcn/ui base components
│   └── (other components)
├── pages/              # Routed pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions & services
├── integrations/       # External service clients
├── assets/             # Static files
├── App.tsx             # Root component with routing
├─┠ main.tsx            # React entry point
├─┠ index.css           # Global styles
└─┠ vite-env.d.ts       # Type definitions
```

### Naming Conventions

#### Files
- **Components**: PascalCase (e.g., `ProjectForm.tsx`)
- **Utilities**: camelCase (e.g., `emailService.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

#### Functions & Variables
- **React Components**: PascalCase
- **Hooks**: camelCase starting with `use` (e.g., `useAuth`)
- **Constants**: UPPER_SNAKE_CASE
- **Regular variables**: camelCase

#### CSS Classes
- **Tailwind**: Use utility classes directly
- **Custom**: camelCase with `cn()` for conditional classes

---

## Database Schema

### Tables Overview

#### Projects Table
```typescript
interface Project {
  id: bigint;                    // Primary key
  name: string;                  // Project name
  description: string | null;    // Long description
  image_url: string | null;      // Featured image
  category: string | null;       // e.g., "Robotics", "AI"
  status: string;                // "active", "completed", "planning"
  team_members: string[] | null; // JSON array of member names
  technologies: string[] | null; // Tech stack used
  created_at: timestamp;         // Creation timestamp
  updated_at: timestamp;         // Last update timestamp
}
```

#### Faculty Members Table
```typescript
interface FacultyMember {
  id: bigint;
  name: string;
  email: string | null;
  role: string;                 // "Advisor", "Mentor", "Coordinator"
  department: string | null;
  image_url: string | null;
  bio: text | null;
  created_at: timestamp;
  updated_at: timestamp;
}
```

#### Equipment Table
```typescript
interface Equipment {
  id: bigint;
  name: string;
  description: text | null;
  category: string;             // "Actuators", "Sensors", "Electronics"
  quantity: integer;
  condition: string;             // "Good", "Fair", "Needs Repair"
  image_url: string | null;
  specifications: jsonb | null;  // Technical specs
  created_at: timestamp;
  updated_at: timestamp;
}
```

#### Notifications Table
```typescript
interface Notification {
  id: bigint;
  user_id: uuid;                 // Admin user
  title: string;
  message: text;
  type: string;                  // "info", "warning", "success", "error"
  read: boolean;
  action_url: string | null;     // Link to action
  created_at: timestamp;
}
```

#### Admin Logs Table (Audit)
```typescript
interface AdminLog {
  id: bigint;
  admin_id: uuid;
  action: string;                // "create", "update", "delete"
  table_name: string;            // Which table was modified
  record_id: bigint;
  changes: jsonb;                // What changed
  ip_address: string | null;
  created_at: timestamp;
}
```

### Key Relationships

```
Projects
  ├─ Team Members (stored as JSON array)
  ├─ Created by Admin
  └─ Images in Storage

FacultyMembers
  ├─ Email for contact
  ├─ Profile image in Storage
  └─ Optional department

Equipment
  ├─ Specifications (JSON)
  ├─ Images in Storage
  └─ Quantity tracking

Notifications
  ├─ Links to specific admin
  └─ Can include action URL

AdminLogs
  ├─ Tracks all modifications
  ├─ Records what changed
  └─ Stores IP address
```

---

## Authentication Flow

### Complete Authentication Journey

#### 1. User Visits Admin Page
```
User navigates to /admin
  ↓
Check localStorage for JWT token
  ↓
If no token -> Redirect to login form
If token exists -> Verify with Supabase
  ↓
If valid -> Allow access to dashboard
If invalid -> Clear token, redirect to login
```

#### 2. Login Process
```
User enters credentials
  ↓
Submit to Supabase Auth
  ↓
Supabase validates credentials
  ↓
If valid:
  - Generate JWT token
  - Return token to client
  - Store in localStorage
  - Redirect to dashboard

If invalid:
  - Display error message
  - Remain on login page
```

#### 3. Protected API Calls
```
Component needs data
  ↓
Use axios with interceptor
  ↓
Interceptor adds Authorization header
  ↓
Request: "Authorization: Bearer {token}"
  ↓
Server validates token
  ↓
If valid -> Return data
If invalid -> Return 401 Unauthorized
  ↓
Client refreshes token or redirects to login
```

#### 4. Token Refresh
```
API returns 401 (token expired)
  ↓
Interceptor attempts refresh
  ↓
Request new token using refresh token
  ↓
Supabase validates refresh token
  ↓
If valid -> Return new JWT
If invalid -> Redirect to login
  ↓
Retry original request with new token
```

#### 5. Logout
```
User clicks logout
  ↓
Call Supabase logout
  ↓
Invalidate refresh token on server
  ↓
Clear token from localStorage
  ↓
Redirect to login page
```

### Security Considerations

- **Tokens**: Store in localStorage (consider httpOnly cookie for production)
- **HTTPS**: Always use HTTPS in production
- **Token Expiry**: Short-lived tokens (15 min) with refresh tokens (7 days)
- **CORS**: Configured for Supabase domain
- **RLS**: Row Level Security enabled on sensitive tables

---

## Key Design Decisions

### 1. Vite over Create React App
**Decision**: Use Vite for development and build
**Reasons**:
- HMR is <100ms (CRA is slow)
- Native ES modules support
- Minimal configuration
- Fast production builds

### 2. Shadcn/UI over Component Library
**Decision**: Use Shadcn/UI instead of Material-UI or Ant Design
**Reasons**:
- Full control over styling
- Unstyled components (we choose the design)
- Small bundle size
- Great with Tailwind CSS
- Copy/paste approach (no node_modules bloat)

### 3. React Query for Server State
**Decision**: Use React Query instead of Redux or Context
**Reasons**:
- Built for server state management
- Automatic caching and synchronization
- Reduces boilerplate code
- Built-in deduplication
- Powerful devtools

### 4. Supabase over Firebase/Custom Backend
**Decision**: Use Supabase for backend
**Reasons**:
- PostgreSQL (not NoSQL)
- Built-in authentication
- Real-time subscriptions
- Row Level Security (RLS)
- S3-compatible storage
- Familiar SQL syntax

### 5. TypeScript Strict Mode
**Decision**: Enable strict TypeScript checking
**Reasons**:
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Reduces runtime bugs

### 6. Monolithic vs Micro-frontend
**Decision**: Monolithic frontend (single SPA)
**Reasons**:
- Simpler deployment
- Easier code sharing
- Good enough for current scale
- Can split later if needed

---

## Component Architecture

### Component Types

#### 1. Page Components (in `src/pages/`)
```typescript
// Full-page components that match routes
export default function Index() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Footer />
    </main>
  );
}
```

#### 2. Feature Components (in `src/components/`)
```typescript
// Larger components that handle a feature
interface ProjectProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

export default function ProjectShowcase({ projects, onSelectProject }: ProjectProps) {
  return (
    <section>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} onClick={() => onSelectProject(project.id)} />
      ))}
    </section>
  );
}
```

#### 3. Presentational Components (in `src/components/ui/`)
```typescript
// Reusable, low-level UI components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'font-medium transition-colors',
        variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'outline' && 'border border-gray-300 hover:bg-gray-50',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'px-4 py-2',
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
```

#### 4. Container/Smart Components
```typescript
// Components that handle data fetching and state
export function ProjectsContainer() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  });

  if (isLoading) return <LoadingSpinner />;

  return <ProjectShowcase projects={projects || []} />;
}
```

### Component Best Practices

1. **Keep components small** (max 200 lines)
2. **Single responsibility**: One job per component
3. **Prop drilling**: Use Context for deep nesting (not recommended for this app)
4. **Memoization**: Use `React.memo` for expensive renders
5. **Keys in lists**: Always use unique, stable keys

---

## API Integration Patterns

### Fetching Data with React Query

```typescript
// Hook pattern
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await axios.get('/api/projects');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (garbage collection)
  });
}

// Usage in component
function ProjectList() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {projects?.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

### Mutations (Create/Update/Delete)

```typescript
function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      const response = await axios.put(`/api/projects/${project.id}`, project);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      // Handle error
      console.error('Failed to update project:', error);
    },
  });
}
```

### Supabase Direct Integration

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Query
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active');

// Insert
const { data, error } = await supabase
  .from('projects')
  .insert([{ name: 'New Project', description: '...' }]);

// Real-time subscription
const subscription = supabase
  .from('projects')
  .on('*', payload => {
    console.log('Change detected:', payload);
  })
  .subscribe();
```

### Axios Interceptors

```typescript
// Setup in a service file
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle responses
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);
```

---

## Common Tasks & Patterns

### Adding a New Page

1. **Create page component** in `src/pages/NewPage.tsx`
   ```typescript
   export default function NewPage() {
     return <div>New Page Content</div>;
   }
   ```

2. **Add route** in `src/App.tsx`
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```

3. **Add navigation link** in `Navbar.tsx` or menu

### Adding a New API Endpoint

1. **Create hook** in appropriate location
   ```typescript
   function useFetchData() {
     return useQuery({
       queryKey: ['data'],
       queryFn: () => axios.get('/api/data'),
     });
   }
   ```

2. **Use in component**
   ```typescript
   const { data } = useFetchData();
   ```

### Form Implementation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Adding Animations

```typescript
import { motion } from 'framer-motion';

function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

### Error Handling

```typescript
function MyComponent() {
  const { data, error, isLoading } = useQuery({...});

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (!data) return <EmptyState />;

  return <Content data={data} />;
}
```

### Loading States

```typescript
function MyComponent() {
  const { isPending } = useMutation({...});

  return (
    <button disabled={isPending}>
      {isPending ? 'Loading...' : 'Submit'}
    </button>
  );
}
```

---

## State Management Strategy

### Where to Store State?

```
╯────────────────────────╮
│ Is it from a server?                      │
├────────────────────────┤
│ YES       │ NO                           │
│ ↓        │                                │
│React Query │ Is it needed in many places?    │
│          │ ↓                             │
│          ├──────────────────────┤
│          │ YES       │ NO             │
│          │ ↓        │ ↓              │
│          │ Context   │ useState       │
│          │           │ (local)        │
╰────────────────────────╵
```

### React Query (Server State)
- Fetching from API
- Caching API responses
- Synchronizing with backend
- Pagination, filtering

### Context API (UI State)
- Theme (light/dark)
- Language
- User authentication
- Global modals

### useState (Local State)
- Form inputs
- Toggle visibility
- Component-specific state
- Temporary UI state

### localStorage (Persistent Client)
- Authentication tokens
- User preferences
- Theme selection
- Draft data

---

## Styling System

### Tailwind CSS Setup

```typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom colors if needed
      },
      spacing: {
        // Custom spacing
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

### Using Tailwind in Components

```typescript
// Simple case
function Card() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      Content
    </div>
  );
}

// Conditional classes with cn()
function Button({ variant = 'primary' }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      )}
    >
      Click me
    </button>
  );
}
```

### Dark Mode

Configured via `next-themes`:
```typescript
// In App.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>

// Usage
function MyComponent() {
  return (
    <div className="bg-white dark:bg-gray-900">
      Theme-aware content
    </div>
  );
}
```

---

## Error Handling & Validation

### Form Validation with Zod

```typescript
const projectSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  description: z.string().min(10),
  imageUrl: z.string().url('Invalid URL').optional(),
  status: z.enum(['active', 'completed', 'planning']),
});

type Project = z.infer<typeof projectSchema>;
```

### API Error Handling

```typescript
function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 400:
        return `Bad request: ${message}`;
      case 401:
        return 'Please log in';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error';
      default:
        return 'Unknown error';
    }
  }
  return 'Network error';
}
```

### User-Facing Error UI

```typescript
function ErrorAlert({ error }: { error: Error }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800 font-semibold">Error</p>
      <p className="text-red-700">{error.message}</p>
    </div>
  );
}
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load pages
const AdminPage = lazy(() => import('./pages/Admin'));
const DashboardPage = lazy(() => import('./pages/AdminDashboard'));

// In routes
<Suspense fallback={<LoadingScreen />}>
  <Route path="/admin" element={<AdminPage />} />
</Suspense>
```

### Memoization

```typescript
const ProjectCard = React.memo(function ProjectCard({ project }: Props) {
  return <div>{project.name}</div>;
});

// Or with callback
const handleClick = useCallback((id: string) => {
  // handler
}, [dependencies]);
```

### Image Optimization

```typescript
// Use Next Image or similar
<img
  src="image.jpg"
  alt="Description"
  loading="lazy"
  width={400}
  height={300}
/>
```

### React Query Optimization

```typescript
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000,      // 5 min: don't refetch if fresh
  gcTime: 30 * 60 * 1000,        // 30 min: keep in cache
  refetchOnWindowFocus: false,    // Don't refetch on window focus
});
```

---

## Future Improvements Planned

### Phase 2 Features
- [ ] **Comments & Discussion**: Allow users to comment on projects
- [ ] **Event Calendar**: Display robotics events and competitions
- [ ] **Team Member Profiles**: Individual pages for team members
- [ ] **Project Gallery**: Enhanced image galleries with lightbox
- [ ] **Newsletter Signup**: Email subscription for updates
- [ ] **Search Functionality**: Full-text search for projects
- [ ] **Analytics Dashboard**: Track website metrics

### Phase 3 Features
- [ ] **Mobile App**: React Native version
- [ ] **Social Integration**: Twitter, LinkedIn sharing
- [ ] **Blog/News**: News section for club updates
- [ ] **Project Filtering**: Advanced filters by technology, status
- [ ] **Image Upload**: Direct upload instead of URLs
- [ ] **Email Notifications**: Send updates to subscribers
- [ ] **Multi-language Support**: i18n implementation

### Technical Improvements
- [ ] **End-to-End Tests**: Cypress or Playwright
- [ ] **Unit Tests**: Vitest coverage
- [ ] **PWA Support**: Offline functionality
- [ ] **GraphQL**: Replace REST with GraphQL if needed
- [ ] **CDN**: Image CDN integration
- [ ] **SEO**: Meta tags, sitemap, structured data
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Performance**: Core Web Vitals optimization

### Infrastructure
- [ ] **CI/CD Pipeline**: GitHub Actions workflows
- [ ] **Monitoring**: Sentry or similar for error tracking
- [ ] **Analytics**: Google Analytics or Plausible
- [ ] **Logging**: Structured logging system
- [ ] **Database Backups**: Automated backup strategy
- [ ] **Disaster Recovery**: Backup and restore procedures

---

## Troubleshooting Guide

### Common Issues

**Issue**: Hot reload not working
- Clear `.vite` cache
- Restart dev server
- Check file watchers limit (Linux)

**Issue**: Supabase connection failing
- Verify `.env` credentials
- Check internet connection
- Try `VITE_USE_MOCK=true` to use mock data

**Issue**: TypeScript errors
- Run `npx tsc --noEmit` to see all errors
- Check `tsconfig.json` settings
- Rebuild with `npm run build`

**Issue**: Tailwind styles not applying
- Check `content` in `tailwind.config.ts`
- Restart dev server
- Clear browser cache

---

## Resources for Developers

### Official Documentation
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Shadcn/UI Docs](https://ui.shadcn.com)
- [React Query Docs](https://tanstack.com/query/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Useful Tools
- [React DevTools](https://react-devtools.io/)
- [Redux DevTools](https://chrome.google.com/webstore) (for React Query)
- [ESLint VSCode Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Thunder Client](https://www.thunderclient.io/) (API testing)

---

**Document Version**: 1.0.0
**Last Updated**: December 11, 2025
**Maintained By**: Development Team
**Contact**: [club@juit.ac.in](mailto:club@juit.ac.in)
