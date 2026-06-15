import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Eye, EyeOff, CheckCircle2, Phone } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { Signup, loading } = useAuth() as any;
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  // Password strength checks
  const checks = {
    length: form.password.length >= 8,
    letter: /[a-zA-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][strength];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("All fields are required");
      return;
    }
    // Basic phone validation — at least 10 digits
    const digitsOnly = form.phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      toast.error("Please enter a valid phone number (at least 10 digits)");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the Terms of Service");
      return;
    }
    if (!checks.length || !checks.letter || !checks.number) {
      toast.error("Password must be 8+ characters with at least 1 letter and 1 number");
      return;
    }
    const result = await Signup(form);
    if (result?.success) router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-center px-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white w-96 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
            <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
          </div>
          <span className="text-2xl font-bold">CodeQuest</span>
        </div>

        <h2 className="text-3xl font-bold mb-4 leading-snug">
          Join millions of developers
        </h2>
        <p className="text-orange-100 mb-8 leading-relaxed">
          Ask questions, share knowledge, and grow your career with the world's
          largest developer community.
        </p>

        <div className="space-y-3">
          {[
            "Get answers to any coding question",
            "Share your expertise with others",
            "Earn rewards and recognition",
            "Access AI-powered coding help",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-orange-100">
              <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-orange-400">
          <p className="text-orange-200 text-sm">Already have an account?</p>
          <Link
            href="/auth"
            className="mt-2 inline-block text-white font-semibold underline underline-offset-2 hover:text-orange-100 transition-colors"
          >
            Log in here →
          </Link>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-800">
                Code<span className="font-normal">Quest</span>
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Join the CodeQuest developer community — it's free.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display name */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Display name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Srijith S"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1"
                  autoComplete="email"
                />
              </div>

              {/* Phone number */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1"
                  autoComplete="tel"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Required for OTP verification (password reset, language switching, mobile login).
                </p>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength ? strengthColor : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${strength === 3 ? "text-green-600" : strength === 2 ? "text-yellow-600" : "text-red-500"}`}>
                      {strengthLabel} password
                    </p>
                  </div>
                )}

                {/* Requirements */}
                <div className="mt-2 space-y-0.5">
                  {[
                    { ok: checks.length, text: "At least 8 characters" },
                    { ok: checks.letter, text: "At least 1 letter" },
                    { ok: checks.number, text: "At least 1 number" },
                  ].map((c) => (
                    <p key={c.text} className={`text-xs flex items-center gap-1 ${c.ok ? "text-green-600" : "text-gray-400"}`}>
                      <CheckCircle2 className={`w-3 h-3 ${c.ok ? "text-green-500" : "text-gray-300"}`} />
                      {c.text}
                    </p>
                  ))}
                </div>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 accent-orange-500 w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-gray-600 leading-snug">
                  I agree to the{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/auth" className="text-blue-600 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
