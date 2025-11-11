// Webhook endpoint to receive ChatKit survey completion notifications
// and send email notification

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, session_id, workflow_id, user, completed_at } = req.body;

    // Check if this is a survey completion event
    if (event !== 'session.completed') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    // Send email notification using a service like SendGrid, Mailgun, or Resend
    // For this example, we'll use Resend (you'll need to install: npm install resend)
    const emailResult = await sendCompletionEmail({
      session_id,
      workflow_id,
      user,
      completed_at
    });

    console.log('Survey completion notification sent:', emailResult);

    return res.status(200).json({ 
      success: true,
      message: 'Email notification sent',
      email_id: emailResult.id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      error: 'Failed to process webhook',
      message: error.message 
    });
  }
}

// Helper function to send email
async function sendCompletionEmail(data) {
  // Using Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'ChatKit Survey <ops@ndchvision.com>',
      to: ['nkrumah@ndchvision.com'],
      subject: 'New ChatKit Survey Completion',
      html: `
        <h2>Survey Completed!</h2>
        <p>A client has completed the ChatKit survey.</p>
        <ul>
          <li><strong>Session ID:</strong> ${data.session_id}</li>
          <li><strong>Workflow ID:</strong> ${data.workflow_id}</li>
          <li><strong>User:</strong> ${data.user}</li>
          <li><strong>Completed At:</strong> ${data.completed_at || 'Just now'}</li>
        </ul>
        <p>Check your ChatKit dashboard for full survey responses.</p>
      `
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email service error: ${error}`);
  }

  return await response.json();
}
