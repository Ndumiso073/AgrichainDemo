import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "@fontsource/bebas-neue";
import "@fontsource/inter";
import bgImage from "../assets/images/pexels-damir-33447908.jpg";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/verify-otp", { state: { email, skipOtp: true } });
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    background:
      focused === field ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${focused === field ? "rgba(74,222,128,0.6)" : "rgba(255,255,255,0.15)"}`,
    borderRadius: "10px",
    padding: "14px 16px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    backdropFilter: "blur(4px)",
  });

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.75) saturate(0.9)",
          }}
        />

        {/* Subtle dark overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: "rgba(4,9,2,0.35)",
          }}
        />

        {/* Glass card */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "420px",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(4px) saturate(1.1)",
            WebkitBackdropFilter: "blur(4px) saturate(1.1)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "48px 40px",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
            animation: "fadeUp 0.5s ease both",
          }}
        >
          {/* Top green accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(74,222,128,0.8), transparent)",
            }}
          />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
                  stroke="rgba(74,222,128,0.9)"
                  strokeWidth="1.5"
                  fill="rgba(74,222,128,0.12)"
                />
                <path
                  d="M16 8L23 12V20L16 24L9 20V12L16 8Z"
                  fill="rgba(74,222,128,0.2)"
                  stroke="rgba(74,222,128,0.5)"
                  strokeWidth="1"
                />
                <circle cx="16" cy="16" r="3" fill="#4ade80" />
              </svg>
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "26px",
                  color: "#fff",
                  letterSpacing: "3px",
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                AGRI<span style={{ color: "#4ade80" }}>CHAIN</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Secure Portal Access
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@agrichain.io"
                required
                style={inputStyle("email")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                style={inputStyle("password")}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "12px",
                }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "14px",
                background: loading
                  ? "rgba(74,222,128,0.3)"
                  : "linear-gradient(135deg, rgba(74,222,128,0.85), rgba(34,197,94,0.75))",
                border: "1px solid rgba(74,222,128,0.4)",
                borderRadius: "10px",
                color: loading ? "rgba(255,255,255,0.5)" : "#040902",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
                backdropFilter: "blur(8px)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(74,222,128,0.3)",
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Authenticating...
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
              fontSize: "12px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <p style={{ margin: "0 0 8px" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#4ade80",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Sign up
              </Link>
            </p>
            <p style={{ margin: 0, fontSize: "11px" }}>
              <Link
                to="/forgot-password"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </p>
            {/* Back to Home */}
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "11px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.35)",
                fontSize: "11px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
