# Organization Setup for Documents

## ⚠️ Important: Organization ID Required

The documents system requires a valid **Organization ID** from Clerk to function properly. Here's what you need to know:

### 🔧 Current Issue:
The API routes now require a valid `orgId` from Clerk's authentication. If no organization ID is available, the system will return an error.

### 📋 Setup Options:

#### **Option 1: Use Clerk Organizations (Recommended)**
1. **Enable Organizations in Clerk Dashboard:**
   - Go to your Clerk Dashboard
   - Navigate to **Organizations** → **Settings**
   - Enable organizations for your application
   - Configure organization settings as needed

2. **Create an Organization:**
   - In your Clerk Dashboard, create an organization
   - Note the Organization ID (UUID format)
   - This will be used for document scoping

#### **Option 2: Use Personal Organization (Quick Fix)**
If you want to test without setting up organizations, you can modify the API routes to use a default organization ID:

1. **Create a Default Organization in Supabase:**
   ```sql
   INSERT INTO organizations (id, name, created_at) 
   VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', now());
   ```

2. **Update API Routes to Use Default:**
   Replace the organization ID checks in the API routes with a fallback to the default organization ID.

#### **Option 3: Modify for Single User (Simplest)**
If you don't need multi-tenant functionality, you can modify the system to work without organizations:

1. **Remove org_id from queries**
2. **Use user_id for document scoping instead**
3. **Update the database schema to make org_id optional**

### 🎯 Recommended Approach:

For a production safety management system, **Option 1 (Clerk Organizations)** is recommended because:
- ✅ Proper multi-tenant support
- ✅ User management within organizations
- ✅ Role-based access control
- ✅ Scalable architecture

### 🚀 Quick Test Setup:

If you want to test the documents functionality immediately:

1. **Enable Organizations in Clerk Dashboard**
2. **Create a test organization**
3. **Sign up/sign in users to that organization**
4. **Test document upload and management**

### 📝 Current API Behavior:

- **List Documents**: Returns error if no `orgId` available
- **Upload Documents**: Returns error if no `orgId` available  
- **Delete Documents**: Returns error if no `orgId` available

This ensures data isolation and proper multi-tenant functionality.

### 🔄 Next Steps:

1. **Choose your preferred setup option**
2. **Configure Clerk organizations (if using Option 1)**
3. **Test the documents functionality**
4. **Verify organization-based document scoping**

The documents system is fully functional once you have a valid organization ID from Clerk!
