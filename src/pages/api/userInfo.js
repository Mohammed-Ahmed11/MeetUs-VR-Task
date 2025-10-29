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

        const response = await fetch("https://api-yeshtery.dev.meetusvr.com/v1/user/info", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });

    console.log("🔹 External API response status:", response.status);
    
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
            raw: text.substring(0, 200) // First 200 chars only
        });
        }

        if (!response.ok) {
        console.error("❌ API error response:", data);
        return res.status(response.status).json({ 
            error: "API request failed",
            details: data,
            status: response.status
        });
        }

        console.log("✅ User info fetched successfully");
        return res.status(200).json(data);
        
    } catch (error) {
        console.error("❌ Proxy error:", error);
        return res.status(500).json({ 
        error: "Proxy failed to fetch user info",
        message: error.message 
        });
    }
}