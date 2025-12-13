# JUIT Robotics Hub

<div align="center">
  <h3>A Modern Web Application for Robotics Club Operations & Project Management</h3>
  <p>
    <strong>Built with React 18 • TypeScript • Vite • Tailwind CSS • Supabase</strong>
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#project-structure">Structure</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 📋 Project Overview

JUIT Robotics Hub is a comprehensive web platform designed to manage and showcase the operations of a robotics club. The application provides:

- **Public-facing website** showcasing club projects, facilities, and team members
- **Admin dashboard** for managing projects, faculty, equipment, and notifications
- **Real-time data synchronization** with Supabase backend
- **Responsive design** optimized for desktop and mobile devices
- **Modern UI/UX** using shadcn/ui components and Tailwind CSS
- **Type-safe** development with TypeScript
- **High-performance** rendering with React 18 and Vite

### Target Users
- 🏫 **Students**: Discover robotics projects and club information
- 👨‍🏫 **Faculty**: Manage club operations and oversee projects
- 👨‍💼 **Administrators**: Control content, projects, and system settings
- 🌐 **Public**: Browse projects and learn about the club

---

## ✨ Features

### Public Features
- ✅ **Home Page**: Hero section with call-to-action and key highlights
- ✅ **Projects Showcase**: Browse and explore all robotics projects
- ✅ **Faculty Directory**: View team members and faculty advisors
- ✅ **Equipment Gallery**: Showcase lab equipment and facilities
- ✅ **Facilities Tour**: Parallax scrolling introduction to lab facilities
- ✅ **About Section**: Mission, vision, and club information
- ✅ **Responsive Navigation**: Mobile-friendly menu with smooth scrolling
- ✅ **Dark/Light Mode**: Theme switching support
- ✅ **Image Gallery**: Lightbox gallery for project and facility images

### Admin Features
- 🔐 **Authentication System**: Secure admin login and authorization
- 📊 **Admin Dashboard**: Centralized control panel with statistics
- ➕ **Project Management**: Create, edit, and delete projects
- 👥 **Faculty Management**: Manage faculty member profiles
- 🏭 **Equipment Management**: Track equipment inventory
- 🔔 **Notifications System**: Real-time admin notifications
- 📈 **Analytics**: View project statistics and engagement metrics
- 📝 **Admin Logs**: Audit trail for all admin actions
- 🔄 **Batch Operations**: Manage multiple items efficiently

### Technical Features
- ✅ **Type-Safe Development**: Full TypeScript support
- ✅ **Real-time Sync**: Supabase integration for live data updates
- ✅ **Form Validation**: Zod schema validation with react-hook-form
- ✅ **State Management**: React Query for server state caching
- ✅ **API Integration**: Axios for HTTP requests with interceptors
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Component Library**: 26+ Radix UI components via shadcn/ui
- ✅ **Animation**: Smooth animations with Framer Motion
- ✅ **Toast Notifications**: Non-intrusive notifications with Sonner
- ✅ **Code Quality**: ESLint configuration with TypeScript support

---

## 🚀 Quick Start

### Prerequisites
```bash
# Minimum requirements
Node.js >= v18.0.0
npm >= v9.0.0
# OR
Bun >= v1.0.0 (recommended for faster installation)
```

### Installation (3 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdityaaSingh74/juit-robotics-hub.git
   cd juit-robotics-hub
   git checkout feature/website-improvements
   ```

2. **Install dependencies**
   ```bash
   npm install
   # OR using Bun (faster)
   bun install
   ```

3. **Configure environment**
   ```bash
   # .env file is already populated with defaults
   # Update with your Supabase credentials if different
   cat .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   # OR
   bun run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Accessing Admin Panel
- Navigate to: `http://localhost:5173/admin`
- Default login: Admin credentials configured in Supabase
- Dashboard: `http://localhost:5173/admin/dashboard`

---

## 🛠️ Tech Stack

### Frontend Framework
| Technology | Version | Purpose |
|-----------|---------|----------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 5.4.19 | Build tool & dev server |
| **React Router** | 6.30.1 | Client-side routing |

### UI & Styling
| Technology | Version | Purpose |
|-----------|---------|----------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Shadcn/UI** | Latest | Component library (26+ components) |
| **Radix UI** | 1.x | Headless UI primitives |
| **Framer Motion** | 12.23.24 | Animation library |

### State & Data Management
| Technology | Version | Purpose |
|-----------|---------|----------|
| **React Query** | 5.83.0 | Server state management |
| **Zod** | 3.25.76 | Schema validation |
| **React Hook Form** | 7.66.1 | Form state management |

### Backend & APIs
| Technology | Version | Purpose |
|-----------|---------|----------|
| **Supabase** | 2.84.0 | Backend as a Service (PostgreSQL + Auth) |
| **Axios** | 1.13.2 | HTTP client |

### UI Components & Features
| Technology | Version | Purpose |
|-----------|---------|----------|
| **Lucide React** | 0.462.0 | Icon library (~500 icons) |
| **Sonner** | 1.7.4 | Toast notifications |
| **Embla Carousel** | 8.6.0 | Image carousels |
| **Yet Another Lightbox** | 3.25.0 | Image gallery lightbox |
| **Recharts** | 2.15.4 | Data visualization charts |

### Code Quality & Dev Tools
| Technology | Version | Purpose |
|-----------|---------|----------|
| **ESLint** | 9.32.0 | Code linting & quality |
| **TypeScript ESLint** | 8.38.0 | TypeScript linting |
| **Lovable Tagger** | 1.1.11 | Component documentation |

---

## 📁 Project Structure

```
juit-robotics-hub/
├── src/
│   ├── components/               # Reusable React components
│   │   ├── admin/                # Admin-specific components
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── ProjectManager.tsx
│   │   │   ├── FacultyManager.tsx
│   │   │   └── EquipmentManager.tsx
│   │   ├── ui/                   # Shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (26+ components)
│   │   ├── About.tsx              # About section component
│   │   ├── EquipmentShowcase.tsx  # Equipment showcase
│   │   ├── FacilitiesParallax.tsx # Parallax facilities tour
│   │   ├── Faculty.tsx            # Faculty directory
│   │   ├── Footer.tsx             # Footer component
│   │   ├── Hero.tsx               # Hero section
│   │   ├── LabGallery.tsx         # Gallery component
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── ProjectForm.tsx        # Project form component
│   │   └── NotificationBell.tsx   # Notification indicator
│   ├── pages/                  # Route components
│   │   ├── Index.tsx              # Home page
│   │   ├── Admin.tsx              # Admin login page
│   │   ├── AdminDashboard.tsx     # Admin dashboard
│   │   └── NotFound.tsx           # 404 page
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuth.ts             # Authentication hook
│   ├── lib/                    # Utility functions & services
│   │   ├── emailService.ts        # Email integration
│   │   ├── mockDatabase.ts        # Mock data for testing
│   │   ├── mockSupabaseClient.ts  # Mock Supabase client
│   │   └── utils.ts               # Helper utilities
│   ├── integrations/           # External service integrations
│   │   └── supabase/              # Supabase client configuration
│   ├── assets/                 # Static files
│   │   ├── images/                # Project and facility images
│   │   └── logos/                 # Club and sponsor logos
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # Vite type definitions
├─┠ public/                    # Static assets (copied as-is)
├─┠ supabase/                  # Supabase configuration
│   ├─┠ config.toml             # Supabase project config
│   ├─┠ seed.sql                # Database seed data
│   └─┠ migrations/             # Database migrations
├─┠ docs/                      # Documentation files
├─┠ .env                      # Environment variables (gitignored)
├─┠ package.json              # Dependencies & npm scripts
├─┠ tsconfig.json             # TypeScript configuration
├─┠ vite.config.ts            # Vite build configuration
├─┠ tailwind.config.ts        # Tailwind CSS configuration
├─┠ postcss.config.js         # PostCSS configuration
├─┠ components.json           # Shadcn/ui configuration
├─┠ eslint.config.js          # ESLint configuration
├─┠ requirements.txt          # Dependency documentation
├─┠ AI_CONTEXT.md             # AI/ML context documentation
└─┠ README.md                 # This file
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Build with dev mode (source maps, no minification)
npm run build:dev

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**
   ```bash
   npm run dev
   npm run lint
   ```

3. **Build and verify**
   ```bash
   npm run build
   npm run preview
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request** on GitHub

---

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

```sql
-- Projects table
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  image_url VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Faculty members table
CREATE TABLE faculty_members (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR,
  role VARCHAR,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Equipment inventory
CREATE TABLE equipment (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  quantity INTEGER,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication & Security

### Authentication Flow
1. Admin users authenticate via Supabase Auth
2. JWT tokens stored in browser (secure cookie recommended)
3. Protected routes check authentication state
4. Automatic token refresh via React Query

### Security Features
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced in production
- ✅ CORS configured for Supabase
- ✅ SQL injection prevention via Supabase ORM
- ✅ XSS protection with React's default escaping
- ✅ CSRF protection via token validation

### Best Practices
- Never commit `.env` files
- Use `.env.example` as template
- Rotate tokens regularly
- Implement rate limiting on sensitive endpoints
- Enable Row Level Security (RLS) in Supabase

---

## 🚀 Deployment

### Build Optimization
```bash
# Create production build
npm run build

# Output directory: dist/
# Size analysis available in build output
```

### Deployment Platforms

#### **Vercel** (Recommended)
```bash
# Push to main branch
git push origin main
# Automatically deploys via GitHub integration
```

#### **Netlify**
```bash
# Build command: npm run build
# Publish directory: dist/
# Environment variables in Netlify UI
```

#### **GitHub Pages**
```bash
# Add base to vite.config.ts
# base: '/juit-robotics-hub/'
# Push to gh-pages branch
```

#### **Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Variables for Production
```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_USE_MOCK=false
VITE_APP_ENV=production
```

---

## 📸 Screenshots & Demo

### Public Pages
- **Home Page**: Hero section with navigation to all features
- **Projects**: Showcase of all robotics projects with details
- **Faculty**: Team member directory with photos
- **Equipment**: Lab equipment showcase
- **Facilities**: Parallax scrolling tour of facilities

### Admin Pages
- **Admin Login**: Secure authentication page
- **Dashboard**: Overview of projects, faculty, and stats
- **Project Manager**: Create, edit, delete projects
- **Notifications**: Real-time notification center

### Demo Link
**Coming Soon** - Live demo will be available at: [https://juit-robotics-hub.vercel.app](https://juit-robotics-hub.vercel.app)

---

## 📝 Deployment Instructions

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] ESLint passing (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Supabase project set up
- [ ] Database migrations applied
- [ ] Images and assets optimized

### Deployment Steps

1. **Prepare for deployment**
   ```bash
   npm run build
   npm run preview
   ```

2. **Push to main branch**
   ```bash
   git checkout main
   git merge feature/website-improvements
   git push origin main
   ```

3. **Monitor deployment**
   - Check deployment logs on chosen platform
   - Verify environment variables are set
   - Test critical features

4. **Post-deployment**
   - Verify SSL certificate
   - Test API endpoints
   - Check database connectivity
   - Monitor error logs

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Code Standards
- Use TypeScript for all `.ts`/`.tsx` files
- Follow ESLint rules (run `npm run lint --fix`)
- Use meaningful variable/function names
- Add comments for complex logic
- Keep components under 200 lines when possible

### Git Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request with detailed description

### PR Requirements
- Descriptive title and description
- Related issue numbers (if applicable)
- Screenshots for UI changes
- Updated documentation
- No merge conflicts

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Lead**: Aditya Singh ([@AdityaaSingh74](https://github.com/AdityaaSingh74))

**Contributors**:
- Faculty Advisor: JUIT Robotics Club
- Development Team: JUIT Students

---

## 📞 Support & Contact

### Get Help
- 📧 Email: [club@juit.ac.in](mailto:club@juit.ac.in)
- 🐛 Issues: [GitHub Issues](https://github.com/AdityaaSingh74/juit-robotics-hub/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/AdityaaSingh74/juit-robotics-hub/discussions)

### Resources
- [Documentation](./docs)
- [Setup Guide](./SETUP_GUIDE.md)
- [Admin Dashboard Guide](./ADMIN_DASHBOARD_QUICKSTART.md)
- [AI Context for Developers](./AI_CONTEXT.md)
- [Security Audit Summary](./SECURITY_AUDIT_SUMMARY.md)
- [Changes Summary](./CHANGES_SUMMARY.md)

---

## ⭐ Acknowledgments

- React & Vite communities for excellent frameworks
- Shadcn/ui for component library
- Supabase for backend infrastructure
- All contributors and supporters

---

<div align="center">
  <p>Made with ❤️ by JUIT Robotics Club</p>
  <p>
    <a href="https://github.com/AdityaaSingh74/juit-robotics-hub/stargazers">
      <img src="https://img.shields.io/github/stars/AdityaaSingh74/juit-robotics-hub" alt="Stars" />
    </a>
    <a href="https://github.com/AdityaaSingh74/juit-robotics-hub/network/members">
      <img src="https://img.shields.io/github/forks/AdityaaSingh74/juit-robotics-hub" alt="Forks" />
    </a>
    <a href="https://github.com/AdityaaSingh74/juit-robotics-hub/issues">
      <img src="https://img.shields.io/github/issues/AdityaaSingh74/juit-robotics-hub" alt="Issues" />
    </a>
  </p>
</div>
