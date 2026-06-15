import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, Globe, Clock, Chrome } from "lucide-react";

interface LoginEntry {
  _id: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  loginAt: string;
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-5 h-5 text-blue-500" />;
  if (device === "Tablet") return <Tablet className="w-5 h-5 text-purple-500" />;
  return <Monitor className="w-5 h-5 text-gray-500" />;
}

export default function LoginHistoryPage() {
  const { user } = useAuth() as any;
  const token = user?.token;
  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get("/user/login-history", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setHistory(res.data.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Mainlayout>
        <div className="text-center py-16 text-gray-500">
          Please <a href="/auth" className="text-blue-600 hover:underline">log in</a> to view login history.
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login History</h1>
          <p className="text-gray-500 text-sm mt-1">Recent login activity on your account (last 20 sessions)</p>
        </div>

        {/* Auth behavior info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-1">
          <p className="font-semibold flex items-center gap-2"><Chrome className="w-4 h-4" /> Authentication Rules</p>
          <ul className="list-disc list-inside text-blue-700 space-y-0.5">
            <li><strong>Google Chrome</strong> → Email OTP verification required</li>
            <li><strong>Microsoft Edge</strong> → Direct access, no extra step</li>
            <li><strong>Mobile devices</strong> → Login allowed only 10:00 AM – 1:00 PM IST</li>
          </ul>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No login history found.</div>
        ) : (
          <div className="space-y-3">
            {history.map((entry, idx) => (
              <div
                key={entry._id}
                className={`flex items-start gap-4 p-4 rounded-xl border ${
                  idx === 0 ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                }`}
              >
                <DeviceIcon device={entry.device} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-medium text-sm text-gray-900">{entry.browser}</span>
                      {idx === 0 && (
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                          Latest
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.loginAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> {entry.os}
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> {entry.device}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {entry.ipAddress}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}