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
    // Call OpenAI ChatKit Sessions API directly
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        workflow: {
          id: process.env.WORKFLOW_ID
        },
        user: req.body.deviceId || 'anonymous'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ChatKit API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to create ChatKit session',
        details: errorData
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      client_secret: data.client_secret,
      session_id: data.id
    });
  } catch (error) {
    console.error('Error creating ChatKit session:', error);
    return res.status(500).json({ 
      error: 'Failed to create session',
      message: error.message 
    });
  }

  // Survey completion email notification endpoint
export async function sendSurveyCompletionEmail(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientEmail, clientName, sessionId } = req.body;

    // Validate required fields
    if (!clientEmail || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send email notification to NDCH team
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'nkrumah@ndchvision.com' }],
          subject: `ChatKit Survey Completed - ${clientName || clientEmail}`
        }],
        from: { email: 'noreply@ndchvision.com', name: 'NDCH ChatKit' },
        content: [{
          type: 'text/html',
          value: `
            <h2>Survey Completion Notification</h2>
            <p><strong>Client Email:</strong> ${clientEmail}</p>
            <p><strong>Client Name:</strong> ${clientName || 'Anonymous'}</p>
            <p><strong>Session ID:</strong> ${sessionId}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p>The client has completed the NDCH ChatKit qualification survey.</p>
          `
        }]
      })
    });

    if (!emailResponse.ok) {
      console.error('SendGrid API Error:', await emailResponse.text());
      return res.status(500).json({ error: 'Failed to send notification email' });
    }

    return res.status(200).json({ success: true, message: 'Notification email sent' });

  } catch (error) {
    console.error('Email notification error:', error);
    return res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
}
}
