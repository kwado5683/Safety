/*
Description: Catch-all sign-up page using Clerk's SignUp component.
- Uses the recommended catch-all route pattern [[...index]].js
- Provides authentication UI for users to create accounts.
- Redirects to dashboard after successful registration.

Pseudocode:
- Import SignUp from Clerk
- Render SignUp component with redirect to dashboard
- Handle registration flow with catch-all routing
*/
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignUp 
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
