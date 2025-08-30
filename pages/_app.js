/*
Description: Root app component for Pages Router with Clerk integration.
- Wraps all pages with ClerkProvider.
- Includes global styles and fonts.

Pseudocode:
- Import ClerkProvider and fonts
- Wrap app with ClerkProvider
- Include global styles
*/
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import '../styles/globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  )
}
