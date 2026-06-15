import Mainlayout from "@/layout/Mainlayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bookmark, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function SavesPage() {
  const { user } = useAuth() as any;
  const router = useRouter();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadSaves = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const res = await axiosInstance.get("/question/getallquestion");
      const allQ = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      // FIX: use the same key format as home/questions pages: saves_${user._id}
      const savedIds: string[] = JSON.parse(
        localStorage.getItem(`saves_${user._id}`) || "[]"
      );
      setSaved(allQ.filter((q: any) => savedIds.includes(q._id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaves();
  }, [user]);

  // Re-sync when window regains focus (user bookmarked from another page)
  useEffect(() => {
    const handleFocus = () => loadSaves();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  const handleRemove = (id: string) => {
    if (!user) return;
    const key = `saves_${user._id}`;
    const ids: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify(ids.filter((i) => i !== id)));
    setSaved((prev) => prev.filter((q) => q._id !== id));
    toast.success("Removed from saves");
  };

  const filtered = saved.filter((q) =>
    !search.trim() ||
    q.questiontitle?.toLowerCase().includes(search.toLowerCase()) ||
    (q.questiontags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (!user) {
    return (
      <Mainlayout>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <Bookmark className="w-12 h-12 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700">Log in to see your saves</h2>
          <p className="text-gray-500 text-sm">Questions you bookmark will appear here.</p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700"
          >
            Log in
          </button>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-5">
          <Bookmark className="w-5 h-5 text-yellow-500" fill="currentColor" />
          <h1 className="text-2xl font-semibold">Saves</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {saved.length}
          </span>
        </div>

        {/* Hint */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 text-sm text-yellow-800 mb-5 flex items-center gap-2">
          <Bookmark className="w-4 h-4 flex-shrink-0" />
          Click the bookmark icon <span className="font-semibold">🔖</span> on any question card (home or questions page) to save it here.
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <Bookmark className="w-14 h-14 text-gray-200" />
            <p className="text-gray-500 font-medium">No saved questions yet</p>
            <p className="text-sm text-gray-400">
              Browse questions and click the bookmark icon to save them here.
            </p>
            <Link href="/questions" className="text-blue-600 hover:underline text-sm mt-1">
              Browse questions →
            </Link>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved questions…"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-3">
              {filtered.map((q: any) => (
                <div
                  key={q._id}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/questions/${q._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-base block mb-1"
                      >
                        {q.questiontitle}
                      </Link>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {q.questionbody}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(q.questiontags || []).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{q.noofanswer ?? 0} answers</span>
                        <span>
                          {Array.isArray(q.upvote) ? q.upvote.length : 0} votes
                        </span>
                        <div className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-xs">
                              {q.userposted?.[0] ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{q.userposted}</span>
                        </div>
                        <span>
                          {q.askedon ? new Date(q.askedon).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(q._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      title="Remove from saves"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && search && (
                <p className="text-gray-400 text-sm text-center py-8">
                  No saved questions match "{search}"
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </Mainlayout>
  );
}
