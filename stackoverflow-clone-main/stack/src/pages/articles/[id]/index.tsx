import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, Clock, Eye, ThumbsUp, Tag, Trash2 } from "lucide-react";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  React: "bg-blue-100 text-blue-700",
  TypeScript: "bg-indigo-100 text-indigo-700",
  "Node.js": "bg-green-100 text-green-700",
  Database: "bg-yellow-100 text-yellow-700",
  CSS: "bg-pink-100 text-pink-700",
  Security: "bg-red-100 text-red-700",
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth() as any;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const res = await axiosInstance.get(`/article/${id}`);
        setArticle(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      toast.info("Please login to like articles");
      router.push("/auth");
      return;
    }
    setLiking(true);
    try {
      const res = await axiosInstance.patch(`/article/like/${id}`);
      if (res.data.data) setArticle(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like");
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await axiosInstance.delete(`/article/${id}`);
      toast.success("Article deleted");
      router.push("/articles");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete article");
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      </Mainlayout>
    );
  }

  if (!article) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-10">Article not found.</div>
      </Mainlayout>
    );
  }

  const isOwner = user && user._id === article.userid;
  const hasLiked = user && article.likes.includes(user._id);

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-3xl">
        <Link href="/articles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>

        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || "bg-gray-100 text-gray-600"}`}>
            {article.category}
          </span>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-3 leading-snug">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-bold">
              {article.userposted?.[0] ?? "?"}
            </div>
            <span>{article.userposted ?? "Unknown"}</span>
          </div>
          <span>·</span>
          <span>{new Date(article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.readTime} min read</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {(article.tags || []).map((t: string) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" />{t}
            </span>
          ))}
        </div>

        <div className="prose prose-sm sm:prose-base max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed mb-8">
          {article.body}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
              hasLiked
                ? "bg-blue-50 text-blue-700 border-blue-300"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <ThumbsUp className="w-4 h-4" fill={hasLiked ? "currentColor" : "none"} />
            {article.likes.length} {article.likes.length === 1 ? "like" : "likes"}
          </button>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> {article.views.toLocaleString()} views
          </span>
        </div>
      </main>
    </Mainlayout>
  );
}