import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TagsPage() {
  const [tagMap, setTagMap] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const questions = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        const map: Record<string, number> = {};
        questions.forEach((q: any) => {
          (q.questiontags || []).forEach((tag: string) => {
            map[tag] = (map[tag] || 0) + 1;
          });
        });
        setTagMap(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const filtered = Object.entries(tagMap)
    .filter(([tag]) => tag.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-5xl">
        <h1 className="text-2xl font-semibold mb-1">Tags</h1>
        <p className="text-gray-500 text-sm mb-6">
          A tag is a keyword or label that categorises your question with other,
          similar questions.
        </p>

        <div className="relative max-w-sm mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by tag name"
            className="w-full border border-gray-300 rounded pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No tags found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/questions?tag=${encodeURIComponent(tag)}`}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
              >
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mb-2">
                  {tag}
                </span>
                <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                  Questions tagged with <strong>{tag}</strong>.
                </p>
                <p className="text-gray-700 text-xs font-medium">
                  {count} {count === 1 ? "question" : "questions"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}