# ChatKit Survey API

This directory contains API endpoints for managing ChatKit survey sessions and receiving completion notifications.

## Files

### `chatkit.js`
Creates new ChatKit survey sessions for clients.
- **Endpoint**: `/api/chatkit`
- **Method**: POST
- **Purpose**: Initializes a new ChatKit session with the configured workflow

### `survey-webhook.js`
Receives webhook notifications when surveys are completed and sends email alerts.
- **Endpoint**: `/api/survey-webhook`
- **Method**: POST
- **Purpose**: Processes survey completion events and sends email notifications

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file or hosting platform:

```env
# OpenAI ChatKit Configuration
OPENAI_API_KEY=your_openai_api_key_here
WORKFLOW_ID=your_workflow_id_here

# Email Service Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
```

### 2. Get a Resend API Key

1. Sign up for a free account at [resend.com](https://resend.com)
2. Verify your domain or use their test domain for development
3. Create an API key from the dashboard
4. Add it to your environment variables as `RESEND_API_KEY`

### 3. Configure ChatKit Webhook

1. Go to your ChatKit workflow settings in the OpenAI dashboard
2. Navigate to the "Webhooks" or "Events" section
3. Add a new webhook endpoint:
   - **URL**: `https://your-domain.com/api/survey-webhook`
   - **Events**: Select `session.completed`
4. Save the webhook configuration

### 4. Email Configuration

The webhook is currently configured to send emails to:
- **Recipient**: nkrumah@ndchvision.com
- **From**: ChatKit Survey <notifications@ndchvision.com>

To change the recipient email, edit line 64 in `survey-webhook.js`:
```javascript
to: ['your-email@example.com'],
```

## How It Works

1. **Client starts survey**: Your application calls `/api/chatkit` to create a session
2. **Client completes survey**: ChatKit sends a webhook to `/api/survey-webhook`
3. **Email notification**: The webhook handler sends an email to nkrumah@ndchvision.com
4. **Email includes**:
   - Session ID
   - Workflow ID
   - User identifier
   - Completion timestamp

## Email Notification Example

When a survey is completed, you'll receive an email like this:

```
Subject: New ChatKit Survey Completion

Survey Completed!

A client has completed the ChatKit survey.

• Session ID: sess_abc123...
• Workflow ID: wf_xyz789...
• User: user@example.com
• Completed At: 2025-11-10T20:45:00Z

Check your ChatKit dashboard for full survey responses.
```

## Testing

### Test the ChatKit Endpoint
```bash
curl -X POST https://your-domain.com/api/chatkit \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-user-123"}'
```

### Test the Webhook (Manual)
```bash
curl -X POST https://your-domain.com/api/survey-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "session.completed",
    "session_id": "sess_test123",
    "workflow_id": "wf_test456",
    "user": "test@example.com",
    "completed_at": "2025-11-10T20:00:00Z"
  }'
```

## Troubleshooting

### Not receiving emails?
1. Check that `RESEND_API_KEY` is set correctly
2. Verify your domain is verified in Resend (for production)
3. Check the API logs for error messages
4. Ensure the webhook is configured in ChatKit dashboard

### Webhook not firing?
1. Verify the webhook URL in ChatKit settings
2. Ensure the endpoint is publicly accessible
3. Check that `session.completed` event is selected
4. Look for webhook delivery logs in ChatKit dashboard

## Alternative Email Services

You can easily swap Resend for another email service:

### SendGrid
```javascript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({...})
});
```

### Mailgun
```javascript
const response = await fetch('https://api.mailgun.net/v3/YOUR_DOMAIN/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
  },
  body: formData
});
```

## Security Notes

- Never commit your API keys to version control
- Use environment variables for all sensitive data
- Consider adding webhook signature verification in production
- Rate limit the webhook endpoint to prevent abuse

## Support

For issues or questions, contact: nkrumah@ndchvision.com
