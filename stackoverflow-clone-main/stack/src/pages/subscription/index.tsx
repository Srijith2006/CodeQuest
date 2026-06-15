import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Check, Crown, Lock, Clock } from "lucide-react";

declare global { interface Window { Razorpay: any; } }

const PLANS = [
  {
    key: "free",
    label: "Free",
    price: 0,
    priceLabel: "₹0",
    color: "border-gray-200",
    headerColor: "bg-gray-50",
    badgeColor: "bg-gray-100 text-gray-700",
    limit: "1 question / day",
    features: ["Ask 1 question per day", "Answer questions", "Vote on posts", "Basic profile"],
  },
  {
    key: "bronze",
    label: "Bronze",
    price: 100,
    priceLabel: "₹100/mo",
    color: "border-amber-300",
    headerColor: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
    limit: "5 questions / day",
    features: ["Ask 5 questions per day", "All Free features", "Priority listing", "Bronze badge"],
  },
  {
    key: "silver",
    label: "Silver",
    price: 300,
    priceLabel: "₹300/mo",
    color: "border-gray-400",
    headerColor: "bg-gray-100",
    badgeColor: "bg-gray-200 text-gray-800",
    limit: "10 questions / day",
    features: ["Ask 10 questions per day", "All Bronze features", "Silver badge", "Early access"],
    popular: true,
  },
  {
    key: "gold",
    label: "Gold",
    price: 1000,
    priceLabel: "₹1000/mo",
    color: "border-yellow-400",
    headerColor: "bg-yellow-50",
    badgeColor: "bg-yellow-100 text-yellow-800",
    limit: "Unlimited questions",
    features: ["Unlimited questions", "All Silver features", "Gold badge", "VIP support"],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth() as any;
  const token = user?.token;
  const [currentPlan, setCurrentPlan] = useState("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [windowOpen, setWindowOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get("/subscription/status", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setCurrentPlan(res.data.data?.plan || "free");
      setExpiresAt(res.data.data?.expiresAt || null);
    }).catch(() => {});

    // Check payment window (10–11 AM IST)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);
    const h = ist.getUTCHours();
    const m = ist.getUTCMinutes();
    const total = h * 60 + m;
    setWindowOpen(total >= 600 && total < 660);
  }, [user]);

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (!user) { toast.error("Please log in first"); return; }
    if (plan.key === "free") return;
    if (!windowOpen) {
      toast.error("Payments are only allowed between 10:00 AM and 11:00 AM IST.");
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error("Payment gateway failed to load"); return; }

      const orderRes = await axiosInstance.post(
        "/subscription/create-order",
        { plan: plan.key },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Code-Quest",
        description: `${plan.label} Plan – Monthly Subscription`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await axiosInstance.post(
              "/subscription/verify",
              { ...response, plan: plan.key },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`🎉 ${plan.label} plan activated! Invoice sent to your email.`);
            setCurrentPlan(plan.key);
            setExpiresAt(verifyRes.data.data?.subscription?.expiresAt);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#1a73e8" },
      };

      new window.Razorpay(options).open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <main className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500">Upgrade your plan to ask more questions every day.</p>
        </div>

        {/* Payment window warning */}
        <div className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm border ${
          windowOpen ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          {windowOpen
            ? "✅ Payment window is open (10:00 AM – 11:00 AM IST). You can subscribe now!"
            : "⚠️ Payments are only accepted between 10:00 AM and 11:00 AM IST. Come back then to upgrade."}
        </div>

        {/* Current plan */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
            <strong>Current Plan:</strong> {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            {expiresAt && ` — expires ${new Date(expiresAt).toLocaleDateString()}`}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative border-2 rounded-xl overflow-hidden flex flex-col ${plan.color} ${
                currentPlan === plan.key ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-3 right-3">
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </span>
                </div>
              )}
              {currentPlan === plan.key && (
                <div className="absolute top-3 left-3">
                  <Crown className="w-4 h-4 text-yellow-500" />
                </div>
              )}

              <div className={`p-5 ${plan.headerColor}`}>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${plan.badgeColor}`}>
                  {plan.label}
                </span>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-gray-900">{plan.priceLabel}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{plan.limit}</p>
              </div>

              <div className="p-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="p-5 pt-0">
                {plan.key === "free" ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    Current Default
                  </button>
                ) : currentPlan === plan.key ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-not-allowed"
                  >
                    ✓ Active
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading || !windowOpen}
                    className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center gap-2"
                  >
                    {!windowOpen && <Lock className="w-3 h-3" />}
                    {loading ? "Processing…" : `Subscribe – ${plan.priceLabel}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400">
          Payments processed securely via Razorpay. Invoice sent to your email on success.
        </p>
      </main>
    </Mainlayout>
  );
}