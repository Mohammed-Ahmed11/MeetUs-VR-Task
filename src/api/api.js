const BASE_URL = "https://api-yeshtery.dev.meetusvr.com/v1";

// Login and get token
export async function loginUser(email, password) {
  try {
    console.log("🔹 Attempting login with:", { email, isEmployee: true });
    
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
      console.error("❌ Login failed with response:", errorText);
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("🔹 Full login response data:", data);

    if (!data.token) {
      throw new Error("No token in response");
    }

    // Store tokens
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("token", data.token);

    // Return token and check for any user data in response
    return {
      token: data.token,
      // Extract any possible user data from login response
      userData: data.user || data.userData || data.profile || null
    };
    
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
}

// Enhanced getUserInfo with graceful fallback
export async function getUserInfo(token, email = '') {
  if (!token) {
    throw new Error("Missing token");
  }

  console.log("🔹 Starting user info fetch...");

  try {
    // Strategy 1: Try the main endpoint first
    console.log("🔹 Trying main user info endpoint...");
    
    const response = await fetch("/api/userInfo", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ token }),
    });

    const text = await response.text();
    console.log(`🔹 Main endpoint response:`, { status: response.status, text });

    if (response.ok) {
      const data = JSON.parse(text);
      console.log("✅ Success with main endpoint:", data);
      return data;
    }

    // If main endpoint fails, try alternative endpoints
    const endpoints = [
      '/v1/users/me', 
      '/v1/user/profile',
      '/v1/auth/user',
      '/v1/me',
      '/v1/account'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔹 Trying alternative endpoint: ${endpoint}`);
        
        const altResponse = await fetch("/api/userInfo", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ token, endpoint }),
        });

        const altText = await altResponse.text();
        console.log(`🔹 ${endpoint} response:`, { status: altResponse.status });

        if (altResponse.ok) {
          const data = JSON.parse(altText);
          console.log(`✅ Success with endpoint ${endpoint}:`, data);
          return data;
        }
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} error:`, error.message);
        continue;
      }
    }

    // If all endpoints fail, use graceful fallback
    console.log("🔹 All API endpoints failed, using graceful fallback");
    return createGracefulUserInfo(email, token);
    
  } catch (error) {
    console.error("❌ getUserInfo error:", error);
    // Even if there's an error, return fallback data instead of throwing
    return createGracefulUserInfo(email, token);
  }
}

// Graceful fallback - creates user info without throwing errors
function createGracefulUserInfo(email, token) {
  const fallbackUserInfo = {
    id: `user-${Date.now()}`,
    email: email || 'unknown@email.com',
    name: email ? email.split('@')[0] : 'User',
    isFallback: true,
    message: 'Using fallback user data - API endpoints not accessible',
    timestamp: new Date().toISOString()
  };
  
  console.log("🟡 Using graceful fallback user info:", fallbackUserInfo);
  return fallbackUserInfo;
}

// Simple token validation (optional)
export async function validateToken(token) {
  try {
    const response = await fetch("https://api-yeshtery.dev.meetusvr.com/v1/user/info", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });
    
    return {
      isValid: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}