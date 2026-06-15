import Mainlayout from "@/layout/Mainlayout";
import { Trophy, Clock, Star, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

const CHALLENGES = [
  {
    id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays",
    points: 10, time: "30 min", solved: false,
    description: "Given an array of integers nums and a target, return indices of two numbers that add up to target.",
    tags: ["arrays", "hash-map"],
  },
  {
    id: 2, title: "Valid Parentheses", difficulty: "Easy", category: "Stacks",
    points: 10, time: "20 min", solved: false,
    description: "Given a string of brackets, determine if the input string is valid.",
    tags: ["stack", "strings"],
  },
  {
    id: 3, title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked Lists",
    points: 15, time: "25 min", solved: false,
    description: "Merge two sorted linked lists and return the merged list.",
    tags: ["linked-list", "recursion"],
  },
  {
    id: 4, title: "Maximum Subarray", difficulty: "Medium", category: "Dynamic Programming",
    points: 25, time: "45 min", solved: false,
    description: "Find the contiguous subarray which has the largest sum.",
    tags: ["dp", "arrays"],
  },
  {
    id: 5, title: "LRU Cache", difficulty: "Medium", category: "Design",
    points: 30, time: "60 min", solved: false,
    description: "Design a data structure that follows LRU cache constraints.",
    tags: ["design", "hash-map", "linked-list"],
  },
  {
    id: 6, title: "Word Search II", difficulty: "Hard", category: "Backtracking",
    points: 50, time: "90 min", solved: false,
    description: "Given a board and a list of words, find all words that exist on the board.",
    tags: ["trie", "backtracking"],
  },
  {
    id: 7, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Binary Search",
    points: 60, time: "90 min", solved: false,
    description: "Find the median of two sorted arrays in O(log(m+n)) time.",
    tags: ["binary-search", "arrays"],
  },
  {
    id: 8, title: "Regular Expression Matching", difficulty: "Hard", category: "Dynamic Programming",
    points: 70, time: "120 min", solved: false,
    description: "Implement regular expression matching with '.' and '*'.",
    tags: ["dp", "recursion", "strings"],
  },
];

const DIFF_COLORS: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export default function ChallengesPage() {
  const { user } = useAuth() as any;
  const [filter, setFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const displayed = CHALLENGES.filter(
    (c) => filter === "All" || c.difficulty === filter
  );

  const toggleSolve = (id: number) => {
    if (!user) return;
    setSolved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalPoints = [...solved].reduce((acc, id) => {
    return acc + (CHALLENGES.find((c) => c.id === id)?.points ?? 0);
  }, 0);

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-semibold">Coding Challenges</h1>
              <span className="inline-flex items-center bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                NEW
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Sharpen your skills. Earn points. Climb the leaderboard.
            </p>
          </div>
          {user && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl px-5 py-3 text-white text-center shadow">
              <p className="text-xs opacity-80">Points Earned</p>
              <p className="text-3xl font-bold">{totalPoints}</p>
              <p className="text-xs opacity-80">{solved.size} solved</p>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(["Easy", "Medium", "Hard"] as const).map((d) => {
            const total = CHALLENGES.filter((c) => c.difficulty === d).length;
            const done = CHALLENGES.filter(
              (c) => c.difficulty === d && solved.has(c.id)
            ).length;
            return (
              <div key={d} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${DIFF_COLORS[d]}`}>
                  {d}
                </span>
                <p className="text-lg font-bold text-gray-800">
                  {done}/{total}
                </p>
                <p className="text-xs text-gray-500">solved</p>
              </div>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["All", "Easy", "Medium", "Hard"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Challenges list */}
        <div className="space-y-3">
          {displayed.map((c) => {
            const isSolved = solved.has(c.id);
            const isLocked = !user;
            return (
              <div
                key={c.id}
                className={`border rounded-xl p-4 bg-white transition-all ${
                  isSolved
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{c.title}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLORS[c.difficulty]}`}>
                        {c.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{c.description}</p>
                    <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {c.time}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        <Star className="w-3 h-3 fill-yellow-400" /> {c.points} pts
                      </span>
                      {c.tags.map((t) => (
                        <span key={t} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isLocked ? (
                      <Link
                        href="/auth"
                        className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <Lock className="w-3 h-3" /> Login to solve
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleSolve(c.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
                          isSolved
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {isSolved ? (
                          <><CheckCircle className="w-3 h-3" /> Solved</>
                        ) : (
                          "Mark Solved"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </Mainlayout>
  );
}
