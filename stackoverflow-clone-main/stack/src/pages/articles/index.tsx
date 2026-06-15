import Mainlayout from "@/layout/Mainlayout";
import { FileText, Clock, ThumbsUp, Eye, Tag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ARTICLES = [
  {
    id: 1, title: "Understanding React Server Components in Next.js 15",
    author: "Sarah Chen", authorInitial: "S", readTime: "8 min",
    date: "2025-05-28", views: 4821, likes: 312,
    category: "React", tags: ["react", "nextjs", "server-components"],
    excerpt: "React Server Components fundamentally change how we think about rendering. In this deep-dive, we explore how RSC work in Next.js 15 and when to use them over client components.",
    featured: true,
  },
  {
    id: 2, title: "The Complete Guide to TypeScript 5.x Decorators",
    author: "Mark Williams", authorInitial: "M", readTime: "12 min",
    date: "2025-05-25", views: 3204, likes: 198,
    category: "TypeScript", tags: ["typescript", "decorators", "oop"],
    excerpt: "Decorators are back and better than ever in TypeScript 5.x. Learn how to use them for dependency injection, logging, and validation in real-world projects.",
    featured: true,
  },
  {
    id: 3, title: "MongoDB Aggregation Pipelines: From Zero to Hero",
    author: "Priya Patel", authorInitial: "P", readTime: "10 min",
    date: "2025-05-20", views: 2891, likes: 167,
    category: "Database", tags: ["mongodb", "aggregation", "nosql"],
    excerpt: "Master the MongoDB aggregation pipeline with practical examples. Covers $match, $group, $lookup, $unwind and complex multi-stage pipelines with performance tips.",
    featured: false,
  },
  {
    id: 4, title: "Building a REST API with Node.js & Express from Scratch",
    author: "James Torres", authorInitial: "J", readTime: "15 min",
    date: "2025-05-18", views: 5632, likes: 421,
    category: "Node.js", tags: ["nodejs", "express", "rest-api"],
    excerpt: "A step-by-step tutorial for building a production-ready REST API using Express, MongoDB, JWT authentication, and proper error handling patterns.",
    featured: false,
  },
  {
    id: 5, title: "CSS Grid vs Flexbox: When to Use Which",
    author: "Lisa Kim", authorInitial: "L", readTime: "6 min",
    date: "2025-05-15", views: 7130, likes: 534,
    category: "CSS", tags: ["css", "grid", "flexbox", "layout"],
    excerpt: "Still confused about CSS Grid and Flexbox? This visual guide breaks down exactly when to reach for each one, with real-world examples from production UIs.",
    featured: false,
  },
  {
    id: 6, title: "Web Security 101: Preventing XSS, CSRF, and SQL Injection",
    author: "Alex Kumar", authorInitial: "A", readTime: "11 min",
    date: "2025-05-12", views: 3987, likes: 289,
    category: "Security", tags: ["security", "xss", "csrf", "sql-injection"],
    excerpt: "Every web developer needs to understand these three critical security vulnerabilities. Learn how attacks work and how to prevent them in your applications.",
    featured: false,
  },
];

const CATEGORIES = ["All", "React", "TypeScript", "Node.js", "Database", "CSS", "Security"];

const CATEGORY_COLORS: Record<string, string> = {
  React: "bg-blue-100 text-blue-700",
  TypeScript: "bg-indigo-100 text-indigo-700",
  "Node.js": "bg-green-100 text-green-700",
  Database: "bg-yellow-100 text-yellow-700",
  CSS: "bg-pink-100 text-pink-700",
  Security: "bg-red-100 text-red-700",
};

export default function ArticlesPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter((a) => {
    const matchCat = category === "All" || a.category === category;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const featured = filtered.filter((a) => a.featured);
  const regular = filtered.filter((a) => !a.featured);

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-semibold">Articles</h1>
            </div>
            <p className="text-gray-500 text-sm">In-depth technical writing from the community</p>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-200">
            <Sparkles className="w-3 h-3" />
            AI-curated picks
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles or tags…"
            className="w-full border border-gray-300 rounded-lg pl-4 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              ✨ Featured
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {featured.map((a) => (
                <div
                  key={a.id}
                  className="border border-blue-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category] || "bg-gray-100 text-gray-600"}`}>
                      {a.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.readTime} read
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{a.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{a.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-bold">
                        {a.authorInitial}
                      </div>
                      <span>{a.author}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{a.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular articles */}
        {regular.length > 0 && (
          <div>
            {featured.length > 0 && (
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Latest
              </h2>
            )}
            <div className="space-y-4">
              {regular.map((a) => (
                <div
                  key={a.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category] || "bg-gray-100 text-gray-600"}`}>
                          {a.category}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {a.readTime} read
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">{a.excerpt}</p>
                      <div className="flex flex-wrap gap-1">
                        {a.tags.map((t) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Tag className="w-2.5 h-2.5" />{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 text-xs text-gray-400 flex-shrink-0">
                      <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views.toLocaleString()}</div>
                      <div className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{a.likes}</div>
                      <span>{new Date(a.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-bold">
                      {a.authorInitial}
                    </div>
                    <span>{a.author}</span>
                    <span className="mx-1">·</span>
                    <span>{new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <FileText className="w-12 h-12 text-gray-200" />
            <p className="text-gray-500">No articles found for your search.</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-blue-600 hover:underline text-sm">
              Clear filters
            </button>
          </div>
        )}
      </main>
    </Mainlayout>
  );
}

