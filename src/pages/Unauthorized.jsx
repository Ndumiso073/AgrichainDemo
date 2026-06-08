import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "@fontsource/bebas-neue";
import "@fontsource/inter";
import bgImage from "../assets/images/niklas-hamann-g9H2akguulg-unsplash.jpg";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: "rgba(4,9,2,0.35)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "400px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(32px) saturate(1.4)",
            WebkitBackdropFilter: "blur(32px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "24px",
            padding: "48px 40px",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
            textAlign: "center",
            animation: "fadeUp 0.5s ease both",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(239,68,68,0.8), transparent)",
            }}
          />

          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>

          <div
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#ef4444",
              marginBottom: "12px",
            }}
          >
            Access Denied
          </div>

          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "52px",
              color: "#fff",
              letterSpacing: "2px",
              margin: "0 0 16px",
              lineHeight: 1,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            UNAUTHORIZED
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "13px",
              lineHeight: "1.7",
              marginBottom: "32px",
            }}
          >
            Your role{" "}
            <span style={{ color: "rgba(239,68,68,0.8)", fontWeight: "600" }}>
              ({profile?.role || "unknown"})
            </span>{" "}
            does not have permission to access this page.
          </p>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s",
              }}
            >
              ← Go Back
            </button>
            <button
              onClick={handleSignOut}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px",
                color: "#f87171",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
