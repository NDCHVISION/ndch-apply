import OpenAI from 'openai';

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
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.workflowSessions.create({
      workflow_id: process.env.WORKFLOW_ID,
      public_key: process.env.PUBLIC_KEY
    });

    return res.status(200).json({
      session_token: response.session_token,
      session_id: response.id
    });
  } catch (error) {
    console.error('Error creating ChatKit session:', error);
    return res.status(500).json({ 
      error: 'Failed to create session',
      message: error.message 
    });
  }
}
