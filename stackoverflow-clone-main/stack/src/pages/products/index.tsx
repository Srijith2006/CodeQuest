import Mainlayout from "@/layout/Mainlayout";
import Link from "next/link";
import {
  MessageSquare,
  Bot,
  Tag,
  Trophy,
  FileText,
  Building,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Shield,
  Zap,
  BookOpen,
  MessageCircle,
  Bookmark,
} from "lucide-react";

const PRODUCTS = [
  {
    id: "qa",
    icon: MessageSquare,
    color: "from-blue-500 to-blue-700",
    badge: "Core Product",
    badgeColor: "bg-blue-100 text-blue-700",
    name: "Stack Q&A",
    tagline: "The world's most trusted developer Q&A",
    description:
      "Ask questions, get expert answers, and contribute your knowledge to millions of developers. Our voting system ensures the best answers rise to the top.",
    href: "/questions",
    cta: "Browse Questions",
    features: [
      "Ask technical questions and get community answers",
      "Upvote/downvote system for answer quality",
      "Tag-based categorisation for easy discovery",
      "Markdown and code block support",
      "Accept best answer to close questions",
    ],
    stats: { value: "23M+", label: "Questions answered" },
  },
  {
    id: "ai",
    icon: Bot,
    color: "from-purple-500 to-purple-700",
    badge: "Labs · Powered by Gemini",
    badgeColor: "bg-purple-100 text-purple-700",
    name: "AI Assist",
    tagline: "Instant AI-powered coding help",
    description:
      "Get immediate, intelligent answers to your coding questions using Google Gemini. Explain code, debug errors, and learn concepts without leaving the platform.",
    href: "/ai-assist",
    cta: "Try AI Assist",
    features: [
      "Powered by Google Gemini 2.0 Flash",
      "Syntax-highlighted code responses",
      "Full conversation history in session",
      "Suggested starter questions",
      "Instant responses — no waiting",
    ],
    stats: { value: "< 2s", label: "Average response time" },
  },
  {
    id: "challenges",
    icon: Trophy,
    color: "from-orange-500 to-orange-700",
    badge: "New",
    badgeColor: "bg-orange-100 text-orange-700",
    name: "Challenges",
    tagline: "Sharpen your skills. Earn points.",
    description:
      "Tackle hand-crafted coding challenges across multiple difficulty levels. Track your progress, earn points, and compete on the global leaderboard.",
    href: "/challenges",
    cta: "View Challenges",
    features: [
      "Easy, Medium, and Hard difficulty tiers",
      "Points system with leaderboard ranking",
      "Covers arrays, DP, graphs, system design",
      "Mark challenges as solved to track progress",
      "New challenges added regularly",
    ],
    stats: { value: "8+", label: "Challenges available" },
  },
  {
    id: "articles",
    icon: FileText,
    color: "from-green-500 to-green-700",
    badge: "Community",
    badgeColor: "bg-green-100 text-green-700",
    name: "Articles",
    tagline: "In-depth technical writing",
    description:
      "Read and discover long-form technical articles written by experienced developers. Dive deep into topics beyond what a single Q&A can cover.",
    href: "/articles",
    cta: "Read Articles",
    features: [
      "Curated technical articles by experts",
      "Category and tag-based filtering",
      "Featured and latest article sections",
      "Reading time estimates",
      "View and like counts per article",
    ],
    stats: { value: "100+", label: "Published articles" },
  },
  {
    id: "social",
    icon: Globe,
    color: "from-pink-500 to-pink-700",
    badge: "Community",
    badgeColor: "bg-pink-100 text-pink-700",
    name: "Social Space",
    tagline: "Connect with the developer community",
    description:
      "Share posts, like and comment on others' content, and build your network within the developer community — all in a focused, professional environment.",
    href: "/social",
    cta: "Open Social Space",
    features: [
      "Post updates, code snippets, and thoughts",
      "Like and comment on community posts",
      "Friend-based posting limits (no spam)",
      "Share questions and articles",
      "Real-time community feed",
    ],
    stats: { value: "Friends-gated", label: "Spam-free by design" },
  },
  {
    id: "saves",
    icon: Bookmark,
    color: "from-yellow-500 to-yellow-700",
    badge: "Personal",
    badgeColor: "bg-yellow-100 text-yellow-700",
    name: "Saves",
    tagline: "Your personal knowledge library",
    description:
      "Bookmark any question with one click and build your personal library of useful answers. Search, filter, and revisit your saved content anytime.",
    href: "/saves",
    cta: "View My Saves",
    features: [
      "One-click bookmark on any question",
      "Search within saved questions",
      "Organised by save date",
      "Remove saves individually",
      "Synced across sessions",
    ],
    stats: { value: "Instant", label: "One-click saving" },
  },
];

const PLATFORM_FEATURES = [
  { icon: Shield, title: "Safe & Moderated", desc: "Community-driven moderation keeps content accurate and respectful." },
  { icon: Zap, title: "Fast & Reliable", desc: "Optimised for speed with 99.9% uptime SLA across all products." },
  { icon: BookOpen, title: "Always Free", desc: "Core features are always free. No paywalls on knowledge." },
  { icon: MessageCircle, title: "Active Community", desc: "Millions of active users means answers come quickly." },
];

export default function ProductsPage() {
  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto space-y-16 py-6 px-2">

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Everything you need to <span className="text-orange-500">code better</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            CodeQuest is more than Q&A. It's a full ecosystem of tools built to help developers
            learn, connect, and grow at every stage of their career.
          </p>
        </section>

        {/* Platform features */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLATFORM_FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
              <f.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Products */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Products</h2>
          {PRODUCTS.map((p, i) => (
            <div
              key={p.id}
              className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Gradient panel */}
              <div className={`bg-gradient-to-br ${p.color} p-8 lg:w-64 flex flex-col items-center justify-center text-white text-center flex-shrink-0`}>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <p.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="text-white/80 text-sm mt-1">{p.tagline}</p>
                <div className="mt-4 bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{p.stats.value}</div>
                  <div className="text-xs text-white/70 mt-0.5">{p.stats.label}</div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{p.description}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {p.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Start using all products for free</h2>
          <p className="text-orange-100 mb-6 max-w-lg mx-auto">
            Create your free account and unlock the full CodeQuest ecosystem today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-2.5 rounded-lg font-semibold transition-colors">
              Sign Up Free
            </Link>
            <Link href="/questions" className="bg-orange-700 hover:bg-orange-800 text-white px-6 py-2.5 rounded-lg font-semibold border border-orange-400 transition-colors">
              Explore Questions
            </Link>
          </div>
        </section>

      </div>
    </Mainlayout>
  );
}