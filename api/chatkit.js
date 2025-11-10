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
}
