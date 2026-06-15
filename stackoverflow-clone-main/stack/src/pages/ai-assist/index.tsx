import Mainlayout from "@/layout/Mainlayout";
import { Bot, Send, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "model";
  content: string;
}

// Updated with supported models for the v1beta endpoint
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-pro",
];

async function callGemini(
  history: Message[],
  newText: string
): Promise<string> {
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("NO_KEY");
  }

  const contents = [
    ...history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: newText }] },
  ];

  const body = {
    system_instruction: {
      parts: [
        {
          text: "You are Code-Quest AI Assist — an expert programming assistant embedded in a developer Q&A platform. Help developers debug code, explain concepts, review snippets, and answer technical questions clearly and concisely. Use triple backticks for code blocks with the language name.",
        },
      ],
    },
    contents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  };

  let lastError = "";

  // Try each model in order — if one is quota-exceeded, move to next
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error?.message || "";
        // If quota exceeded, try next model
        if (msg.toLowerCase().includes("quota") || res.status === 429) {
          lastError = msg;
          continue;
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }

      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response received."
      );
    } catch (err: any) {
      if (
        err.message?.toLowerCase().includes("quota") ||
        err.message?.toLowerCase().includes("429")
      ) {
        lastError = err.message;
        continue; // try next model
      }
      throw err;
    }
  }

  // All models quota-exceeded
  throw new Error("QUOTA_ALL:" + lastError);
}

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0]?.trim();
      const code = lines.slice(1).join("\n").trim();
      return (
        <pre
          key={i}
          className="bg-gray-900 text-green-300 rounded-lg p-4 overflow-x-auto text-xs my-2 whitespace-pre-wrap"
        >
          {lang && (
            <div className="text-gray-500 text-xs mb-1 font-mono">{lang}</div>
          )}
          <code>{code || lines.join("\n").trim()}</code>
        </pre>
      );
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {part}
      </span>
    );
  });
}

function ErrorBanner({ type }: { type: "no_key" | "quota" | null }) {
  if (!type) return null;
  return (
    <div className="mx-4 mt-3 bg-amber-50 border border-amber-300 rounded-xl p-3 flex gap-2 text-sm text-amber-800">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
      <div>
        {type === "no_key" ? (
          <>
            <strong>API key not set.</strong> Open{" "}
            <code className="bg-amber-100 px-1 rounded">stack/.env.local</code>{" "}
            and set{" "}
            <code className="bg-amber-100 px-1 rounded">
              NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
            </code>
            , then restart <code className="bg-amber-100 px-1 rounded">npm run dev</code>.
          </>
        ) : (
          <>
            <strong>Quota exceeded on all models.</strong> Your API key has hit
            the free tier limit. Wait a minute and try again, or get a fresh key
            from{" "}
            <a
              href="[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
            </a>
            .
          </>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Explain async/await in JavaScript",
  "How do I fix a CORS error in Express?",
  "What is the difference between SQL and NoSQL?",
  "Explain React useEffect with an example",
];

export default function AIAssistPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<"no_key" | "quota" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setErrorBanner(null);
    const userMsg: Message = { role: "user", content: userText };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const reply = await callGemini(messages, userText);
      setMessages([...updatedHistory, { role: "model", content: reply }]);
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg === "NO_KEY") {
        setErrorBanner("no_key");
      } else if (msg.startsWith("QUOTA_ALL")) {
        setErrorBanner("quota");
      }
      setMessages([
        ...updatedHistory,
        {
          role: "model",
          content:
            msg === "NO_KEY"
              ? "⚠️ Gemini API key is missing. See the banner above."
              : msg.startsWith("QUOTA_ALL")
              ? "⚠️ All Gemini models are quota-exceeded for this key. See the banner above for how to fix this."
              : `⚠️ ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Mainlayout>
      <div className="flex flex-col h-[calc(100vh-70px)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">AI Assist</h1>
              <p className="text-xs text-gray-500">Powered by Google Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Labs
            </span>
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setErrorBanner(null); }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        <ErrorBanner type={errorBanner} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-lg">
                  Code-Quest AI Assist
                </p>
                <p className="text-sm mt-1 max-w-sm">
                  Ask me anything about programming, debugging, or code reviews.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                }`}
              >
                {msg.role === "user" ? "U" : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"
                }`}
              >
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a programming question… (Enter to send)"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-32"
              style={{ minHeight: "42px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            AI can make mistakes. Always verify critical code.
          </p>
        </div>
      </div>
    </Mainlayout>
  );
}