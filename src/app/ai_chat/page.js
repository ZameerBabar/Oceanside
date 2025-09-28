"use client";

import React, { useState, useEffect } from "react";

const themeColors = {
  darkGreen: "#386641",
  lightGreen: "#d4edc9",
  cardBackground: "#ffffff",
  textDark: "#1a1a1a",
  textLight: "#6b7280",
};

let threadId = "";

// ✅ Ab env variables se key & id le rahe hain
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID;
const apiUrl = "https://api.openai.com/v1/threads";

async function sendMessageToAssistant(userMessage) {
  try {
    if (!threadId) {
      const threadRes = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      });
      const threadData = await threadRes.json();
      threadId = threadData.id;
    }

    await fetch(`${apiUrl}/${threadId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        role: "user",
        content: [{ type: "text", text: userMessage }],
      }),
    });

    const runRes = await fetch(`${apiUrl}/${threadId}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({ assistant_id: assistantId }),
    });

    const runData = await runRes.json();
    const runId = runData.id;

    let status = "queued";
    while (status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusRes = await fetch(`${apiUrl}/${threadId}/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      });
      const statusData = await statusRes.json();
      status = statusData.status;

      if (["failed", "cancelled", "expired"].includes(status)) {
        throw new Error("Assistant run failed.");
      }

      if (status === "requires_action") {
        throw new Error("Action required, not implemented.");
      }
    }

    const messagesRes = await fetch(`${apiUrl}/${threadId}/messages`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
    });

    const messagesData = await messagesRes.json();
    const assistantMessages = messagesData.data.filter(
      (msg) => msg.role === "assistant"
    );

    if (assistantMessages.length > 0) {
      const latest = assistantMessages[0];
      const textPart = latest.content.find((c) => c.type === "text");
      return textPart?.text?.value || "No response";
    }

    return "No assistant reply";
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function resetThread() {
  threadId = "";
}

const AIChatScreen = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    resetThread();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToAssistant(userMessage.text);
      const botResponse = {
        sender: "ai",
        text: aiResponseText,
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorResponse = {
        sender: "ai",
        text: `Not Found. Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (text) => {
    // Image regex (existing)
    const imageRegex = /\((https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif)(\?[^\s)]+)?)\)/gi;
    
    // Video regex (new) - detects mp4, webm, avi, mov, wmv video files
    const videoRegex = /\((https?:\/\/[^\s]+?\.(mp4|webm|avi|mov|wmv)(\?[^\s)]+)?)\)/gi;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    // Create combined regex to find both images and videos
    const combinedRegex = /\((https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|mp4|webm|avi|mov|wmv)(\?[^\s)]+)?)\)/gi;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const url = match[1];
      const extension = match[2].toLowerCase();
      
      // Check if it's a video file
      if (['mp4', 'webm', 'avi', 'mov', 'wmv'].includes(extension)) {
        parts.push({ type: "video", url: url });
      } else {
        // It's an image
        parts.push({ type: "image", url: url });
      }
      
      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.map((part, index) => {
      if (typeof part === "string") {
        return <p key={index}>{part}</p>;
      } else if (part.type === "image") {
        return (
          <img
            key={index}
            src={part.url}
            alt="Response Visual"
            className="rounded-lg max-w-xs md:max-w-md mb-2"
          />
        );
      } else if (part.type === "video") {
        return (
          <video
            key={index}
            controls
            className="rounded-lg max-w-xs md:max-w-md mb-2"
            style={{ maxHeight: "300px" }}
          >
            <source src={part.url} type={`video/${part.url.split('.').pop().split('?')[0]}`} />
            Your browser does not support the video tag.
          </video>
        );
      }
      return null;
    });
  };

  return (
    <div
      className="flex flex-col min-h-screen p-4 md:p-8 font-sans"
      style={{ background: "linear-gradient(135deg, #34916aff, #d4edc9)" }}
    >
      <header className="flex items-center justify-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "white" }}>
          AI Chat
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
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))}

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
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="p-3 rounded-full transition-transform transform hover:scale-105"
          style={{
            backgroundColor: themeColors.darkGreen,
            color: themeColors.cardBackground,
          }}
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