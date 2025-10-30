export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;
  console.log("🔹 Proxy received token:", token ? token.substring(0, 20) + "..." : "No token");

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  try {
    console.log("🔹 Making request to external API...");
    
    const API_URL = "https://api-yeshtery.dev.meetusvr.com/v1/user/info";
    console.log("🔹 API URL:", API_URL);
    
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "MeetUsVR-App/1.0.0",
      },
    });

    console.log("🔹 External API response status:", response.status);
    console.log("🔹 External API headers:", Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log("🔹 External API raw response:", text);

    // Try to parse JSON
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return res.status(500).json({ 
        error: "Invalid JSON response from API",
        raw: text.substring(0, 200)
      });
    }

    if (!response.ok) {
      console.error("❌ API error response:", {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      // More specific error messages based on status code
      if (response.status === 403) {
        return res.status(403).json({ 
          error: "Access forbidden - invalid token or insufficient permissions",
          details: data
        });
      } else if (response.status === 401) {
        return res.status(401).json({ 
          error: "Unauthorized - token may be expired",
          details: data
        });
      }
      
      return res.status(response.status).json({ 
        error: `API request failed with status ${response.status}`,
        details: data
      });
    }

    console.log("✅ User info fetched successfully:", data);
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return res.status(500).json({ 
      error: "Proxy failed to fetch user info",
      message: error.message 
    });
  }
}