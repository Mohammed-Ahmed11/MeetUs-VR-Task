export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, endpoint = '/v1/user/info' } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  try {
    const API_URL = `https://api-yeshtery.dev.meetusvr.com${endpoint}`;
    console.log("🔹 Trying API URL:", API_URL);
    
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("🔹 API response status:", response.status);
    
    const text = await response.text();
    console.log("🔹 API raw response:", text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      return res.status(500).json({ 
        error: "Invalid JSON response",
        raw: text.substring(0, 200)
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `API request failed with status ${response.status}`,
        details: data,
        endpoint: endpoint
      });
    }

    console.log("✅ Success with endpoint:", endpoint);
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return res.status(500).json({ 
      error: "Proxy failed",
      message: error.message 
    });
  }
}