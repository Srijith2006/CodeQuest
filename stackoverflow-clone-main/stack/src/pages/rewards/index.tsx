import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Send, Star, Info } from "lucide-react";

interface LeaderboardUser { _id: string; name: string; points: number; }

export default function RewardsPage() {
  const { user } = useAuth() as any;
  const token = user?.token;

  const [myPoints, setMyPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [toUserId, setToUserId] = useState("");
  const [toUserName, setToUserName] = useState("");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"leaderboard" | "transfer">("leaderboard");

  useEffect(() => {
    fetchLeaderboard();
    if (user) fetchMyPoints();
    fetchAllUsers();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axiosInstance.get("/rewards/leaderboard");
      setLeaderboard(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchMyPoints = async () => {
    try {
      const res = await axiosInstance.get("/rewards/mypoints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPoints(res.data.data?.points || 0);
    } catch (e) { console.error(e); }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axiosInstance.get("/user/getalluser");
      setAllUsers(res.data.data);
    } catch (e) { console.error(e); }
  };

  const filteredUsers = allUsers.filter(
    u => u._id !== user?._id &&
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTransfer = async () => {
    if (!toUserId || !amount || Number(amount) <= 0) {
      toast.error("Select a user and enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/rewards/transfer",
        { toUserId, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setAmount("");
      setToUserId("");
      setToUserName("");
      setSearch("");
      fetchMyPoints();
      fetchLeaderboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" /> Reward Points
        </h1>

        {/* My points card */}
        {user && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <p className="text-blue-200 text-sm">Your Points</p>
            <p className="text-5xl font-bold mt-1">{myPoints}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-blue-200">
              <span>+5 pts for each answer</span>
              <span>+5 pts when answer gets 5 upvotes</span>
              <span>-5 pts if answer deleted</span>
            </div>
          </div>
        )}

        {/* How points work */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 space-y-1">
          <div className="flex items-center gap-2 font-semibold"><Info className="w-4 h-4" /> How it works</div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-700">
            <li>Post an answer → earn <strong>5 points</strong></li>
            <li>Answer gets 5 upvotes → earn <strong>bonus 5 points</strong></li>
            <li>Answer deleted or downvoted → points deducted</li>
            <li>Transfer requires <strong>more than 10 points</strong></li>
          </ul>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-gray-200">
          {(["leaderboard", "transfer"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "leaderboard" ? "🏆 Leaderboard" : "↗ Transfer Points"}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {tab === "leaderboard" && (
          <div className="space-y-2">
            {leaderboard.map((u, i) => (
              <div
                key={u._id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  u._id === user?._id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                }`}
              >
                <span className={`text-sm font-bold w-6 text-center ${
                  i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-400"
                }`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{u.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium">{u.name} {u._id === user?._id && "(You)"}</span>
                <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                  <Star className="w-4 h-4" />
                  {u.points}
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">No points earned yet.</p>
            )}
          </div>
        )}

        {/* Transfer */}
        {tab === "transfer" && (
          <div className="space-y-4">
            {!user ? (
              <p className="text-gray-500 text-sm text-center py-6">
                Please <a href="/auth" className="text-blue-600 hover:underline">log in</a> to transfer points.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search user to send to</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Type a name..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setToUserId(""); setToUserName(""); }}
                  />
                  {search && !toUserId && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="text-sm text-gray-400 p-3">No users found</p>
                      ) : filteredUsers.map(u => (
                        <button
                          key={u._id}
                          onClick={() => { setToUserId(u._id); setToUserName(u.name); setSearch(u.name); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                        >
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-xs">{u.name?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{u.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {toUserName && toUserId && (
                    <p className="text-xs text-green-600">✓ Selected: {toUserName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Points to transfer</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">Your balance: {myPoints} pts (need more than 10 to transfer)</p>
                </div>

                <button
                  onClick={handleTransfer}
                  disabled={loading || !toUserId}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Transferring…" : "Transfer Points"}
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}