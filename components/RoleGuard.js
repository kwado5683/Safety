/*
Description: Role-based access control component wrapper.
- Shows content only if user has required role.
- Provides fallback content for unauthorized users.

Pseudocode:
- Check if user has required role
- If yes → render children
- If no → render fallback or nothing
*/
import { useAuth } from '../lib/hooks/useAuth'

export default function RoleGuard({ 
  children, 
  requiredRole, 
  requiredRoles = [], 
  fallback = null,
  loadingFallback = null 
}) {
  const { user, loading, hasRole, hasAnyRole } = useAuth()

  if (loading) {
    return loadingFallback || <div>Loading...</div>
  }

  if (!user) {
    return fallback || <div>Please log in to access this content.</div>
  }

  // Check single role
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <div>Access denied. Required role: {requiredRole}</div>
  }

  // Check multiple roles
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return fallback || <div>Access denied. Required roles: {requiredRoles.join(', ')}</div>
  }

  return children
}
