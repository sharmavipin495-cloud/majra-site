export default async function handler(req, res) {
  try {
    const { messages, imageDataUrl } = req.body || {};
    if (!process.env.OPENAI_API_KEY)
      return res.status(500).send('Missing OPENAI_API_KEY');
    if (!imageDataUrl)
      return res.status(400).send('imageDataUrl required');

    const last = (messages && messages[messages.length - 1]) || { role: 'user', content: 'Analyze image' };
    const visionMessages = [
      { role: 'system', content: 'You are a food-safety image reviewer. Find contamination, hygiene issues, pests, PPE gaps, label mistakes. Give severity and fixes.' },
      ...messages.slice(0, -1),
      { role: 'user', content: [
        { type: 'text', text: last.content },
        { type: 'image_url', image_url: { url: imageDataUrl } }
      ]}
    ];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.2, messages: visionMessages })
    });

    if (!resp.ok) return res.status(resp.status).send(await resp.text());
    const data = await resp.json();
    res.status(200).json({ content: data.choices[0].message.content });
  } catch (e) { res.status(500).send(e.message); }
}
