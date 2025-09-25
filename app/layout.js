/*
DESCRIPTION: This is the root layout file for the entire application.
- It wraps ALL pages with necessary providers and styling
- Think of it as the "shell" that every page uses
- This file runs on the server and provides the HTML structure

WHAT EACH PART DOES:
1. ClerkProvider - Wraps the app with Clerk authentication
2. Google Fonts - Loads beautiful fonts for the app
3. Global CSS - Applies Tailwind CSS and custom styles
4. HTML structure - Sets up the basic page structure

PSEUDOCODE:
- Import necessary providers and fonts
- Create a layout component that wraps children
- Apply global styles and fonts
- Return HTML structure with metadata
*/

import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

// Load Google Fonts - these fonts will be available throughout the app
const geistSans = Geist({
  variable: '--font-geist-sans',  // CSS variable name for the font
  subsets: ['latin'],             // Only load Latin characters (faster)
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',  // CSS variable name for the monospace font
  subsets: ['latin'],             // Only load Latin characters
})

// Metadata for the app - this shows up in browser tabs and search results
export const metadata = {
  title: 'Safety Dashboard',           // Browser tab title
  description: 'Safety management system for organizations', // Search result description
  manifest: '/manifest.json',          // Web app manifest for PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Safety Dashboard'
  }
}

// Viewport configuration - moved to separate export as required by Next.js 15
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5'
}

// Root layout component - this wraps EVERY page in the app
export default function RootLayout({ children }) {
  return (
    // html tag with language set to English
    <html lang="en">
      {/* body section - contains the actual app content */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ClerkProvider wraps the entire app to enable authentication */}
        <ClerkProvider>
          {/* children represents whatever page is being displayed */}
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
