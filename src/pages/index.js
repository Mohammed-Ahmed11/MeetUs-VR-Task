import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "../store/authStore";
import { loginUser, getUserInfo } from "../api/api";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, token, checkAuth } = useAuthStore(); // setUser will store info in your store

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (token) router.push("/dashboard");
  }, [token]);

  useEffect(() => {
    setValid(email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && password.length > 0);
  }, [email, password]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!valid) return;

  setLoading(true);
  setError("");

  try {
    console.log("🔹 Step 1: Attempting login...");
    const loginResult = await loginUser(email, password);
    const accessToken = loginResult.token;
    
    console.log("✅ Login successful, token received");
    console.log("🔹 Login response contained user data:", !!loginResult.userData);

    let userInfo;

    // First, check if user data is in login response
    if (loginResult.userData && (loginResult.userData.id || loginResult.userData.email)) {
      console.log("✅ Using user data from login response");
      userInfo = loginResult.userData;
    } else {
      console.log("🔹 Step 2: Fetching user info from API...");
      userInfo = await getUserInfo(accessToken, email);
      console.log("✅ User info obtained:", userInfo);
    }

    // Always set user - even with fallback data
    setUser({
      token: accessToken,
      id: userInfo.id || `user-${Date.now()}`,
      name: userInfo.name || userInfo.username || email.split('@')[0],
      email: userInfo.email || email,
      isFallback: userInfo.isFallback || false
    });

    console.log("🔹 Step 3: Redirecting to dashboard...");
    router.push("/dashboard");
    
  } catch (err) {
    console.error("❌ Login error:", err);
    
    // More user-friendly error messages
    if (err.message.includes('Login failed')) {
      setError("Invalid email or password. Please check your credentials.");
    } else {
      setError("Login failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container">
      <div className="left-section">
        <h1>Welcome back</h1>
        <p className="subtitle">
          Step into our shopping metaverse for an <br></br> unforgettable shopping experience
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <img src="/images/sms.png" alt="email" style={{ width: 20 }} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <img
                src="/images/lock.png"
                alt="password"
                style={{ width: 20 }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={!valid || loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div class="signup-link">
            Dont have an account? <a href="#">Sign up</a>
          </div>

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
        </form>
      </div>

      <div className="right-section">
        <img src="/images/Ellipse 2489.png" className="top-image" />
        <img src="/images/Frame-22.png" className="shape" />
        <img src="/images/meetusvr 3d logo-01 2.png" className="logo" />
        <img src="/images/Ellipse 2488@2x.png" className="bottom-image" />
      </div>
    </div>
  );
}
