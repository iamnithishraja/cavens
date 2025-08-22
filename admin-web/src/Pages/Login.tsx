import { useMemo, useState, type KeyboardEvent } from "react";
import { api, setAdminToken } from "../lib/api";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "../Constants/country";
import logo from "../assets/adaptive-icon.png";

interface ApiError {
  response?: {
    data?: {
      code?: string;
      message?: string;
      redirectUrl?: string;
    };
  };
  message?: string;
}

export default function Login() {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const dialCode = useMemo(() => country.dialCode, [country]);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    setRedirectUrl(null);
    try {
      const res = await api.post("/api/v1/admin/auth/onboarding", { dialCode, phone: phone.trim() });
      if (res.status === 200) setStep("otp");
    } catch (e: unknown) {
      const error = e as ApiError;
      const data = error?.response?.data;
      if (data?.code === "NOT_FOUND" && data?.redirectUrl) {
        setRedirectUrl(data.redirectUrl);
        setError(data.message || "Admin account not found");
      } else {
        setError(data?.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/v1/admin/auth/verify-otp", { dialCode, phone: phone.trim(), otp: otp.join("") });
      const { success, token, role, message } = res.data || {};
      if (!success) throw new Error(message || "Verification failed");
      if (role !== "admin") throw new Error("Admin only can access");
      setAdminToken(token);
      window.location.href = "/approve";
    } catch (e: unknown) {
      const error = e as ApiError;
      setError(error?.response?.data?.message || error?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, idx: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);

      if (value && idx < 3) {
        const next = document.getElementById(`otp-${idx + 1}`);
        next?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    const key = e.key;
    if (key === "Backspace") {
      e.preventDefault();
      const current = otp[idx];
      const nextOtp = [...otp];
      if (current) {
        nextOtp[idx] = "";
        setOtp(nextOtp);
        return;
      }
      if (idx > 0) {
        nextOtp[idx - 1] = "";
        setOtp(nextOtp);
        const prev = document.getElementById(`otp-${idx - 1}`);
        prev?.focus();
      }
      return;
    }
    if (key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      const prev = document.getElementById(`otp-${idx - 1}`);
      prev?.focus();
      return;
    }
    if (key === "ArrowRight" && idx < 3) {
      e.preventDefault();
      const next = document.getElementById(`otp-${idx + 1}`);
      next?.focus();
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative gradient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 -left-1/3 w-[80vw] h-[80vw] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(closest-side, rgba(78,162,255,0.25), rgba(78,162,255,0))" }} />
        <div className="absolute -bottom-1/3 -right-1/3 w-[80vw] h-[80vw] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(closest-side, rgba(249,214,92,0.12), rgba(249,214,92,0))" }} />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-surface border border-brand rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="caVen Logo" className="h-12 w-auto" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1">caVen Admin</h1>
            <p className="text-[var(--text-secondary)] text-sm">Sign in with your admin mobile number</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-[var(--text-primary)] p-4 rounded-xl mb-6 text-sm">
              <div className="text-center">
                {error}
                {redirectUrl && (
                  <div className="mt-2">
                    <a href={redirectUrl} className="text-[var(--accent-blue)] underline font-medium hover:opacity-80 cursor-pointer" target="_blank" rel="noreferrer">
                      Register in app
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "phone" ? (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-[var(--text-secondary)] text-sm font-medium">Mobile Number</label>
                <div className="flex gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setCountryOpen((v) => !v)}
                      className="w-24 px-3 py-3 rounded-xl bg-surface-elevated text-[var(--text-primary)] border border-brand flex items-center justify-between hover:border-[var(--accent-blue)] transition-colors cursor-pointer"
                      aria-haspopup="listbox"
                      aria-expanded={countryOpen}
                    >
                      <span className="text-sm font-medium">{country.dialCode}</span>
                      <span className={`text-xs transition-transform ${countryOpen ? 'rotate-180' : ''}`} aria-hidden>▼</span>
                    </button>
                    {countryOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setCountryOpen(false)}
                        />
                        <div className="absolute z-40 top-full left-0 w-72 bg-surface-elevated border border-brand rounded-xl mt-1 max-h-60 overflow-auto shadow-xl">
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => {
                                setCountry(c);
                                setCountryOpen(false);
                              }}
                              className="flex items-center justify-between w-full px-3 py-3 text-left hover:bg-[var(--surface)] border-b border-brand/30 last:border-b-0 cursor-pointer"
                              role="option"
                            >
                              <span className="text-sm">{c.name}</span>
                              <span className="text-[var(--text-secondary)] text-sm">{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter phone number"
                    inputMode="numeric"
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated text-[var(--text-primary)] border border-brand outline-none placeholder:text-[var(--text-secondary)] hover:border-[var(--accent-blue)] focus:border-[var(--accent-blue)] transition-colors"
                  />
                </div>
              </div>
              
              <button
                onClick={sendOtp}
                disabled={loading || phone.length < 5}
                className="w-full px-4 py-3 rounded-xl btn-primary font-semibold disabled:opacity-50 hover:opacity-90 transition-colors cursor-pointer active:translate-y-px"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              
              <p className="text-[var(--text-secondary)] text-sm text-center">
                If you don't have an admin account, register in the caven mobile app first.
              </p>
              {phone.length > 0 && phone.length < 5 && (
                <p className="text-red-400 text-xs text-center">Enter a valid mobile number</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block mb-3 text-[var(--text-secondary)] text-sm font-medium">Enter OTP</label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-14 h-14 text-center rounded-xl bg-surface-elevated text-[var(--text-primary)] border border-brand text-lg font-medium outline-none hover:border-[var(--accent-blue)] focus:border-[var(--accent-blue)] transition-colors"
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={verifyOtp}
                disabled={loading || otp.join("").length !== 4}
                className="w-full px-4 py-3 rounded-xl btn-primary font-semibold disabled:opacity-50 hover:opacity-90 transition-colors cursor-pointer active:translate-y-px"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              {otp.join("").length > 0 && otp.join("").length < 4 && (
                <p className="text-red-400 text-xs text-center">Enter the 4-digit OTP</p>
              )}
              
              <button 
                onClick={() => setStep("phone")} 
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated text-[var(--text-primary)] border border-brand font-semibold hover:bg-[var(--surface)] transition-colors cursor-pointer"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
