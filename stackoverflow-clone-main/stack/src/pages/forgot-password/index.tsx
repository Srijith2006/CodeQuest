import { useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { KeyRound, Mail, Phone, CheckCircle2, AlertTriangle } from "lucide-react";

function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center gap-2 mb-6">
      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 bg-orange-500 rounded-sm" />
        </div>
      </div>
      <span className="text-xl font-bold text-gray-800">
        Code<span className="font-normal">Quest</span>
      </span>
    </Link>
  );
}

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error(`Please enter your registered ${method}`);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload = method === "email" ? { email: identifier.trim() } : { phone: identifier.trim() };
      const res = await axiosInstance.post("/forgotpassword/reset", payload);
      setResult({ success: true, message: res.data.message });
      toast.success("Password reset successful!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong";
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Logo />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your registered email or phone number. We'll send you a
              new auto-generated password instantly.
            </p>
          </div>

          {/* Method toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-5">
            {(["email", "phone"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMethod(m); setIdentifier(""); setResult(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  method === m ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {m === "email" ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                {m === "email" ? "Email" : "Phone Number"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {method === "email" ? "Email Address" : "Phone Number"}
              </label>
              <input
                type={method === "email" ? "email" : "tel"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={method === "email" ? "you@example.com" : "+91 9876543210"}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 flex gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                A new auto-generated password (letters only) will be sent to
                you. You can only use this option <strong>once per day</strong>.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending…
                </span>
              ) : "Reset My Password"}
            </button>
          </form>

          {/* Result message */}
          {result && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
                result.success
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <div className="text-center text-sm text-gray-400 mt-5">
            Remembered it?{" "}
            <Link href="/auth" className="text-blue-600 hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}