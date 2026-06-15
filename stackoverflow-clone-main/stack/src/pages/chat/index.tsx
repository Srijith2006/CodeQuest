import Mainlayout from "@/layout/Mainlayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface Conversation {
  userId: string;
  userName: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = "codequest_chats";

function loadChats(): Record<string, Conversation> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChats(chats: Record<string, Conversation>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export default function ChatPage() {
  const { user } = useAuth() as any;
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Record<string, Conversation>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    setChats(loadChats());
    axiosInstance.get("/user/getalluser").then((r) => {
      setAllUsers((r.data.data || []).filter((u: any) => u._id !== user._id));
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, chats]);

  if (!user) {
    return (
      <Mainlayout>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <MessageSquare className="w-12 h-12 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700">Log in to use Chat</h2>
          <button
            onClick={() => router.push("/auth")}
            className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700"
          >
            Log in
          </button>
        </div>
      </Mainlayout>
    );
  }

  const openChat = (u: any) => {
    const key = [user._id, u._id].sort().join("_");
    setChats((prev) => {
      if (prev[key]) return prev;
      const updated = {
        ...prev,
        [key]: { userId: u._id, userName: u.name, messages: [] },
      };
      saveChats(updated);
      return updated;
    });
    setActiveId(key);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeId) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user._id,
      senderName: user.name,
      text: input.trim(),
      timestamp: Date.now(),
    };
    setChats((prev) => {
      const updated = {
        ...prev,
        [activeId]: {
          ...prev[activeId],
          messages: [...(prev[activeId]?.messages || []), msg],
        },
      };
      saveChats(updated);
      return updated;
    });
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeConv = activeId ? chats[activeId] : null;
  const recentIds = Object.keys(chats);

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Mainlayout>
      <div className="flex h-[calc(100vh-70px)] border border-gray-200 rounded-xl overflow-hidden bg-white max-w-5xl mx-auto shadow-sm">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Recent chats */}
            {recentIds.length > 0 && !search && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase px-3 pt-3 pb-1">Recent</p>
                {recentIds.map((key) => {
                  const conv = chats[key];
                  const last = conv.messages[conv.messages.length - 1];
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveId(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-100 text-left transition-colors ${activeId === key ? "bg-blue-50 border-r-2 border-blue-600" : ""}`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">{conv.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{conv.userName}</p>
                        <p className="text-xs text-gray-400 truncate">{last?.text || "No messages yet"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* All users */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-3 pt-3 pb-1">
                {search ? "Results" : "All Users"}
              </p>
              {filteredUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => openChat(u)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-100 text-left transition-colors"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700 truncate">{u.name}</span>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2">No users found</p>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
              <Avatar className="w-9 h-9">
                <AvatarFallback>{activeConv.userName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{activeConv.userName}</p>
                <p className="text-xs text-green-500">Active</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
              {activeConv.messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  No messages yet. Say hello! 👋
                </div>
              )}
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === user._id;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarFallback className="text-xs">{msg.senderName[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"}`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-0.5 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Message ${activeConv.userName}…`}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-28"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3">
            <MessageSquare className="w-12 h-12 text-gray-200" />
            <p className="font-medium text-gray-500">Select a user to start chatting</p>
            <p className="text-sm">Your messages are stored locally on this device.</p>
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
