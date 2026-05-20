// api/yahoo.js
export default async function handler(req, res) {
  const path = req.url.replace('/api/yahoo', '');
  const yahooUrl = `https://query1.finance.yahoo.com${path}`;

  try {
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}