// AIChatScreen.js (App Router ke liye final updated code)
"use client";

import React, { useState, useEffect, useRef } from "react";

const themeColors = {
  darkGreen: "#386641",
  lightGreen: "#d4edc9",
  cardBackground: "#ffffff",
  textDark: "#1a1a1a",
  textLight: "#6b7280",
};

/**
 * Server-Side API route ko call karega aur JSON response laayega.
 */
async function sendMessageToAssistant(userMessage) {
  // Client-side se server-side API route ko call karen
  // URL /api/chat App Router structure ke mutabiq hai (app/api/chat/route.js)
  const response = await fetch("/api/chat", { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // NOTE: Yahaan aapko user token bhi bhejna chahiye agar aap Firebase Auth use kar rahe hain
     body: JSON.stringify({ query: userMessage }),
  });

  // Agar 404 ya 500 error aaya toh exception throw hogi
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

const AIChatScreen = () => {
  const [messages, setMessages] = useState([
    // Ab har message mein attachments aur source fields honge
    { sender: "ai", text: "Hi! How can I help you?", attachments: [], source: "AI" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    const userMessage = { sender: "user", text: userMessageText };

    // User message turant add karen
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // ✅ Server-side API call
      const serverResponse = await sendMessageToAssistant(userMessageText);
      
      // Server se aaya hua naya format use karen
      const botResponse = {
        sender: "ai",
        text: serverResponse.message,
        attachments: serverResponse.attachments || [], 
        source: serverResponse.source || "Unknown Source"
      };
      
      setMessages((prev) => [...prev, botResponse]);
      
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorResponse = {
        sender: "ai",
        text: `Error: Could not connect to the server or API. Please check your keys or server logs. Message: ${error.message}`,
        attachments: [],
        source: "Connection Error"
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Message content, attachments, aur source ko render karta hai.
   * @param {object} msg - The message object
   */
  const renderMessageContent = (msg) => {
    const parts = [];
    
    // 1. Text Content
    parts.push(<p key="text" className="mb-1">{msg.text}</p>);

    // 2. Attachments (Images/Videos from Signed URLs)
    if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((attachment, index) => {
            if (attachment.type === "image") {
                parts.push(
                    <img
                        key={`img-${index}`}
                        src={attachment.url}
                        alt={attachment.fileName || "Attachment Image"}
                        className="rounded-lg max-w-xs md:max-w-md mb-2 mt-2 border border-gray-200"
                    />
                );
            } else if (attachment.type === "video") {
                parts.push(
                    <video
                        key={`vid-${index}`}
                        controls
                        className="rounded-lg max-w-xs md:max-w-md mb-2 mt-2 border border-gray-200"
                        style={{ maxHeight: "300px" }}
                    >
                        <source src={attachment.url} type="video/mp4" /> 
                        Your browser does not support the video tag.
                    </video>
                );
            }
        });
    }

    // 3. Source (Jawab kahan se aaya hai - Official ya External)
    if (msg.source) {
        let sourceColor = themeColors.textLight;
        if (msg.source.includes("Official")) {
            sourceColor = msg.sender === "user" ? themeColors.lightGreen : themeColors.darkGreen;
        } else if (msg.source.includes("External")) {
            sourceColor = "#ff7f50"; // Coral/Orange for external warning
        }
        
        parts.push(
            <p key="source" className="text-xs mt-2 font-medium border-t pt-1" 
               style={{ borderColor: themeColors.lightGreen, color: sourceColor }}>
                Source: {msg.source}
            </p>
        );
    }

    return parts;
  };

  return (
    <div
      className="flex flex-col min-h-screen p-4 md:p-8 font-sans"
      style={{ background: "linear-gradient(135deg, #34916aff, #d4edc9)" }}
    >
      <header className="flex items-center justify-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "white" }}>
          AI Chat 🚀
        </h1>
      </header>

      <div
        className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl shadow-lg"
        style={{
          backgroundColor: themeColors.cardBackground,
          border: `1px solid ${themeColors.darkGreen}`,
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className="w-fit max-w-full p-4 rounded-3xl shadow-md whitespace-pre-wrap break-words"
              style={{
                background:
                  msg.sender === "user"
                    ? "linear-gradient(to right, #4a8053, #386641)"
                    : "white",
                color: msg.sender === "user" ? "white" : "#1a1a1a",
              }}
            >
              {renderMessageContent(msg)} 
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="max-w-full p-4 rounded-3xl shadow-md"
              style={{ backgroundColor: themeColors.cardBackground }}
            >
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: themeColors.darkGreen }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: themeColors.darkGreen,
                    animationDelay: "0.2s",
                  }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: themeColors.darkGreen,
                    animationDelay: "0.4s",
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex gap-4 mt-4 p-4 rounded-3xl shadow-lg"
        style={{ backgroundColor: "white" }}
      >
        <input
          type="text"
          className="flex-1 p-3 rounded-full border-none focus:outline-none placeholder-white"
          style={{
            background: "linear-gradient(135deg, #34916aff, #38c755ff)",
            color: "white",
          }}
          placeholder="What you want to ask?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) handleSend();
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className="p-3 rounded-full transition-transform transform hover:scale-105"
          style={{
            backgroundColor: themeColors.darkGreen,
            color: themeColors.cardBackground,
          }}
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChatScreen;