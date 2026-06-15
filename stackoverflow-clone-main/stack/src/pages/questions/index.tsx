import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { Bookmark, Search, X, Filter } from "lucide-react";
import { toast } from "react-toastify";

export default function QuestionsPage() {
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortTab, setSortTab] = useState<"Newest" | "Active" | "Unanswered">("Newest");
  const [searchText, setSearchText] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { user } = useAuth() as any;
  const router = useRouter();

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

  // Support tag filter from URL query (?tag=react)
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
      toast.success("Saved to your list!");
    }
    localStorage.setItem(key, JSON.stringify(updated));
    setSavedIds(updated);
  };

  const filtered = useMemo(() => {
    let list = [...allQuestions];

    if (tagFilter.trim()) {
      list = list.filter((q) =>
        (q.questiontags || []).some((t: string) =>
          t.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
    }

    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter(
        (q) =>
          q.questiontitle?.toLowerCase().includes(s) ||
          q.questionbody?.toLowerCase().includes(s) ||
          (q.questiontags || []).some((t: string) => t.toLowerCase().includes(s))
      );
    }

    switch (sortTab) {
      case "Newest":
        list.sort((a, b) => new Date(b.askedon).getTime() - new Date(a.askedon).getTime());
        break;
      case "Active":
        list.sort((a, b) => (Array.isArray(b.answer) ? b.answer.length : (b.noofanswer ?? 0)) - (Array.isArray(a.answer) ? a.answer.length : (a.noofanswer ?? 0)));
        break;
      case "Unanswered":
        list = list.filter((q) => (Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) === 0);
        break;
    }

    return list;
  }, [allQuestions, sortTab, searchText, tagFilter]);

  const unansweredCount = allQuestions.filter((q) => (Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) === 0).length;

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold">All Questions</h1>
            <p className="text-gray-500 text-sm mt-0.5">{filtered.length} questions</p>
          </div>
          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
          >
            Ask Question
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search questions by title, body, or tag…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs + tag filter */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(["Newest", "Active", "Unanswered"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSortTab(tab)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                sortTab === tab
                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
              {tab === "Unanswered" && unansweredCount > 0 && (
                <span className="ml-1.5 bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unansweredCount}
                </span>
              )}
            </button>
          ))}

          {/* Tag filter input */}
          <div className="relative ml-auto">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="Filter by tag"
              className="border border-gray-300 rounded pl-7 pr-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:w-44 transition-all"
            />
            {tagFilter && (
              <button onClick={() => setTagFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Active filter chips */}
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
                "{searchText}"
                <button onClick={() => setSearchText("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => { setTagFilter(""); setSearchText(""); }}
              className="text-xs text-gray-500 hover:text-red-500 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Questions list */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg mb-2">No questions match your filters</p>
            <button
              onClick={() => { setTagFilter(""); setSearchText(""); setSortTab("Newest"); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map((q: any) => {
              const isSaved = savedIds.includes(q._id);
              const voteCount = Array.isArray(q.upvote)
                ? q.upvote.length - (Array.isArray(q.downvote) ? q.downvote.length : 0)
                : 0;

              return (
                <div key={q._id} className="py-4 hover:bg-gray-50 transition-colors px-2 rounded-sm">
                  <div className="flex gap-4">
                    {/* Stats column */}
                    <div className="flex-shrink-0 flex sm:flex-col items-stretch sm:items-end gap-3 sm:gap-2 sm:w-20 text-sm">
                      <div className="flex flex-col items-center justify-center w-16 py-1 rounded">
                        <div className="font-semibold text-gray-700 leading-none">{voteCount}</div>
                        <div className="text-xs text-gray-400 leading-tight mt-0.5">votes</div>
                      </div>
                      <div className={`flex flex-col items-center justify-center w-16 py-1 rounded ${(Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) > 0 ? "bg-green-100 text-green-700" : "text-gray-500"}`}>
                        <div className="font-semibold leading-none">{Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)}</div>
                        <div className="text-xs leading-tight mt-0.5">{(Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0)) === 1 ? "answer" : "answers"}</div>
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link
                          href={`/questions/${q._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-base leading-snug"
                        >
                          {q.questiontitle}
                        </Link>
                        <button
                          onClick={(e) => toggleSave(q._id, e)}
                          className={`flex-shrink-0 p-1 rounded transition-colors ${isSaved ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                          title={isSaved ? "Remove from saves" : "Save question"}
                        >
                          <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{q.questionbody}</p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {(q.questiontags || []).map((tag: string) => (
                            <button
                              key={tag}
                              onClick={() => setTagFilter(tag)}
                              className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-0.5 rounded transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
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