import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Plus, X, Lightbulb, AlertCircle } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";

const AskPage = () => {
  const router = useRouter();
  const { user } = useAuth() as any;
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; body?: string; tags?: string }>({});

  // Always read fresh user from localStorage to avoid stale context
  const getFreshUser = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.title.trim()) {
      errs.title = "Title is required";
    } else if (formData.title.trim().length < 15) {
      errs.title = "Title must be at least 15 characters";
    }
    if (!formData.body.trim()) {
      errs.body = "Problem details are required";
    } else if (formData.body.trim().length < 20) {
      errs.body = "Please provide at least 20 characters of detail";
    }
    if (formData.tags.length === 0) {
      errs.tags = "Add at least one tag";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error on change
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleAddTag = (e: any) => {
    e.preventDefault();
    const trimmedTag = newTag.trim().toLowerCase();
    if (!trimmedTag) return;
    if (formData.tags.length >= 5) {
      toast.info("Maximum 5 tags allowed");
      return;
    }
    if (formData.tags.includes(trimmedTag)) {
      toast.info("Tag already added");
      return;
    }
    setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
    setNewTag("");
    setErrors((prev) => ({ ...prev, tags: undefined }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(e);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Always get fresh user from localStorage
    const freshUser = getFreshUser();
    if (!freshUser || !freshUser.token) {
      toast.error("Please login to ask a question");
      router.push("/auth");
      return;
    }

    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/question/ask", {
        postquestiondata: {
          questiontitle: formData.title.trim(),
          questionbody: formData.body.trim(),
          questiontags: formData.tags,
          userposted: freshUser.name,
          userid: freshUser._id,
        },
      });

      if (res.data.data) {
        toast.success("Question posted successfully!");
        router.push("/");
      } else {
        toast.error("Failed to post question. Please try again.");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || "";

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/auth");
      } else if (typeof msg === "string" && msg.trim()) {
        // FIX: previously this only showed the backend's message if it
        // literally contained the word "limit". The actual subscription
        // limit message ("Your Free plan allows only 1 question per day...")
        // never contains that word, so it always fell through to a generic
        // "Something went wrong" error instead of the real reason.
        // Now any message the backend sends (limit reached, validation
        // error, etc.) is shown directly to the user.
        toast.error(msg);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-3xl mx-auto py-4">
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">
          Ask a public question
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Get help from millions of developers. Be specific and clear.
        </p>

        {/* Tips banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Writing a good question:</p>
            <ul className="space-y-0.5 text-blue-700 list-disc list-inside">
              <li>Summarise your problem in a one-line title</li>
              <li>Describe what you tried and what happened</li>
              <li>Add relevant tags so the right people find your question</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardContent className="space-y-6 pt-6">

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Title <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Be specific and imagine you're asking a question to another person.
                  Minimum 15 characters.
                </p>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. How to center a div in CSS using Flexbox?"
                  className={`w-full ${errors.title ? "border-red-400 focus:ring-red-400" : ""}`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.title ? (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.title}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className={`text-xs ml-auto ${formData.title.length < 15 ? "text-gray-400" : "text-green-600"}`}>
                    {formData.title.length}/15 min
                  </span>
                </div>
              </div>

              {/* Body */}
              <div>
                <Label htmlFor="body" className="text-base font-semibold">
                  What are the details of your problem? <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Introduce the problem and expand on what you put in the title.
                  Include any error messages, code snippets, or steps you've tried.
                </p>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Describe your problem in detail...&#10;&#10;What I tried:&#10;&#10;What happened:&#10;&#10;What I expected:"
                  className={`min-h-48 w-full font-mono text-sm ${errors.body ? "border-red-400" : ""}`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.body ? (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.body}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className={`text-xs ml-auto ${formData.body.length < 20 ? "text-gray-400" : "text-green-600"}`}>
                    {formData.body.length} characters
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-base font-semibold">
                  Tags <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Add up to 5 tags to describe what your question is about.
                  Press Enter or click + to add.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="e.g. javascript, react, nodejs"
                    className={`w-full ${errors.tags ? "border-red-400" : ""}`}
                    disabled={formData.tags.length >= 5}
                  />
                  <Button
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={formData.tags.length >= 5 || !newTag.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {errors.tags && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.tags}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2 min-h-[28px]">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 flex items-center gap-1 px-2 py-0.5"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.tags.length > 0 && (
                    <span className="text-xs text-gray-400 self-center">
                      {formData.tags.length}/5 tags
                    </span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting…
                    </span>
                  ) : (
                    "Post Your Question"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="text-gray-600"
                >
                  Cancel
                </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </Mainlayout>
  );
};

export default AskPage;