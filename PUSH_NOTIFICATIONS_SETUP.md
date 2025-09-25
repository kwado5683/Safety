# Push Notifications Setup Guide

This guide will help you set up and test push notifications for your Safety Dashboard application.

## ✅ What's Already Done

- ✅ VAPID keys generated and added to `.env.local`
- ✅ Service worker created (`public/sw.js`)
- ✅ Web app manifest created (`public/manifest.json`)
- ✅ Notification utilities implemented (`lib/notifications.js`)
- ✅ Push service implemented (`lib/pushService.js`)
- ✅ React hooks created (`lib/hooks/useNotifications.js`)
- ✅ Settings component created (`components/notifications/NotificationSettings.js`)
- ✅ API routes created for subscription management
- ✅ Test page created (`/test-notifications`)

## 🚀 Next Steps

### 1. Apply Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Create notification_subscriptions table
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT,
    auth_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one subscription per user
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user_id ON notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_endpoint ON notification_subscriptions(endpoint);

-- Add RLS policies
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own subscriptions
CREATE POLICY "Users can manage their own notification subscriptions" ON notification_subscriptions
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Policy: Service role can manage all subscriptions (for sending notifications)
CREATE POLICY "Service role can manage all notification subscriptions" ON notification_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_subscriptions_updated_at 
    BEFORE UPDATE ON notification_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Test the Setup

1. **Visit the test page**: Go to `http://localhost:3000/test-notifications`
2. **Check browser support**: The page will show if your browser supports notifications
3. **Request permission**: Click "Request Permission" to enable notifications
4. **Subscribe**: Click "Subscribe to Push" to enable push notifications
5. **Test notifications**: Use the various test buttons to send different types of notifications

### 3. Access Notification Settings

1. **Sign in** to your application
2. **Go to Settings**: Navigate to `/settings/notifications`
3. **Configure preferences**: Enable/disable different notification types
4. **Test functionality**: Use the test notification button

## 🔧 Environment Variables

Your `.env.local` file should now include:

```bash
# Push Notification VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BMFAWh-vDLG_InL1SdNILrlURhTyS6-e8hK7-oNkcCEKBQhMOzvoDTt_ULoDERkJkrEP3FnREA_7JXr9_wVJMzQ
VAPID_PRIVATE_KEY=_YsGoA_CcJ52uTVp1-_liJD1LFVwDYbdHC_MKHywiK0
```

## 📱 Mobile Testing

For mobile testing:

1. **Use HTTPS**: Push notifications require HTTPS (except for localhost)
2. **Test on device**: Use your phone's browser to test the functionality
3. **Check permissions**: Ensure notification permissions are granted
4. **Test offline**: The service worker provides offline functionality

## 🚨 Troubleshooting

### Common Issues:

1. **"Notifications not supported"**
   - Use a modern browser (Chrome, Firefox, Safari, Edge)
   - Ensure you're using HTTPS (except for localhost)

2. **"Permission denied"**
   - Check browser notification settings
   - Clear browser data and try again
   - Use incognito mode to test

3. **"Failed to subscribe"**
   - Check if VAPID keys are correctly set in environment variables
   - Verify the database migration was applied
   - Check browser console for errors

4. **"Service worker not registered"**
   - Ensure `public/sw.js` exists
   - Check browser console for service worker errors
   - Clear browser cache and reload

### Debug Steps:

1. **Check browser console** for any JavaScript errors
2. **Verify environment variables** are loaded correctly
3. **Test on different browsers** to isolate issues
4. **Check network tab** for failed API requests
5. **Use the test page** (`/test-notifications`) for debugging

## 🎯 Integration Points

The push notification system integrates with:

- **Incident Reports**: Automatic notifications for new incidents
- **Corrective Actions**: Notifications when actions are assigned
- **Inspections**: Alerts for failed inspections with critical issues
- **Training**: Reminders for expiring certifications
- **System Alerts**: General system notifications

## 📊 Monitoring

To monitor notification delivery:

1. **Check database**: Query `notification_subscriptions` table
2. **Monitor logs**: Check server logs for notification sending
3. **User feedback**: Ask users about notification delivery
4. **Analytics**: Track notification open rates and engagement

## 🔐 Security Notes

- VAPID keys are used for secure push notification delivery
- User subscriptions are tied to authenticated user accounts
- Row Level Security (RLS) protects user data
- Private keys should never be exposed to the client

## 📚 Additional Resources

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID](https://tools.ietf.org/html/rfc8292)

---

**Ready to test?** Visit `http://localhost:3000/test-notifications` to get started! 🚀
