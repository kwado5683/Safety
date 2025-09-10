/*
DESCRIPTION: This is the Next.js configuration file.
- Configures how Next.js builds and runs your application
- Sets up experimental features and optimizations
- Configures image optimization and other settings

WHAT EACH PART DOES:
1. experimental - Enables new Next.js features that are still being developed
2. images - Configures how images are optimized and served
3. webpack - Custom webpack configuration if needed
4. env - Environment variables that should be available at build time

PSEUDOCODE:
- Create configuration object
- Enable experimental features
- Configure image optimization
- Export configuration for Next.js to use
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable server actions (for forms and data mutations)
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002', 'localhost:3003'],
    },
  },
  
  // Configure image optimization
  images: {
    // Allow images from external domains (like Clerk avatars)
    domains: ['images.clerk.dev'],
    
    // Enable modern image formats for better performance
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables that should be available at build time
  env: {
    // Add any environment variables you need here
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Optional: Custom webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // You can add custom webpack rules here if needed
    return config
  },
}

// Export the configuration
export default nextConfig
