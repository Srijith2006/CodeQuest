import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, X, Plus, Filter, Tag, Trash2, Flame, MessageSquare } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import axiosInstance from "@/lib/axiosinstance";

// ── Custom Filter Modal ───────────────────────────────────────────────────────
function CustomFilterModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [noAnswers, setNoAnswers] = useState(false);
  const [noAccepted, setNoAccepted] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("custom_filters") || "[]");
    setSaved(stored);
  }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const saveFilter = () => {
    if (!name.trim()) return;
    const newFilter = {
      id: Date.now(),
      name: name.trim(),
      tags,
      noAnswers,
      noAccepted,
    };
    const updated = [...saved, newFilter];
    localStorage.setItem("custom_filters", JSON.stringify(updated));
    setSaved(updated);
    setName(""); setTags([]); setNoAnswers(false); setNoAccepted(false);
  };

  const deleteFilter = (id: number) => {
    const updated = saved.filter((f) => f.id !== id);
    localStorage.setItem("custom_filters", JSON.stringify(updated));
    setSaved(updated);
  };

  const applyFilter = (filter: any) => {
    const query: any = {};
    if (filter.tags.length > 0) query.tag = filter.tags[0];
    if (filter.noAnswers) query.noAnswers = "1";
    if (filter.noAccepted) query.noAccepted = "1";
    router.push({ pathname: "/questions", query });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Custom Filters</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Create new */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Create New Filter</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Filter Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React questions"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tags to include</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="e.g. javascript"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={addTag}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                  >
                    {t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noAnswers}
                  onChange={(e) => setNoAnswers(e.target.checked)}
                  className="rounded"
                />
                No answers only
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noAccepted}
                  onChange={(e) => setNoAccepted(e.target.checked)}
                  className="rounded"
                />
                No accepted answer
              </label>
            </div>

            <button
              onClick={saveFilter}
              disabled={!name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-medium"
            >
              Save Filter
            </button>
          </div>

          {/* Saved filters */}
          {saved.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Saved Filters</h3>
              {saved.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.name}</p>
                    {f.tags.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tags: {f.tags.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => applyFilter(f)}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => deleteFilter(f.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Watch Tag Modal ────────────────────────────────────────────────────────────
function WatchTagModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [watched, setWatched] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("watched_tags") || "[]");
    setWatched(stored);
  }, []);

  const addTag = () => {
    const t = input.trim().toLowerCase();
    if (!t) return;
    if (watched.includes(t)) return;
    const updated = [...watched, t];
    localStorage.setItem("watched_tags", JSON.stringify(updated));
    setWatched(updated);
    setInput("");
  };

  const removeTag = (t: string) => {
    const updated = watched.filter((w) => w !== t);
    localStorage.setItem("watched_tags", JSON.stringify(updated));
    setWatched(updated);
  };

  const browseTag = (t: string) => {
    router.push(`/questions?tag=${encodeURIComponent(t)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Watched Tags</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">
            Watch tags to curate your question list. Questions with watched tags
            are highlighted on the home page.
          </p>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="e.g. react, javascript"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={addTag}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {watched.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <Eye className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No tags watched yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Watching {watched.length} tag{watched.length !== 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {watched.map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-1 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm px-2 py-1 rounded-full"
                  >
                    <button
                      onClick={() => browseTag(t)}
                      className="hover:underline font-medium"
                    >
                      {t}
                    </button>
                    <button
                      onClick={() => removeTag(t)}
                      className="text-yellow-500 hover:text-red-500 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  router.push(
                    `/questions?tag=${encodeURIComponent(watched[0])}`
                  );
                  onClose();
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
              >
                Browse questions with watched tags →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main RightSideBar ─────────────────────────────────────────────────────────
const RightSideBar = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [watchedTags, setWatchedTags] = useState<string[]>([]);
  const [hotQuestions, setHotQuestions] = useState<any[]>([]);
  const [hotLoading, setHotLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("watched_tags") || "[]");
    setWatchedTags(stored);
  }, [showWatchModal]);

  // Fetch top 5 questions by vote count (upvotes - downvotes)
  useEffect(() => {
    const fetchHotQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const all = Array.isArray(res.data) ? res.data : res.data.data ?? [];

        const withScores = all.map((q: any) => ({
          ...q,
          voteCount:
            (Array.isArray(q.upvote) ? q.upvote.length : 0) -
            (Array.isArray(q.downvote) ? q.downvote.length : 0),
          answerCount: Array.isArray(q.answer) ? q.answer.length : (q.noofanswer ?? 0),
        }));

        const top5 = withScores
          .sort((a: any, b: any) => b.voteCount - a.voteCount)
          .slice(0, 5);

        setHotQuestions(top5);
      } catch (err) {
        console.error("Failed to fetch hot questions:", err);
      } finally {
        setHotLoading(false);
      }
    };
    fetchHotQuestions();
  }, []);

  return (
    <>
      {showFilterModal && (
        <CustomFilterModal onClose={() => setShowFilterModal(false)} />
      )}
      {showWatchModal && (
        <WatchTagModal onClose={() => setShowWatchModal(false)} />
      )}

      <aside className="w-72 lg:w-80 p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="space-y-4 lg:space-y-6">
          {/* Hot This Week — real top-voted questions */}
          <div className="bg-white border border-gray-200 rounded p-3 lg:p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Hot This Week
            </h3>
            {hotLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-400" />
              </div>
            ) : hotQuestions.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No questions yet. Be the first to ask!</p>
            ) : (
              <ul className="space-y-2.5 text-xs lg:text-sm">
                {hotQuestions.map((q) => (
                  <li key={q._id}>
                    <Link
                      href={`/questions/${q._id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline leading-snug line-clamp-2 block"
                    >
                      {q.questiontitle}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {q.voteCount} {q.voteCount === 1 ? "vote" : "votes"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {q.answerCount} {q.answerCount === 1 ? "answer" : "answers"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/questions"
              className="text-xs text-blue-600 hover:underline mt-3 inline-block"
            >
              View all questions →
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded p-3 lg:p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
              Quick Links
            </h3>
            <ul className="space-y-1.5 text-xs lg:text-sm">
              <li><Link href="/about" className="text-blue-600 hover:underline">About Code-Quest</Link></li>
              <li><Link href="/products" className="text-blue-600 hover:underline">Our Products</Link></li>
              <li><Link href="/for-teams" className="text-blue-600 hover:underline">For Teams & Enterprise</Link></li>
              <li><Link href="/challenges" className="text-blue-600 hover:underline">Coding Challenges</Link></li>
              <li><Link href="/articles" className="text-blue-600 hover:underline">Technical Articles</Link></li>
            </ul>
          </div>

          {/* Custom Filters — FIX: now opens modal */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
              Custom Filters
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterModal(true)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent text-xs lg:text-sm w-full justify-start gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              Create a custom filter
            </Button>
          </div>

          {/* Watched Tags — FIX: now opens modal and shows saved tags */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
              Watched Tags
            </h3>

            {watchedTags.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {watchedTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => router.push(`/questions?tag=${encodeURIComponent(t)}`)}
                      className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs px-2 py-0.5 rounded-full hover:bg-yellow-100 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWatchModal(true)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent text-xs w-full justify-start gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Manage watched tags
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 lg:py-8">
                <div className="text-center">
                  <Eye className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs lg:text-sm text-gray-500 mb-3">
                    Watch tags to curate your list of questions.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWatchModal(true)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent text-xs lg:text-sm gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Watch a tag
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default RightSideBar;