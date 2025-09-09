# 🚀 Safety Dashboard - Next.js App Router

A modern safety management system built with **Next.js 13+ App Router**, **Clerk Authentication**, and **Tailwind CSS**.

## 🏗️ **Project Structure (App Router)**

```
safety/
├── app/                          # 🆕 App Router pages (NEW!)
│   ├── layout.js                # Root layout (wraps all pages)
│   ├── page.js                  # Dashboard home page (/)
│   ├── globals.css              # Global styles with Tailwind
│   ├── sign-in/                 # Sign-in page (/sign-in)
│   │   └── page.js
│   ├── sign-up/                 # Sign-up page (/sign-up)
│   │   └── page.js
│   ├── incidents/               # Incidents page (/incidents)
│   │   └── page.js
│   └── api/                     # API routes
│       ├── dashboard/
│       │   └── summary/
│       │       └── route.js     # /api/dashboard/summary
│       └── incidents/
│           └── list/
│               └── route.js     # /api/incidents/list
├── components/                   # Reusable React components
│   ├── DashboardLayout.js       # Main layout with navigation
│   ├── KPI.js                   # Key Performance Indicator cards
│   └── Chart.js                 # Chart components
├── lib/                         # Utility functions and configurations
├── middleware.js                # Authentication middleware
├── next.config.mjs             # Next.js configuration
└── jsconfig.json               # Path aliases and TypeScript-like features
```

## 🔑 **Key Differences from Pages Router**

| Feature | Pages Router (Old) | App Router (New) |
|---------|-------------------|------------------|
| **File Structure** | `pages/index.js` | `app/page.js` |
| **Layouts** | `_app.js` + `_document.js` | `app/layout.js` |
| **API Routes** | `pages/api/` | `app/api/` |
| **Routing** | File-based | Folder-based |
| **Server Components** | ❌ No | ✅ Yes (default) |
| **Client Components** | ✅ Yes | ✅ Yes (`'use client'`) |

## 🚀 **Getting Started**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Set Up Environment Variables**
Create `.env.local` file:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Supabase (if using database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. **Run Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎯 **How App Router Works**

### **Page Structure**
- **`app/page.js`** → `/` (home page)
- **`app/sign-in/page.js`** → `/sign-in`
- **`app/incidents/page.js`** → `/incidents`
- **`app/api/dashboard/summary/route.js`** → `/api/dashboard/summary`

### **Layout System**
- **`app/layout.js`** wraps ALL pages
- Each folder can have its own `layout.js`
- Components are **Server Components** by default
- Use `'use client'` for interactive components

### **API Routes**
- **`route.js`** files handle HTTP methods
- Export `GET`, `POST`, `PUT`, `DELETE` functions
- Use `NextResponse` for responses
- Protected by Clerk authentication

## 🔐 **Authentication with Clerk**

### **Protected Routes**
```javascript
// In API routes
import { auth } from '@clerk/nextjs'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of your code
}
```

### **Protected Components**
```javascript
// In React components
'use client'
import { useUser } from '@clerk/nextjs'

export default function MyComponent() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Welcome {user.firstName}!</div>
}
```

## 🎨 **Styling with Tailwind CSS**

### **Global Styles**
- **`app/globals.css`** imports Tailwind
- Custom CSS variables for theming
- Glassmorphism effects
- Responsive design utilities

### **Component Styling**
```javascript
// Example of our styling approach
<div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-lg">
  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
    Safety Dashboard
  </h1>
</div>
```

## 📱 **Responsive Design**

- **Mobile-first** approach
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:`
- **Sidebar**: Hidden on mobile, visible on desktop
- **Grid layouts**: Adapt to screen size

## 🔧 **Development Tips**

### **Adding New Pages**
1. Create folder: `app/new-page/`
2. Add `page.js` inside it
3. Route automatically available at `/new-page`

### **Adding New API Routes**
1. Create folder: `app/api/new-endpoint/`
2. Add `route.js` inside it
3. Export HTTP methods: `GET`, `POST`, etc.

### **Client vs Server Components**
- **Server Components** (default): Better performance, no JavaScript bundle
- **Client Components** (`'use client'`): Interactive, use hooks, event handlers

## 🚨 **Common Issues & Solutions**

### **"use client" Error**
```javascript
// ❌ Wrong - using hooks in Server Component
export default function MyComponent() {
  const [state, setState] = useState() // Error!
}

// ✅ Correct - mark as Client Component
'use client'
export default function MyComponent() {
  const [state, setState] = useState() // Works!
}
```

### **Import Path Issues**
```javascript
// ✅ Use absolute imports with @/ alias
import DashboardLayout from '@/components/DashboardLayout'
import { auth } from '@/lib/auth'

// ❌ Avoid relative imports
import DashboardLayout from '../../../components/DashboardLayout'
```

### **API Route Not Working**
- Ensure file is named `route.js` (not `api.js`)
- Export HTTP methods: `GET`, `POST`, etc.
- Check middleware configuration

## 📚 **Learning Resources**

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Server Components](https://react.dev/learn/server-components)

## 🤝 **Contributing**

1. Follow the App Router structure
2. Use `'use client'` only when necessary
3. Add clear comments explaining code
4. Test on both mobile and desktop
5. Ensure responsive design

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

---

**Happy coding! 🎉**

If you have questions about the App Router structure or need help with specific features, check the comments in the code files - they explain what each part does!
