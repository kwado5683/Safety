/*
Description: Catch-all sign-in page using Clerk's SignIn component.
- Uses the recommended catch-all route pattern [[...index]].js
- Provides authentication UI for users to sign in.
- Redirects to dashboard after successful authentication.

Pseudocode:
- Import SignIn from Clerk
- Render SignIn component with redirect to dashboard
- Handle authentication flow with catch-all routing
*/
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  )
}
