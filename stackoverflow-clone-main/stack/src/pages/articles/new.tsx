import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["React", "TypeScript", "Node.js", "Database", "CSS", "Security", "Other"];

export default function NewArticlePage() {
  const { user } = useAuth() as any;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.info("Please login to write an article");
      router.push("/auth");
    }
  }, [user, router]);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await axiosInstance.post("/article/create", {
        title,
        body,
        category,
        tags,
        userposted: user?.name || user?.username,
      });

      if (res.data.data) {
        toast.success("Article published!");
        router.push(`/articles/${res.data.data._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish article");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-3xl">
        <Link href="/articles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>

        <h1 className="text-2xl font-semibold mb-6">Write an Article</h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A clear, descriptive title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="comma, separated, tags"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">Separate tags with commas, e.g. react, hooks, performance</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              placeholder="Write your article here…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/articles"
              className="px-4 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded text-sm font-medium"
            >
              {submitting ? "Publishing…" : "Publish Article"}
            </button>
          </div>
        </div>
      </main>
    </Mainlayout>
  );
}