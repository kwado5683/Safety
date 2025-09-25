# 🤖 Automated Tasks and Cron Jobs

## Overview
The Safety Dashboard includes a comprehensive set of automated tasks and cron jobs that run on scheduled intervals to maintain system health, generate reports, and ensure compliance.

## Scheduled Tasks

### 1. Daily Incident Summary Report
**Schedule**: Every day at 8:00 AM UTC
**Endpoint**: `/api/cron/daily-incident-summary`
**Purpose**: 
- Summarizes incident activity from the previous 24 hours
- Tracks new incidents, resolved incidents, and critical issues
- Provides actionable insights for daily safety oversight
- Sends reports to admin, owner, and manager roles

**Features**:
- Incident breakdown by type and severity
- Critical incident alerts
- Open corrective actions count
- Professional email reports with metrics

### 2. Weekly Compliance Report
**Schedule**: Every Monday at 9:00 AM UTC
**Endpoint**: `/api/cron/weekly-compliance-report`
**Purpose**:
- Comprehensive weekly safety compliance analysis
- Tracks trends across incidents, inspections, and training
- Provides management with strategic insights
- Identifies areas for improvement

**Features**:
- Overall compliance score calculation
- Incident, inspection, and training metrics
- Weekly trend analysis
- Actionable recommendations
- Management-focused reporting

### 3. Monthly Training Expiry Alert
**Schedule**: First day of every month at 10:00 AM UTC
**Endpoint**: `/api/cron/monthly-training-expiry`
**Purpose**:
- Identifies training certifications expiring in next 30 days
- Sends personalized alerts to individual users
- Provides management summary of expiring training
- Prevents compliance issues proactively

**Features**:
- User-specific training alerts
- Urgency-based categorization (urgent, high priority, reminder)
- Manager summary reports
- Action item recommendations

### 4. System Health Check
**Schedule**: Every Sunday at 7:00 AM UTC
**Endpoint**: `/api/cron/system-health-check`
**Purpose**:
- Monitors system health and performance
- Performs automated cleanup tasks
- Identifies potential issues before they impact users
- Maintains system optimization

**Features**:
- Database health monitoring
- Storage usage analysis
- Security status checks
- Performance metrics tracking
- Automated cleanup tasks
- Administrator health reports

### 5. Training Reminders (Enhanced)
**Schedule**: Every day at 9:00 AM UTC
**Endpoint**: `/api/training/reminders`
**Purpose**:
- Daily training expiry reminders (existing functionality)
- Enhanced with better categorization and urgency
- Integrated with the monthly training system

## Cron Schedule Reference

| Task | Schedule | Frequency | Time (UTC) |
|------|----------|-----------|------------|
| Daily Incident Summary | `0 8 * * *` | Daily | 8:00 AM |
| Weekly Compliance Report | `0 9 * * 1` | Weekly (Monday) | 9:00 AM |
| Monthly Training Expiry | `0 10 1 * *` | Monthly (1st) | 10:00 AM |
| System Health Check | `0 7 * * 0` | Weekly (Sunday) | 7:00 AM |
| Training Reminders | `0 9 * * *` | Daily | 9:00 AM |

## Environment Variables Required

### Core Configuration
```bash
# Cron job security
CRON_SECRET=your_secure_cron_secret_key

# Company information
COMPANY_NAME=Your Company Name

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Email service
RESEND_API_KEY=your_resend_api_key
```

### Database Configuration
```bash
# Supabase configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## Email Templates

### Daily Incident Summary
- **Recipients**: Admin, Owner, Manager roles
- **Content**: 24-hour incident activity summary
- **Features**: Metrics, trends, action items
- **Design**: Professional blue theme

### Weekly Compliance Report
- **Recipients**: Management team
- **Content**: Comprehensive compliance analysis
- **Features**: Compliance score, trends, recommendations
- **Design**: Professional green theme

### Training Expiry Alerts
- **Recipients**: Individual users + managers
- **Content**: Personalized training reminders
- **Features**: Urgency-based styling, action steps
- **Design**: Dynamic color coding by urgency

### System Health Report
- **Recipients**: System administrators
- **Content**: System performance and health metrics
- **Features**: Health scores, cleanup results, recommendations
- **Design**: Dynamic color coding by health status

## Security Features

### Authentication
- All cron jobs require `CRON_SECRET` authentication
- Bearer token validation on all endpoints
- Secure environment variable management

### Error Handling
- Graceful degradation if email services fail
- Comprehensive error logging
- Non-blocking execution (cron failures don't break core functionality)

### Data Protection
- No sensitive data in email subjects
- Secure link generation
- Role-based recipient filtering

## Monitoring and Logging

### Execution Tracking
- All cron jobs log execution start/end times
- Success/failure status tracking
- Email delivery confirmation
- Performance metrics collection

### Error Monitoring
- Comprehensive error logging
- Email failure tracking
- Database connection monitoring
- Performance bottleneck identification

## Deployment Configuration

### Vercel Deployment
The `vercel.json` file configures all cron jobs for Vercel deployment:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-incident-summary",
      "schedule": "0 8 * * *"
    },
    // ... other cron jobs
  ]
}
```

### Local Development
For local testing, you can trigger cron jobs manually:

```bash
# Test daily incident summary
curl -X POST http://localhost:3000/api/cron/daily-incident-summary \
  -H "Authorization: Bearer your_cron_secret"

# Test weekly compliance report
curl -X POST http://localhost:3000/api/cron/weekly-compliance-report \
  -H "Authorization: Bearer your_cron_secret"
```

## Customization Options

### Schedule Modifications
Modify the `vercel.json` file to change cron schedules:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-incident-summary",
      "schedule": "0 6 * * *"  // Changed to 6:00 AM
    }
  ]
}
```

### Email Recipients
Modify role-based recipient filtering in each cron job:

```javascript
// Example: Add supervisor role to daily reports
.in('role', ['admin', 'owner', 'manager', 'supervisor'])
```

### Report Content
Customize report content by modifying email template functions in each cron job file.

## Troubleshooting

### Common Issues

1. **Cron Jobs Not Running**
   - Check Vercel deployment status
   - Verify `vercel.json` configuration
   - Check environment variables

2. **Email Delivery Failures**
   - Verify `RESEND_API_KEY` is correct
   - Check email recipient addresses
   - Review Resend dashboard for delivery status

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check database connection limits
   - Review Supabase dashboard

4. **Authentication Failures**
   - Verify `CRON_SECRET` matches across all jobs
   - Check authorization headers in requests
   - Review server logs for authentication errors

### Debug Mode
Enable detailed logging by setting:

```bash
NODE_ENV=development
```

### Manual Testing
Test individual cron jobs using curl commands with proper authentication headers.

## Performance Considerations

### Optimization
- Efficient database queries with proper indexing
- Minimal data processing in cron jobs
- Async email sending to prevent timeouts
- Proper error handling to prevent failures

### Monitoring
- Track execution times
- Monitor email delivery rates
- Watch database query performance
- Alert on repeated failures

---

**Status**: ✅ **COMPLETED** - Comprehensive automated task system implemented
**Last Updated**: December 2024
**Next Phase**: Advanced analytics and custom reporting
