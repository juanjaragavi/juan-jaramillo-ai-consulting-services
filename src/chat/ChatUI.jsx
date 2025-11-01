import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();

      if (data.content) {
        const assistantMessage = { role: "assistant", content: data.content };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        throw new Error("No content received from API");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "error",
          content: `An error occurred: ${error.message}. Please try again later.`,
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
            className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`markdown-content inline-block max-w-[85%] rounded p-3 text-left text-sm ${
                message.role === "user"
                  ? "bg-primary text-white"
                  : message.role === "error"
                    ? "bg-red-200 text-red-800"
                    : "bg-white shadow-sm"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <p className="mb-2 text-sm leading-relaxed last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 text-sm">{children}</ol>,
                  li: ({ children }) => <li className="ml-2 text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  h1: ({ children }) => <h1 className="mb-2 text-lg font-bold">{children}</h1>,
                  h2: ({ children }) => <h2 className="mb-2 text-base font-bold">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-2 text-sm font-bold">{children}</h3>,
                  table: ({ children }) => (
                    <div className="mb-2 overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300 text-xs">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
                  th: ({ children }) => (
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-2 py-1">{children}</td>
                  ),
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="rounded bg-gray-200 px-1 py-0.5 text-xs font-mono">{children}</code>
                    ) : (
                      <code className="block rounded bg-gray-200 p-2 text-xs font-mono overflow-x-auto">{children}</code>
                    ),
                  pre: ({ children }) => <pre className="mb-2 overflow-x-auto rounded bg-gray-100 p-2">{children}</pre>,
                  a: ({ children, href }) => (
                    <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  br: () => <br />,
                }}
              >
                {message.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-2 text-left">
            <span className="inline-block rounded bg-gray-200 p-2">
              <div className="flex items-center">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow rounded-l border p-2"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-r bg-primary p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatUI;
