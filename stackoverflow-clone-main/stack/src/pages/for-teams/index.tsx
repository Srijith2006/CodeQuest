import Mainlayout from "@/layout/Mainlayout";
import Link from "next/link";
import {
  Users,
  Building,
  Lock,
  Search,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  MessageSquare,
  Settings,
  Globe,
  BarChart3,
  Headphones,
  Cloud,
} from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for individual developers",
    color: "border-gray-200",
    headerColor: "bg-gray-50",
    btnColor: "bg-gray-800 hover:bg-gray-900 text-white",
    href: "/signup",
    features: [
      "1 question per day",
      "Unlimited browsing & answers",
      "AI Assist access",
      "Community access",
      "Basic profile",
    ],
    notIncluded: ["Private team space", "Priority support", "Analytics"],
  },
  {
    name: "Bronze",
    price: "₹100",
    period: "per month",
    desc: "For active developers",
    color: "border-orange-300",
    headerColor: "bg-orange-50",
    btnColor: "bg-orange-500 hover:bg-orange-600 text-white",
    href: "/subscription",
    badge: "Popular",
    features: [
      "5 questions per day",
      "Everything in Free",
      "Priority in search results",
      "Bronze badge on profile",
      "Access to beta features",
    ],
    notIncluded: ["Private team space", "Dedicated support"],
  },
  {
    name: "Silver",
    price: "₹300",
    period: "per month",
    desc: "For power developers",
    color: "border-gray-400",
    headerColor: "bg-gray-100",
    btnColor: "bg-gray-700 hover:bg-gray-800 text-white",
    href: "/subscription",
    features: [
      "10 questions per day",
      "Everything in Bronze",
      "Silver badge on profile",
      "Early access to new features",
      "Community moderator tools",
    ],
    notIncluded: ["Private team space"],
  },
  {
    name: "Gold",
    price: "₹1,000",
    period: "per month",
    desc: "Unlimited — for pros",
    color: "border-yellow-400",
    headerColor: "bg-yellow-50",
    btnColor: "bg-yellow-500 hover:bg-yellow-600 text-white",
    href: "/subscription",
    badge: "Best Value",
    features: [
      "Unlimited questions per day",
      "Everything in Silver",
      "Gold badge on profile",
      "Top placement in user rankings",
      "Direct team support",
      "Analytics dashboard",
    ],
    notIncluded: [],
  },
];

const TEAM_FEATURES = [
  {
    icon: Lock,
    title: "Private Workspace",
    desc: "A secure, private Q&A space only your team can access. Internal knowledge stays internal.",
  },
  {
    icon: Search,
    title: "Unified Search",
    desc: "Search across both the public CodeQuest platform and your private team content simultaneously.",
  },
  {
    icon: BarChart3,
    title: "Team Analytics",
    desc: "Track your team's engagement, most asked topics, unanswered questions, and knowledge gaps.",
  },
  {
    icon: Settings,
    title: "Admin Controls",
    desc: "Manage team members, set permissions, and configure your workspace settings with ease.",
  },
  {
    icon: Cloud,
    title: "Integrations",
    desc: "Connect with Slack, GitHub, Jira, and other tools your team already uses every day.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    desc: "A dedicated customer success manager and priority support SLA for enterprise customers.",
  },
];

const TESTIMONIALS = [
  {
    quote: "CodeQuest for Teams cut our onboarding time by 40%. New developers find answers in minutes instead of pinging colleagues.",
    name: "Arun K.",
    role: "Engineering Manager, Infosys",
    initial: "A",
    color: "bg-blue-600",
  },
  {
    quote: "The private workspace combined with public SO search is exactly what we needed. No more switching between tools.",
    name: "Meera R.",
    role: "CTO, TechStartup",
    initial: "M",
    color: "bg-purple-600",
  },
  {
    quote: "Our team's institutional knowledge was scattered in Slack messages. CodeQuest Teams made it searchable and permanent.",
    name: "David L.",
    role: "VP Engineering, FinTech Co.",
    initial: "D",
    color: "bg-green-600",
  },
];

export default function ForTeamsPage() {
  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto space-y-16 py-6 px-2">

        {/* Hero */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full">
            <Building className="w-4 h-4" /> For Teams & Enterprise
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Your team's private <span className="text-blue-600">knowledge base</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Give your engineering team a private, searchable space to capture and share
            institutional knowledge — built on the same platform trusted by 50M+ developers.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/subscription" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-semibold transition-colors">
              Learn More
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4 bg-blue-600 rounded-2xl p-8 text-white text-center">
          {[
            { value: "10,000+", label: "Teams using CodeQuest" },
            { value: "40%", label: "Faster developer onboarding" },
            { value: "3x", label: "More knowledge retained" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Team features */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Everything your team needs
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Powerful features designed specifically for engineering teams.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM_FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Start free, upgrade when you need more. All plans include core CodeQuest features.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white border-2 ${plan.color} rounded-2xl overflow-hidden hover:shadow-lg transition-shadow relative`}
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className={`${plan.headerColor} px-5 pt-5 pb-4`}>
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xs text-gray-500 mb-1">/{plan.period}</span>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                      <div className="w-4 h-4 flex-shrink-0 mt-0.5 rounded-full border border-gray-300" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <Link
                    href={plan.href}
                    className={`block text-center py-2 rounded-lg text-sm font-semibold transition-colors ${plan.btnColor}`}
                  >
                    {plan.name === "Free" ? "Get Started" : `Choose ${plan.name}`}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Trusted by engineering teams
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} text-white font-bold text-sm flex items-center justify-center`}>
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {[
              {
                q: "Is there a free trial for paid plans?",
                a: "All paid plans are billed monthly with no lock-in. You can switch or cancel any time from your subscription page.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit/debit cards, UPI, and net banking via Razorpay. Payments are secure and encrypted.",
              },
              {
                q: "When can I make payments?",
                a: "Payments are available between 10:00 AM and 11:00 AM IST daily as part of our secure payment window.",
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. Your new plan takes effect immediately on the next billing cycle.",
              },
            ].map((item) => (
              <details key={item.q} className="bg-white border border-gray-200 rounded-xl p-5 group">
                <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 text-center text-white">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-90" />
          <h2 className="text-2xl font-bold mb-3">Ready to empower your team?</h2>
          <p className="text-blue-200 mb-6 max-w-lg mx-auto">
            Join 10,000+ engineering teams already using CodeQuest to capture and share knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/subscription" className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-semibold transition-colors">
              View Plans & Pricing
            </Link>
            <Link href="/signup" className="bg-blue-900 hover:bg-blue-950 text-white px-6 py-2.5 rounded-lg font-semibold border border-blue-500 transition-colors">
              Create Free Account
            </Link>
          </div>
        </section>

      </div>
    </Mainlayout>
  );
}