import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { FileText, Clock, ThumbsUp, Eye, Tag, Sparkles, PenSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const CATEGORIES = ["All", "React", "TypeScript", "Node.js", "Database", "CSS", "Security", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  React: "bg-blue-100 text-blue-700",
  TypeScript: "bg-indigo-100 text-indigo-700",
  "Node.js": "bg-green-100 text-green-700",
  Database: "bg-yellow-100 text-yellow-700",
  CSS: "bg-pink-100 text-pink-700",
  Security: "bg-red-100 text-red-700",
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { user } = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axiosInstance.get("/article/getall");
        const data = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setArticles(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleWriteArticle = () => {
    if (!user) {
      toast.info("Please login to write an article");
      router.push("/auth");
      return;
    }
    router.push("/articles/new");
  };

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = category === "All" || a.category === category;
      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        a.title?.toLowerCase().includes(s) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(s));
      return matchCat && matchSearch;
    });
  }, [articles, category, search]);

  // Top 2 articles by engagement become "Featured" — only when there's
  // enough articles that splitting them out actually makes sense.
  const { featured, regular } = useMemo(() => {
    if (filtered.length < 3) return { featured: [], regular: filtered };
    const sorted = [...filtered].sort(
      (a, b) => (b.views + b.likes.length * 3) - (a.views + a.likes.length * 3)
    );
    const top = sorted.slice(0, 2);
    const topIds = new Set(top.map((a) => a._id));
    return { featured: top, regular: filtered.filter((a) => !topIds.has(a._id)) };
  }, [filtered]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-semibold">Articles</h1>
            </div>
            <p className="text-gray-500 text-sm">In-depth technical writing from the community</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-200">
              <Sparkles className="w-3 h-3" />
              AI-curated picks
            </div>
            <button
              onClick={handleWriteArticle}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
            >
              <PenSquare className="w-4 h-4" />
              Write Article
            </button>
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
                <Link
                  key={a._id}
                  href={`/articles/${a._id}`}
                  className="border border-blue-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category] || "bg-gray-100 text-gray-600"}`}>
                      {a.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.readTime} min read
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{a.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{a.body}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-bold">
                        {a.userposted?.[0] ?? "?"}
                      </div>
                      <span>{a.userposted ?? "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{a.likes.length}</span>
                    </div>
                  </div>
                </Link>
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
                <Link
                  key={a._id}
                  href={`/articles/${a._id}`}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow block"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category] || "bg-gray-100 text-gray-600"}`}>
                          {a.category}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {a.readTime} min read
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">{a.body}</p>
                      <div className="flex flex-wrap gap-1">
                        {(a.tags || []).map((t: string) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Tag className="w-2.5 h-2.5" />{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 text-xs text-gray-400 flex-shrink-0">
                      <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views.toLocaleString()}</div>
                      <div className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{a.likes.length}</div>
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-bold">
                      {a.userposted?.[0] ?? "?"}
                    </div>
                    <span>{a.userposted ?? "Unknown"}</span>
                    <span className="mx-1">·</span>
                    <span>{new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <FileText className="w-12 h-12 text-gray-200" />
            <p className="text-gray-500">No articles found.</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-blue-600 hover:underline text-sm">
              Clear filters
            </button>
          </div>
        )}
      </main>
    </Mainlayout>
  );
}