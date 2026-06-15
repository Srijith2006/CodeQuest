import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const UserProfile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // FIX: editForm initialized lazily from profileUser, not before data loads
  const [editForm, setEditForm] = useState({
    name: "",
    about: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setProfileUser(matcheduser || null);
        // FIX: initialize editForm AFTER user data is loaded
        if (matcheduser) {
          setEditForm({
            name: matcheduser.name || "",
            about: matcheduser.about || "",
            tags: matcheduser.tags || [],
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [id]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }
  if (!profileUser) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-4">No user found.</div>
      </Mainlayout>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updatedUser = {
          ...profileUser,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
        };
        setProfileUser(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;

  return (
    <Mainlayout>
      <div className="max-w-6xl">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl bg-orange-100 text-orange-700">
              {profileUser.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  {profileUser.name}
                </h1>
              </div>

              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={(open) => {
                  setIsEditing(open);
                  if (open) {
                    // Re-sync editForm when dialog opens
                    setEditForm({
                      name: profileUser.name || "",
                      about: profileUser.about || "",
                      tags: profileUser.tags || [],
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        <div>
                          <Label htmlFor="edit-name">Display Name</Label>
                          <Input
                            id="edit-name"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            placeholder="Your display name"
                          />
                        </div>
                      </div>

                      {/* About Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">About</h3>
                        <div>
                          <Label htmlFor="edit-about">About Me</Label>
                          <Textarea
                            id="edit-about"
                            value={editForm.about}
                            onChange={(e) =>
                              setEditForm({ ...editForm, about: e.target.value })
                            }
                            placeholder="Tell us about yourself..."
                            className="min-h-32"
                          />
                        </div>
                      </div>

                      {/* Tags/Skills Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Skills & Technologies</h3>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a skill or technology"
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                            />
                            <Button
                              type="button"
                              onClick={handleAddTag}
                              variant="outline"
                              size="sm"
                              className="bg-orange-600 text-white hover:bg-orange-700"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editForm.tags.map((tag: any) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-orange-100 text-orange-800 flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="bg-white text-gray-800 hover:text-gray-900"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSaveProfile}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since{" "}
                {profileUser.joinDate
                  ? new Date(profileUser.joinDate).toISOString().split("T")[0]
                  : "Unknown"}
              </div>
            </div>

            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-semibold">5</span>
                <span className="text-gray-600 ml-1">gold badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="font-semibold">23</span>
                <span className="text-gray-600 ml-1">silver badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
                <span className="font-semibold">45</span>
                <span className="text-gray-600 ml-1">bronze badges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {profileUser.about || (
                  <span className="text-gray-400 italic">No bio yet.</span>
                )}
              </p>
            </CardContent>
          </Card>

          {profileUser.tags && profileUser.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileUser.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Mainlayout>
  );
};

export default UserProfile;
