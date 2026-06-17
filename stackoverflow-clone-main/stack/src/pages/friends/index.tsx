import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, UserCheck, UserX, Users, Clock } from "lucide-react";
import { toast } from "react-toastify";

interface UserItem {
  _id: string;
  name: string;
  about?: string;
  friends: string[];
  friendRequests: string[];
}

export default function FriendsPage() {
  const { user } = useAuth() as any;

  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [myData, setMyData] = useState<{
    friends: string[];
    friendRequests: string[];
  }>({ friends: [], friendRequests: [] });

  const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"discover" | "requests" | "friends">("discover");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [usersRes, meRes] = await Promise.all([
        axiosInstance.get("/user/getalluser"),
        user ? axiosInstance.get(`/friends/${user._id}`) : Promise.resolve(null),
      ]);
      setAllUsers(
        usersRes.data.data.filter((u: UserItem) => u._id !== user?._id)
      );
      if (meRes) setMyData(meRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FIX: No manual Authorization headers — axiosInstance interceptor
  // always reads the fresh token from localStorage automatically
  const sendRequest = async (targetId: string) => {
    setPendingSent((prev) => new Set([...prev, targetId]));
    setActionLoading(targetId);
    try {
      await axiosInstance.post(`/friends/request/${targetId}`, {});
      toast.success("Friend request sent!");
      await fetchData();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Error";
      if (msg === "Request already sent") {
        toast.info("Request already sent to this user");
      } else {
        toast.error(msg);
        setPendingSent((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const acceptRequest = async (requesterId: string) => {
    setActionLoading(requesterId);
    try {
      await axiosInstance.patch(`/friends/accept/${requesterId}`, {});
      toast.success("Friend request accepted!");
      await fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const declineRequest = async (requesterId: string) => {
    setActionLoading(requesterId);
    try {
      await axiosInstance.patch(`/friends/decline/${requesterId}`, {});
      toast.info("Request declined");
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm("Remove this friend?")) return;
    setActionLoading(friendId);
    try {
      await axiosInstance.delete(`/friends/remove/${friendId}`);
      toast.info("Friend removed");
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const friendList = allUsers.filter((u) => myData.friends.includes(u._id));
  const requesters = allUsers.filter((u) =>
    myData.friendRequests.includes(u._id)
  );
  const discover = allUsers.filter(
    (u) =>
      !myData.friends.includes(u._id) &&
      !myData.friendRequests.includes(u._id)
  );

  if (!user) {
    return (
      <Mainlayout>
        <div className="text-center py-16 text-gray-500">
          Please{" "}
          <a href="/auth" className="text-blue-600 hover:underline">
            log in
          </a>{" "}
          to manage friends.
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Friends</h1>
          <span className="text-sm text-gray-500">
            {myData.friends.length} friend
            {myData.friends.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
          <strong>Posting limits based on friends:</strong>
          <ul className="mt-1 space-y-0.5 list-disc list-inside text-blue-700">
            <li>0 friends → cannot post on Social Space</li>
            <li>1 friend → 1 post per day</li>
            <li>2 – 10 friends → 2 posts per day</li>
            <li>More than 10 friends → unlimited posts</li>
          </ul>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {(["discover", "requests", "friends"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {/* FIX: "requests" must always render as "Requests" regardless
                  of count — previously this fell through to "Discover" when
                  requesters.length was 0, causing a duplicate "Discover" tab */}
              {t === "requests"
                ? `Requests${requesters.length > 0 ? ` (${requesters.length})` : ""}`
                : t === "friends"
                ? `My Friends (${friendList.length})`
                : "Discover"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Discover */}
            {tab === "discover" &&
              (discover.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No new users to discover.
                </p>
              ) : (
                discover.map((u) => {
                  const isSent = pendingSent.has(u._id);
                  const isLoading = actionLoading === u._id;
                  return (
                    <UserCard key={u._id} user={u}>
                      {isSent ? (
                        <div className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 border border-green-300 px-3 py-1.5 rounded font-medium">
                          <Clock size={13} />
                          Request Sent
                        </div>
                      ) : (
                        <button
                          onClick={() => sendRequest(u._id)}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded font-medium transition-colors"
                        >
                          {isLoading ? (
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <UserPlus size={13} />
                          )}
                          Add Friend
                        </button>
                      )}
                    </UserCard>
                  );
                })
              ))}

            {/* Requests */}
            {tab === "requests" &&
              (requesters.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No pending friend requests.
                </p>
              ) : (
                requesters.map((u) => (
                  <UserCard key={u._id} user={u}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(u._id)}
                        disabled={actionLoading === u._id}
                        className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-1.5 rounded font-medium"
                      >
                        <UserCheck size={13} /> Accept
                      </button>
                      <button
                        onClick={() => declineRequest(u._id)}
                        disabled={actionLoading === u._id}
                        className="flex items-center gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded font-medium"
                      >
                        <UserX size={13} /> Decline
                      </button>
                    </div>
                  </UserCard>
                ))
              ))}

            {/* Friends */}
            {tab === "friends" &&
              (friendList.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  You have no friends yet. Start discovering!
                </p>
              ) : (
                friendList.map((u) => (
                  <UserCard key={u._id} user={u}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <UserCheck size={12} /> Friends
                      </span>
                      <button
                        onClick={() => removeFriend(u._id)}
                        disabled={actionLoading === u._id}
                        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 px-3 py-1.5 rounded font-medium transition-colors"
                      >
                        <Users size={13} /> Unfriend
                      </button>
                    </div>
                  </UserCard>
                ))
              ))}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}

function UserCard({
  user,
  children,
}: {
  user: UserItem;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
            {user.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm text-gray-800">{user.name}</p>
          {user.about && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">
              {user.about}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}