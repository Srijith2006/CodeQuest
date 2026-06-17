import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  ImagePlus,
  Video,
  X,
  Send,
  Trash2,
} from "lucide-react";

interface Comment {
  _id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}
interface Post {
  _id: string;
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userId: string;
  userName: string;
  likes: string[];
  comments: Comment[];
  shares: number;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SocialSpace() {
  const { user } = useAuth() as any;

  // ── fix: never read user on first SSR render ──────────────────────────────
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const token = user?.token;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/post/getallposts");
      setPosts(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith("video") ? "video" : "image";
    const reader = new FileReader();
    reader.onload = () =>
      setMediaFile({ url: reader.result as string, type });
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!mediaFile) {
      setPostError("Please attach an image or video.");
      return;
    }
    setPosting(true);
    setPostError("");
    try {
      const res = await axiosInstance.post(
        "/post/create",
        { caption, mediaUrl: mediaFile.url, mediaType: mediaFile.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts([res.data.data, ...posts]);
      setCaption("");
      setMediaFile(null);
    } catch (err: any) {
      setPostError(err.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.patch(
        `/post/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text || !user) return;
    try {
      const res = await axiosInstance.post(
        `/post/comment/${postId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await axiosInstance.patch(`/post/share/${postId}`);
      await navigator.clipboard.writeText(
        `${window.location.origin}/social?post=${postId}`
      );
      setPosts(
        posts.map((p) =>
          p._id === postId ? { ...p, shares: p.shares + 1 } : p
        )
      );
      alert("Post link copied to clipboard!");
    } catch (e) {
      console.error(e);
    }
  };

  // ── Delete own post ──────────────────────────────────────────────────────
  // Backend already enforces ownership (returns 403 if not the post author),
  // so this is safe even if someone tampers with the button visibility.
  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(postId);
    try {
      await axiosInstance.delete(`/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  // Don't render user-specific content until client is mounted (fixes hydration)
  const isLoggedIn = mounted && !!user;

  return (
    <Mainlayout>
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-semibold">Social Space</h1>

        {/* Create Post */}
        {isLoggedIn ? (
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback>
                  {user.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <textarea
                className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={2}
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {mediaFile && (
              <div className="relative w-full rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                <button
                  onClick={() => setMediaFile(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                >
                  <X size={14} />
                </button>
                {mediaFile.type === "image" ? (
                  <img
                    src={mediaFile.url}
                    alt="preview"
                    className="max-h-60 object-contain mx-auto"
                  />
                ) : (
                  <video
                    src={mediaFile.url}
                    controls
                    className="max-h-60 w-full"
                  />
                )}
              </div>
            )}

            {postError && (
              <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">
                {postError}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (fileRef.current) {
                      fileRef.current.accept = "image/*";
                      fileRef.current.click();
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 border border-gray-200 rounded px-2 py-1"
                >
                  <ImagePlus size={14} /> Photo
                </button>
                <button
                  onClick={() => {
                    if (fileRef.current) {
                      fileRef.current.accept = "video/*";
                      fileRef.current.click();
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 border border-gray-200 rounded px-2 py-1"
                >
                  <Video size={14} /> Video
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={handleFilePick}
                />
              </div>
              <button
                onClick={handlePost}
                disabled={posting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-4 py-1.5 rounded font-medium"
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        ) : (
          mounted && (
            <p className="text-sm text-gray-500 border border-gray-200 rounded-lg p-4 text-center">
              <a href="/auth" className="text-blue-600 hover:underline">
                Log in
              </a>{" "}
              to post, like, or comment.
            </p>
          )
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            No posts yet. Be the first!
          </p>
        ) : (
          posts.map((post) => {
            const isOwner = isLoggedIn && post.userId === user._id;
            return (
              <div
                key={post._id}
                className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
              >
                {/* header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback>
                      {post.userName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{post.userName}</p>
                    <p className="text-xs text-gray-400">
                      {timeAgo(post.createdAt)}
                    </p>
                  </div>

                  {/* Delete — only visible to the post's own author */}
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(post._id)}
                      disabled={deletingId === post._id}
                      title="Delete post"
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors p-1"
                    >
                      {deletingId === post._id ? (
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin inline-block" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>

                {/* media */}
                {post.mediaType === "image" ? (
                  <img
                    src={post.mediaUrl}
                    alt="post"
                    className="w-full object-contain max-h-96 bg-gray-50"
                  />
                ) : (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full max-h-96 bg-black"
                  />
                )}

                {/* caption */}
                {post.caption && (
                  <p className="px-4 pt-3 text-sm text-gray-800">
                    {post.caption}
                  </p>
                )}

                {/* action bar */}
                <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                      isLoggedIn && post.likes.includes(user._id)
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={
                        isLoggedIn && post.likes.includes(user._id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {post.likes.length}
                  </button>

                  <button
                    onClick={() =>
                      setOpenComments((prev) => ({
                        ...prev,
                        [post._id]: !prev[post._id],
                      }))
                    }
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle size={16} />
                    {post.comments.length}
                  </button>

                  <button
                    onClick={() => handleShare(post._id)}
                    className="flex items-center gap-1 hover:text-green-500 transition-colors"
                  >
                    <Share2 size={16} />
                    {post.shares}
                  </button>
                </div>

                {/* comments panel */}
                {openComments[post._id] && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                    <div className="max-h-40 overflow-y-auto space-y-2 pt-3">
                      {post.comments.length === 0 && (
                        <p className="text-xs text-gray-400">No comments yet.</p>
                      )}
                      {post.comments.map((c) => (
                        <div key={c._id} className="flex gap-2 text-sm">
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {c.userName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium mr-1">{c.userName}</span>
                            <span className="text-gray-700">{c.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {isLoggedIn && (
                      <div className="flex gap-2 pt-1">
                        <input
                          className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="Add a comment…"
                          value={commentText[post._id] || ""}
                          onChange={(e) =>
                            setCommentText((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleComment(post._id);
                          }}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </Mainlayout>
  );
}