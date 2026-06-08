import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "@fontsource/bebas-neue";
import "@fontsource/inter";
import bgImage from "../assets/images/pexels-damir-33447908.jpg";

const ROLES = [
  {
    value: "farmer",
    label: "Farmer",
    desc: "Register and manage harvests",
    accent: "#4ade80",
    rgb: "74,222,128",
  },
  {
    value: "buyer",
    label: "Buyer",
    desc: "Scan and verify produce",
    accent: "#60a5fa",
    rgb: "96,165,250",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function getStrength(p) {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }
  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#f87171", "#facc15", "#60a5fa", "#4ade80"][
    strength
  ];

  function validate() {
    if (!fullName.trim()) return "Full name is required.";
    if (!role) return "Please select a role.";
    if (!email.trim()) return "Email address is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (strength < 2) return "Password is too weak. Add numbers or symbols.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  }

  async function handleRegister(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), role },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (signUpError) throw signUpError;
      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          role,
        });
        if (profileError)
          console.warn("Profile insert error:", profileError.message);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    background:
      focused === field ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${focused === field ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.10)"}`,
    borderRadius: "8px",
    padding: "11px 14px",
    color: "#fff",
    fontSize: "13px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  });

  const labelStyle = {
    display: "block",
    fontSize: "9px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "6px",
  };

  // Success screen
  if (step === 2)
    return (
      <>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
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
              background: "rgba(4,9,2,0.45)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "420px",
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(4px) saturate(1.1)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "48px 40px",
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
                  "linear-gradient(to right, transparent, rgba(74,222,128,0.8), transparent)",
              }}
            />
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(74,222,128,0.15)",
                border: "1px solid rgba(74,222,128,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "24px",
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "28px",
                color: "#fff",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              CHECK YOUR <span style={{ color: "#4ade80" }}>EMAIL</span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                lineHeight: "1.7",
                margin: "0 0 6px",
              }}
            >
              We sent a confirmation link to
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#4ade80",
                fontFamily: "monospace",
                margin: "0 0 20px",
                wordBreak: "break-all",
              }}
            >
              {email}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                lineHeight: "1.7",
                margin: "0 0 28px",
              }}
            >
              Click the link to activate your account. Check spam if you don't
              see it.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "12px",
                background:
                  "linear-gradient(135deg, rgba(74,222,128,0.85), rgba(34,197,94,0.75))",
                border: "1px solid rgba(74,222,128,0.4)",
                borderRadius: "8px",
                color: "#040902",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Go to Login →
            </button>
          </div>
        </div>
      </>
    );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        .reg-divider { width: 1px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent); align-self: stretch; flex-shrink: 0; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Background */}
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
            background: "rgba(4,9,2,0.45)",
          }}
        />

        {/* Two-column card */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "820px",
            display: "flex",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(4px) saturate(1.1)",
            WebkitBackdropFilter: "blur(4px) saturate(1.1)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            overflow: "hidden",
            animation: "fadeUp 0.5s ease both",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* Green top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(74,222,128,0.7), transparent)",
              zIndex: 2,
            }}
          />

          {/* ── LEFT PANEL ── */}
          <div
            style={{
              width: "280px",
              flexShrink: 0,
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            {/* Logo */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
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
                    fontSize: "22px",
                    letterSpacing: "3px",
                  }}
                >
                  AGRI<span style={{ color: "#4ade80" }}>CHAIN</span>
                </span>
              </div>
              <p
                style={{
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: "0 0 32px",
                }}
              >
                Create Your Account
              </p>

              {/* Role selector */}
              <div style={{ marginBottom: "8px" }}>
                <p
                  style={{
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: "12px",
                  }}
                >
                  I am a
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {ROLES.map((r) => (
                    <div
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background:
                          role === r.value
                            ? `rgba(${r.rgb},0.12)`
                            : "rgba(255,255,255,0.03)",
                        border:
                          role === r.value
                            ? `1px solid rgba(${r.rgb},0.4)`
                            : "1px solid rgba(255,255,255,0.08)",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "16px",
                            color: role === r.value ? r.accent : "#fff",
                            letterSpacing: "1px",
                            marginBottom: "2px",
                          }}
                        >
                          {r.label}
                        </div>
                        <div
                          style={{
                            fontSize: "9px",
                            color: "rgba(255,255,255,0.35)",
                            lineHeight: "1.4",
                          }}
                        >
                          {r.desc}
                        </div>
                      </div>
                      {role === r.value && (
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: `rgba(${r.rgb},0.2)`,
                            border: `1px solid rgba(${r.rgb},0.5)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: r.accent,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div>
              <div
                style={{
                  width: "100%",
                  height: "1px",
                  background: "rgba(255,255,255,0.06)",
                  marginBottom: "20px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: "1px",
                  }}
                >
                  Polygon blockchain secured
                </span>
              </div>
              <p
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.25)",
                  margin: "0 0 16px",
                  lineHeight: "1.6",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#4ade80",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </p>
              <p
                style={{
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.18)",
                  margin: 0,
                }}
              >
                Email confirmation required to activate account
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div
            style={{
              flex: 1,
              padding: "40px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "28px",
                  color: "#fff",
                  letterSpacing: "2px",
                  margin: "0 0 4px",
                }}
              >
                JOIN THE <span style={{ color: "#4ade80" }}>NETWORK</span>
              </h2>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  margin: 0,
                }}
              >
                Fill in your details to get started
              </p>
            </div>

            <form
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Full name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  placeholder="e.g. Sipho Dlamini"
                  required
                  style={inputStyle("name")}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle("email")}
                />
              </div>

              {/* Password row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="Min. 8 chars"
                      required
                      style={{
                        ...inputStyle("password"),
                        paddingRight: "44px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.35)",
                        cursor: "pointer",
                        fontSize: "10px",
                        padding: 0,
                      }}
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: "5px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          marginBottom: "3px",
                        }}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: "2px",
                              borderRadius: "2px",
                              background:
                                i <= strength
                                  ? strengthColor
                                  : "rgba(255,255,255,0.08)",
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: "9px", color: strengthColor }}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      onFocus={() => setFocused("confirm")}
                      onBlur={() => setFocused(null)}
                      placeholder="Repeat password"
                      required
                      style={{
                        ...inputStyle("confirm"),
                        paddingRight: "44px",
                        borderColor:
                          confirm && password !== confirm
                            ? "rgba(248,113,113,0.5)"
                            : confirm && password === confirm
                              ? "rgba(74,222,128,0.5)"
                              : focused === "confirm"
                                ? "rgba(74,222,128,0.5)"
                                : "rgba(255,255,255,0.10)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.35)",
                        cursor: "pointer",
                        fontSize: "10px",
                        padding: 0,
                      }}
                    >
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p
                      style={{
                        fontSize: "9px",
                        color: "#f87171",
                        margin: "4px 0 0",
                      }}
                    >
                      Passwords do not match
                    </p>
                  )}
                  {confirm && password === confirm && (
                    <p
                      style={{
                        fontSize: "9px",
                        color: "#4ade80",
                        margin: "4px 0 0",
                      }}
                    >
                      ✓ Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#fca5a5",
                    fontSize: "11px",
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "4px",
                  width: "100%",
                  padding: "13px",
                  background: loading
                    ? "rgba(74,222,128,0.3)"
                    : "linear-gradient(135deg, rgba(74,222,128,0.85), rgba(34,197,94,0.75))",
                  border: "1px solid rgba(74,222,128,0.4)",
                  borderRadius: "8px",
                  color: loading ? "rgba(255,255,255,0.5)" : "#040902",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 20px rgba(74,222,128,0.25)",
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
                        width: "13px",
                        height: "13px",
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
