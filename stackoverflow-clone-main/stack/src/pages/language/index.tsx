import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/context/TranslationContext";
import { LANGUAGES, LanguageCode } from "@/lib/translations";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Globe, ShieldCheck, Mail, Phone, CheckCircle2, Info } from "lucide-react";

export default function LanguagePage() {
  const { user } = useAuth() as any;
  const { lang: currentLang, setLang, t } = useTranslation();

  const [selectedLang, setSelectedLang] = useState("");
  const [step, setStep] = useState<"select" | "otp">("select");
  const [otp, setOtp] = useState("");
  const [otpMethod, setOtpMethod] = useState<"email" | "mobile">("mobile");
  const [loading, setLoading] = useState(false);

  // ── Demo-mode OTP shown when real SMS delivery isn't available yet ───────
  // (e.g. Fast2SMS account pending DLT/registration verification). The
  // backend only sends this when delivery genuinely failed for a known,
  // expected reason — never alongside a successful real send.
  const [demoOtp, setDemoOtp] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sync with backend on mount (for logged-in users with a saved preference)
  useEffect(() => {
    if (!user) return;
    axiosInstance
      .get("/language/current")
      .then((res) => {
        const serverLang = res.data?.language as LanguageCode | undefined;
        if (serverLang && serverLang !== currentLang) {
          setLang(serverLang);
        }
      })
      .catch(() => {});
  }, [user]);

  const requestOTP = async (langCode: string) => {
    if (langCode === currentLang) return; // already active

    if (!user) {
      // Not logged in — switch immediately without OTP (guest mode)
      setLang(langCode as LanguageCode);
      toast.success("Language switched!");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/language/request-otp", {
        language: langCode,
      });
      setSelectedLang(langCode);
      setOtpMethod(res.data.method);

      if (res.data.demoMode && res.data.demoOtp) {
        setIsDemoMode(true);
        setDemoOtp(res.data.demoOtp);
      } else {
        setIsDemoMode(false);
        setDemoOtp("");
      }

      setStep("otp");
      toast.info(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/language/verify-otp", {
        otp,
        language: selectedLang,
      });

      // ── KEY FIX: actually apply the language site-wide ──────────────────
      setLang(res.data.language as LanguageCode);

      toast.success("Language updated successfully! The site is now in " +
        (LANGUAGES.find((l) => l.code === res.data.language)?.label || res.data.language));
      setStep("select");
      setOtp("");
      setDemoOtp("");
      setIsDemoMode(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const selectedLangObj = LANGUAGES.find((l) => l.code === selectedLang);
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang);

  return (
    <Mainlayout>
      <main className="max-w-xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t("lang.title")}</h1>
        </div>

        {/* Current language */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {t("lang.current")}{" "}
          <strong>
            {currentLangObj?.flag} {currentLangObj?.label}
          </strong>
          <span className="ml-auto text-xs bg-blue-100 px-2 py-0.5 rounded-full">
            All pages translated live
          </span>
        </div>

        {/* Security info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4" /> {t("lang.verificationRequired")}
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-700">
            <li><strong>French</strong> → OTP sent to your <strong>email</strong></li>
            <li><strong>All other languages</strong> → OTP sent to your <strong>mobile number</strong></li>
          </ul>
          {!user && (
            <p className="text-xs text-amber-600 mt-1">
              Not logged in — language will switch immediately without OTP (guest mode).
              Log in for secure OTP-verified switching that syncs across devices.
            </p>
          )}
        </div>

        {step === "select" ? (
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => requestOTP(language.code)}
                disabled={loading || language.code === currentLang}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  language.code === currentLang
                    ? "border-blue-500 bg-blue-50 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                } disabled:opacity-60`}
              >
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">{language.label}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    {language.otpMethod === "email" ? (
                      <>
                        <Mail className="w-3 h-3" /> Email OTP
                      </>
                    ) : (
                      <>
                        <Phone className="w-3 h-3" /> Mobile OTP
                      </>
                    )}
                  </div>
                </div>
                {language.code === currentLang && (
                  <span className="ml-auto text-xs text-blue-600 font-medium">
                    {t("lang.active")}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* OTP step */
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="text-center">
              <p className="text-3xl mb-2">{selectedLangObj?.flag}</p>
              <h2 className="font-semibold text-gray-900">
                Verify to switch to {selectedLangObj?.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                OTP sent via {otpMethod === "email" ? "email" : "mobile number"}
              </p>
            </div>

            {isDemoMode && demoOtp && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Info className="w-3.5 h-3.5" />
                  SMS delivery pending carrier verification
                </div>
                <p className="text-amber-700">
                  Your OTP for this session: <strong className="text-base tracking-widest">{demoOtp}</strong>
                </p>
                <p className="text-amber-600">
                  Real-time SMS delivery requires DLT registration with the telecom
                  provider (a multi-day regulatory process for Indian SMS gateways).
                  Once registered, this OTP will be delivered directly to your phone.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-center text-xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("select");
                  setOtp("");
                  setDemoOtp("");
                  setIsDemoMode(false);
                }}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium"
              >
                {loading ? "Verifying…" : "Verify & Switch"}
              </button>
            </div>
          </div>
        )}
      </main>
    </Mainlayout>
  );
}