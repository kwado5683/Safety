/*
Description: Environment variable checker for development.
- Logs missing environment variables to help with setup.
- Returns boolean indicating if all required vars are present.

Pseudocode:
- Define required environment variables
- Check each one and log if missing
- Return true if all present, false otherwise
*/
export function checkEnvironment() {
  const required = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const optional = [
    'RESEND_API_KEY',
    'CRON_SECRET'
  ]

  const missing = []
  const present = []

  required.forEach(key => {
    if (process.env[key]) {
      present.push(key)
    } else {
      missing.push(key)
    }
  })

  optional.forEach(key => {
    if (process.env[key]) {
      present.push(key)
    }
  })

  if (missing.length > 0) {
    console.warn('⚠️  Missing required environment variables:')
    missing.forEach(key => console.warn(`   - ${key}`))
    console.warn('Please add these to your .env.local file')
  }

  if (present.length > 0) {
    console.log('✅ Environment variables found:')
    present.forEach(key => console.log(`   - ${key}`))
  }

  return missing.length === 0
}
