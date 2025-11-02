export default async function handler(req, res) {
  try {
    const { messages, response_json } = req.body || {};
    if (!process.env.OPENAI_API_KEY)
      return res.status(500).send('Missing OPENAI_API_KEY');

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        ...(response_json ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: `You are "Majra Compliance Copilot" – answer about FSA, ISO 22000, BRCGS, SALSA, HACCP. Avoid copyrighted text.` },
          ...(Array.isArray(messages) ? messages : [])
        ]
      })
    });

    if (!resp.ok) return res.status(resp.status).send(await resp.text());
    const data = await resp.json();
    res.status(200).json({ content: data.choices[0].message.content });
  } catch (e) { res.status(500).send(e.message); }
}
