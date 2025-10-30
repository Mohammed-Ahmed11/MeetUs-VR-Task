const BASE_URL = "https://api-yeshtery.dev.meetusvr.com/v1";

// Login and get token
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/yeshtery/token`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        email, 
        password, 
        isEmployee: true 
      }),
    });

    console.log("🔹 Login response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Login successful, token received");

    if (!data.token) {
      throw new Error("No token in response");
    }

    // Store tokens
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("token", data.token);

    return data.token;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
}

// Fetch user info via Next.js proxy
export async function getUserInfo(token) {
  if (!token) {
    console.error("❌ No token provided to getUserInfo");
    throw new Error("Missing token");
  }

  try {
    console.log("🔹 Fetching user info with token:", token.substring(0, 20) + "...");
    
    const response = await fetch("/api/userInfo", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ token }),
    });

    console.log("🔹 Proxy response status:", response.status);

    const text = await response.text();
    console.log("🔹 Proxy raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 403) {
        throw new Error("Access forbidden: Invalid token or insufficient permissions");
      } else if (response.status === 401) {
        throw new Error("Unauthorized: Token may be expired");
      }
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    console.log("✅ User info received successfully");
    return data;
  } catch (error) {
    console.error("❌ getUserInfo error:", error);
    throw new Error(`Failed to fetch user info: ${error.message}`);
  }
}