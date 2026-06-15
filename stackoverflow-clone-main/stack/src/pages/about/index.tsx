import Mainlayout from "@/layout/Mainlayout";
import Link from "next/link";
import {
  Users,
  Code2,
  Globe,
  Heart,
  Shield,
  Lightbulb,
  Target,
  Award,
  MessageSquare,
  BookOpen,
  Zap,
  Star,
} from "lucide-react";

const STATS = [
  { value: "50M+", label: "Developers worldwide", icon: Users },
  { value: "23M+", label: "Questions answered", icon: MessageSquare },
  { value: "180+", label: "Countries reached", icon: Globe },
  { value: "98%", label: "Problems solved", icon: Target },
];

const VALUES = [
  {
    icon: Heart,
    color: "text-red-500 bg-red-50",
    title: "Community First",
    desc: "Every decision we make puts developers and the community at the center. We exist because of our users, and we build for them.",
  },
  {
    icon: Shield,
    color: "text-blue-500 bg-blue-50",
    title: "Trust & Integrity",
    desc: "We maintain the highest standards of accuracy, fairness, and transparency in everything we do — from content moderation to data handling.",
  },
  {
    icon: Lightbulb,
    color: "text-yellow-500 bg-yellow-50",
    title: "Knowledge for All",
    desc: "Great answers should be freely available to every developer, anywhere in the world, regardless of background or experience level.",
  },
  {
    icon: Zap,
    color: "text-purple-500 bg-purple-50",
    title: "Continuous Innovation",
    desc: "We embrace new tools, AI-powered features, and developer workflows to constantly improve how knowledge is shared and discovered.",
  },
];

const TEAM = [
  { name: "Priya Sharma", role: "CEO & Co-Founder", initial: "P", color: "bg-orange-500" },
  { name: "Alex Chen", role: "CTO & Co-Founder", initial: "A", color: "bg-blue-600" },
  { name: "Rahul Menon", role: "Head of Engineering", initial: "R", color: "bg-green-600" },
  { name: "Sofia Martinez", role: "Head of Design", initial: "S", color: "bg-purple-600" },
  { name: "James Park", role: "Head of Community", initial: "J", color: "bg-red-500" },
  { name: "Fatima Al-Hassan", role: "Head of AI Research", initial: "F", color: "bg-indigo-600" },
];

const TIMELINE = [
  { year: "2019", title: "The Idea", desc: "CodeQuest was born from a simple frustration — great answers were hard to find and scattered across the web." },
  { year: "2020", title: "First Launch", desc: "We launched with 500 beta users. Within 3 months, the community grew to 10,000 developers." },
  { year: "2021", title: "1 Million Users", desc: "CodeQuest crossed 1 million registered developers and expanded support to 40 programming languages." },
  { year: "2022", title: "AI Integration", desc: "Launched AI Assist — our in-platform AI tool helping developers get instant answers for complex problems." },
  { year: "2023", title: "Global Expansion", desc: "Added multi-language support and opened regional community hubs across Asia, Europe, and Africa." },
  { year: "2024", title: "CodeQuest for Teams", desc: "Launched private team workspaces enabling companies to build internal knowledge bases." },
  { year: "2025", title: "50 Million Strong", desc: "Today, CodeQuest serves 50M+ developers worldwide with 23M+ questions answered and growing every day." },
];

export default function AboutPage() {
  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto space-y-16 py-6 px-2">

        {/* Hero */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full">
            <Code2 className="w-4 h-4" /> Built by developers, for developers
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            The home where <span className="text-orange-500">developers</span><br />
            help each other grow
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            CodeQuest is a community-powered Q&A platform where millions of developers
            ask questions, share knowledge, and solve problems together — every single day.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/questions" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Browse Questions
            </Link>
            <Link href="/signup" className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-2.5 rounded-lg font-medium transition-colors">
              Join the Community
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-5 text-center shadow-sm">
              <s.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Mission */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 lg:p-12 text-white text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
            To build the world's most trusted platform where developers of every skill level
            can find answers, share expertise, and grow together — making programming knowledge
            universally accessible and continuously improving.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">What We Stand For</h2>
          <p className="text-gray-500 text-center mb-8">The principles that guide every feature we build and every decision we make.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${v.color}`}>
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story / Timeline */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Our Story</h2>
          <p className="text-gray-500 text-center mb-8">From a small idea to a global developer community.</p>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 to-blue-300 hidden sm:block" />
            <div className="space-y-6">
              {TIMELINE.map((t, i) => (
                <div key={t.year} className="flex gap-5 items-start">
                  <div className="flex-shrink-0 w-14 text-right">
                    <span className="text-sm font-bold text-orange-600">{t.year}</span>
                  </div>
                  <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-4 h-4 rounded-full bg-orange-500 mt-1 z-10 ring-4 ring-orange-50" />
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-1">{t.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Meet the Team</h2>
          <p className="text-gray-500 text-center mb-8">The people behind CodeQuest who work every day to serve the developer community.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TEAM.map((m) => (
              <div key={m.name} className="bg-white border border-gray-200 rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-full ${m.color} text-white text-xl font-bold flex items-center justify-center mx-auto mb-3`}>
                  {m.initial}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{m.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Awards */}
        <section className="bg-gray-50 rounded-2xl p-8 text-center">
          <Award className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recognition & Awards</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            {[
              { award: "Best Dev Tool", year: "2024", org: "TechCrunch Disrupt" },
              { award: "#1 Q&A Platform", year: "2023", org: "Stack Report" },
              { award: "Community Choice", year: "2023", org: "Product Hunt" },
              { award: "Top 50 Startups", year: "2022", org: "Forbes" },
            ].map((a) => (
              <div key={a.award} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mx-auto mb-1" />
                <div className="font-semibold text-gray-800">{a.award}</div>
                <div className="text-xs text-gray-400 mt-0.5">{a.org} · {a.year}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to join the community?</h2>
          <p className="text-orange-100 mb-6">Millions of developers are already here. Ask your first question today.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-2.5 rounded-lg font-semibold transition-colors">
              Create Free Account
            </Link>
            <Link href="/questions" className="bg-orange-700 hover:bg-orange-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
              Explore Questions
            </Link>
          </div>
        </section>

      </div>
    </Mainlayout>
  );
}