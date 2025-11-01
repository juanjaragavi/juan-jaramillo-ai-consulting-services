import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

const ChatUI = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am an intelligent AI-powered assistant, trained to answer any kind of questions about Juan Jaramillo AI Consulting Services. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.content };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "error",
          content: "An error occurred. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-auto max-h-[80vh] min-h-[50vh] max-w-2xl flex-col p-4">
      <div className="mb-4 flex-grow overflow-auto rounded border bg-gray-100 p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block rounded p-2 ${message.role === "user" ? "bg-primary text-white" : "bg-gray-200"}`}
            >
              <ReactMarkdown className="markdown-content">
                {message.content}
              </ReactMarkdown>
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow rounded-l border p-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-r bg-primary p-2 text-white"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatUI;
