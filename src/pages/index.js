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
    const accessToken = await loginUser(email, password);
    console.log("✅ Login successful, token length:", accessToken.length);

    if (!accessToken) throw new Error("Login failed: no token returned");

    console.log("🔹 Step 2: Fetching user info with token...");
    const userInfo = await getUserInfo(accessToken);
    console.log("✅ User info received:", userInfo);

    if (!userInfo?.id) {
      console.error("❌ User info missing ID:", userInfo);
      throw new Error("Failed to fetch user info - missing user ID");
    }

    console.log("🔹 Step 3: Setting user in store...");
    setUser({
      token: accessToken,
      id: userInfo.id,
      name: userInfo.name,
    });

    console.log("🔹 Step 4: Redirecting to dashboard...");
    router.push("/dashboard");
    
  } catch (err) {
    console.error("❌ Login/Fetch error:", err);
    
    // More user-friendly error messages
    if (err.message.includes("403") || err.message.includes("forbidden")) {
      setError("Access denied. Please check your credentials or contact support.");
    } else if (err.message.includes("401") || err.message.includes("unauthorized")) {
      setError("Session expired. Please login again.");
    } else {
      setError(err.message || "Login failed. Please try again.");
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
