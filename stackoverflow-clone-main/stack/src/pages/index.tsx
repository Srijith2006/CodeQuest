import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { Bookmark, Filter, X } from "lucide-react";
import { toast } from "react-toastify";

export default function Home() {
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortTab, setSortTab] = useState<"Newest" | "Active" | "Bountied" | "Unanswered">("Newest");
  const [searchText, setSearchText] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [showFilterBox, setShowFilterBox] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { user } = useAuth() as any;
  const router = useRouter();

  // Load saved IDs from localStorage
  useEffect(() => {
    if (user) {
      const ids = JSON.parse(localStorage.getItem(`saves_${user._id}`) || "[]");
      setSavedIds(ids);
    }
  }, [user]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const data = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setAllQuestions(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Apply tag filter from URL query (from watched tags / tag page)
  useEffect(() => {
    if (router.query.tag) setTagFilter(router.query.tag as string);
  }, [router.query.tag]);

  const toggleSave = (questionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.info("Login to save questions"); return; }
    const key = `saves_${user._id}`;
    const current: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    let updated: string[];
    if (current.includes(questionId)) {
      updated = current.filter((id) => id !== questionId);
      toast.info("Removed from saves");
    } else {
      updated = [...current, questionId];
      toast.success("Saved!");
    }
    localStorage.setItem(key, JSON.stringify(updated));
    setSavedIds(updated);
  };

  const filtered = useMemo(() => {
    let list = [...allQuestions];

    // Tag filter
    if (tagFilter) {
      list = list.filter((q) =>
        (q.questiontags || []).some((t: string) =>
          t.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
    }

    // Search filter
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter(
        (q) =>
          q.questiontitle?.toLowerCase().includes(s) ||
          q.questionbody?.toLowerCase().includes(s) ||
          (q.questiontags || []).some((t: string) => t.toLowerCase().includes(s))
      );
    }

    // Sort
    switch (sortTab) {
      case "Newest":
        list.sort((a, b) => new Date(b.askedon).getTime() - new Date(a.askedon).getTime());
        break;
      case "Active":
        list.sort((a, b) => (Array.isArray(b.answer) ? b.answer.length : (b.noofanswer ?? 0)) - (Array.isArray(a.answer) ? a.answer.length : (a.noofanswer ?? 0)));
        break;
      case "Bountied":
        list.sort(
          (a, b) =>
            (Array.isArray(b.upvote) ? b.upvote.length : 0) -
            (Array.isArray(a.upvote) ? a.upvote.length : 0)
        );
        break;
      case "Unanswered":
        list = list.filter((q) => (Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) === 0);
        break;
    }
    return list;
  }, [allQuestions, sortTab, searchText, tagFilter]);

  const TABS = ["Newest", "Active", "Bountied", "Unanswered"] as const;

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
      <main className="min-w-0 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold">Top Questions</h1>
          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
          >
            Ask Question
          </button>
        </div>

        {/* Stats + Filter row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
          <span className="text-gray-600 text-sm">{filtered.length} questions</span>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSortTab(tab)}
                className={`px-3 py-1 rounded text-xs sm:text-sm transition-colors ${
                  sortTab === tab
                    ? "bg-orange-100 text-orange-700 border border-orange-300 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
                {tab === "Bountied" && (
                  <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {allQuestions.filter(q => (Array.isArray(q.upvote) ? q.upvote.length : 0) > 0).length}
                  </span>
                )}
                {tab === "Unanswered" && (
                  <span className="ml-1 bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {allQuestions.filter(q => (Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) === 0).length}
                  </span>
                )}
              </button>
            ))}

            {/* Filter button */}
            <button
              onClick={() => setShowFilterBox((v) => !v)}
              className={`px-3 py-1 border rounded text-xs sm:text-sm flex items-center gap-1 transition-colors ${
                showFilterBox || tagFilter || searchText
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-3 h-3" />
              Filter
              {(tagFilter || searchText) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilterBox && (
          <div className="border border-blue-200 rounded-lg bg-blue-50 p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-blue-800">Filter Questions</h3>
              <button
                onClick={() => { setSearchText(""); setTagFilter(""); setShowFilterBox(false); }}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Search in titles & body</label>
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="e.g. react hooks"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Filter by tag</label>
                <input
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  placeholder="e.g. javascript"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active filters display */}
        {(tagFilter || searchText) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tagFilter && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                tag: {tagFilter}
                <button onClick={() => setTagFilter("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchText && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                search: "{searchText}"
                <button onClick={() => setSearchText("")}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Questions list */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <p className="text-lg mb-2">No questions found</p>
            <p className="text-sm">
              {tagFilter || searchText ? (
                <button onClick={() => { setTagFilter(""); setSearchText(""); }} className="text-blue-600 hover:underline">
                  Clear filters
                </button>
              ) : (
                <button onClick={() => router.push("/ask")} className="text-blue-600 hover:underline">
                  Be the first to ask!
                </button>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map((q: any) => {
              const isSaved = savedIds.includes(q._id);
              const voteCount = Array.isArray(q.upvote)
                ? q.upvote.length - (Array.isArray(q.downvote) ? q.downvote.length : 0)
                : 0;
              return (
                <div key={q._id} className="border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors px-2 rounded group">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Stats */}
                    <div className="flex sm:flex-col items-stretch sm:items-end text-sm text-gray-600 sm:w-20 gap-3 sm:gap-2 flex-shrink-0">
                      <div className="flex flex-col items-center justify-center w-16 py-1 rounded">
                        <span className="font-medium leading-none">{voteCount}</span>
                        <span className="text-xs text-gray-500 leading-tight mt-0.5">votes</span>
                      </div>
                      <div className={`flex flex-col items-center justify-center w-16 py-1 rounded ${(Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) > 0 ? "bg-green-100 text-green-700" : "text-gray-500"}`}>
                        <span className="font-medium leading-none">{Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)}</span>
                        <span className="text-xs leading-tight mt-0.5">{(Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) === 1 ? "ans" : "ans"}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/questions/${q._id}`}
                          className="text-blue-600 hover:text-blue-800 text-base font-medium mb-1 block leading-snug"
                        >
                          {q.questiontitle}
                        </Link>
                        {/* Bookmark button */}
                        <button
                          onClick={(e) => toggleSave(q._id, e)}
                          className={`flex-shrink-0 p-1 rounded transition-colors ${isSaved ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                          title={isSaved ? "Remove from saves" : "Save question"}
                        >
                          <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {q.questionbody}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        {/* Tags — clickable */}
                        <div className="flex flex-wrap gap-1">
                          {(q.questiontags || []).map((tag: string) => (
                            <button
                              key={tag}
                              onClick={() => { setTagFilter(tag); setShowFilterBox(false); }}
                              className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* Author */}
                        <div className="flex items-center text-xs text-gray-500 flex-shrink-0 gap-1">
                          <Link href={`/users/${q.userid}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="text-xs">{q.userposted?.[0] ?? "?"}</AvatarFallback>
                            </Avatar>
                            <span className="text-blue-600 hover:text-blue-800">{q.userposted}</span>
                          </Link>
                          <span>asked {q.askedon ? new Date(q.askedon).toLocaleDateString() : "recently"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}