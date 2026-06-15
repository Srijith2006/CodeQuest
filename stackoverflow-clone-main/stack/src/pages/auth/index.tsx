import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const { Login, setLoggedInUser } = useAuth() as any;
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // OTP step (Chrome users)
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const result = await Login({ email: form.email, password: form.password });

      if (result?.requiresOTP) {
        setUserId(result.userId);
        setOtpStep(true);
        toast.info(result.message);
      } else if (result?.success) {
        router.push("/");
      }
      // errors already toasted by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e: any) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axiosInstance.post("/user/verify-login-otp", {
        userId,
        otp,
      });
      const { data, token } = res.data;
      setLoggedInUser(data, token);
      toast.success("Login successful!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const Logo = () => (
    <Link href="/" className="flex items-center justify-center mb-4">
      <div className="w-8 h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
          <div className="w-4 h-4 bg-orange-500 rounded-sm" />
        </div>
      </div>
      <span className="text-xl font-bold text-gray-800">
        code<span className="font-normal">quest</span>
      </span>
    </Link>
  );

  if (otpStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Logo />
          </div>
          <form onSubmit={handleOTPVerify}>
            <Card>
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-xl">
                  Email Verification Required
                </CardTitle>
                <CardDescription>
                  A 6-digit OTP has been sent to your email. Enter it below to
                  complete login.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    className="text-center text-xl tracking-widest font-bold"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {otpLoading ? "Verifying…" : "Verify & Login"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setOtp("");
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to login
                </button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo />
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Log in to your account</CardTitle>
              <CardDescription>
                Enter your email and password to access Code-Quest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={handleChange}
                  value={form.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  onChange={handleChange}
                  value={form.password}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Logging in…" : "Log in"}
              </Button>
              <div className="text-center text-sm">
                <Link
                  href="/forgot-password"
                  className="text-blue-600 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
