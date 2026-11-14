"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForReply(jobId: string): Promise<string> {
  const deadline = Date.now() + 90_000;

  while (Date.now() < deadline) {
    await delay(1_500);

    const response = await fetch(`/api/chatbot/${encodeURIComponent(jobId)}`, {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok && response.status !== 202) {
      throw new Error(data.error || "Failed to get chatbot status");
    }

    if (data.status === "completed" && typeof data.reply === "string") {
      return data.reply;
    }

    if (data.status === "failed") {
      throw new Error(data.error || "Chatbot job failed");
    }
  }

  throw new Error("Chatbot request timed out");
}

export default function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi 👋 I’m your shopping assistant. Ask me about products, orders, delivery, or returns!",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newUserMsg: Message = {
      id: Date.now(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok || typeof data.jobId !== "string") {
        throw new Error(data.error || "Failed to queue chatbot request");
      }

      const reply = await waitForReply(data.jobId);

      const botMsg: Message = {
        id: Date.now() + 1,
        text: reply || "Sorry, I didn't get that.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now() + 2,
        text: "Sorry, something went wrong. Please try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 shadow-lg bg-black text-white text-sm"
      >
        {isOpen ? "Close Chat" : "Chat💬"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-80 h-96 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-black text-white px-3 py-2 text-sm font-semibold flex justify-between items-center">
            <span>Shopping Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div
            ref={chatBodyRef}
            className="flex-1 p-2 space-y-2 overflow-y-auto bg-gray-50 text-xs"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-2 py-1 rounded-lg leading-snug ${
                  m.sender === "user"
                    ? "ml-auto bg-gray-200"
                    : "mr-auto bg-black text-white"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="max-w-[60%] mr-auto bg-black text-white px-2 py-1 rounded-lg text-xs">
                Typing…
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 flex items-center px-2 py-1 bg-white">
            <input
              className="flex-1 text-xs px-2 py-1 outline-none"
              placeholder="Ask about products, orders..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className="text-xs px-3 py-1 bg-black text-white rounded-md disabled:opacity-60"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
