import {
  createBraveClient,
  getBraveToolsForOpenAI,
  executeBraveTool,
  closeBraveClient,
} from "../../lib/mcp/braveClient.js";

// Mark this endpoint as server-rendered (not static)
export const prerender = false;

const BASE_MODEL_PAYLOAD = {
  model: "openai/gpt-oss-20b",
  max_tokens: 512,
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  repetition_penalty: 1,
  stop: ["<|eot_id|>", "<|eom_id|>"],
};

const MAX_TOOL_ITERATIONS = 5;

async function callTogetherChat(apiKey, payload) {
  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  console.log("[Chat API] Together API response status:", response.status);
  console.log(
    "[Chat API] Response headers:",
    Object.fromEntries(response.headers.entries()),
  );

  const responseText = await response.text();
  console.log("[Chat API] Response text length:", responseText.length);
  console.log(
    "[Chat API] Response text preview:",
    responseText.substring(0, 200),
  );

  if (!response.ok) {
    console.error(
      "[Chat API] Together API Error:",
      response.status,
      responseText,
    );
    throw new Error(
      `Together API returned ${response.status}: ${responseText}`,
    );
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error("[Chat API] JSON parse error:", parseError);
    console.error("[Chat API] Raw response:", responseText);
    throw new Error(
      `Failed to parse Together API response: ${parseError.message}`,
    );
  }
}

export async function POST({ request }) {
  console.log("[Chat API] Request received");

  try {
    const { messages } = await request.json();
    console.log("[Chat API] Messages parsed:", messages?.length, "messages");

    if (!messages || !Array.isArray(messages)) {
      console.log("[Chat API] Invalid messages format");
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get API key from environment variable - try both methods
    const apiKey =
      import.meta.env.TOGETHER_API_KEY || process.env.TOGETHER_API_KEY;

    console.log("[Chat API] API Key present:", !!apiKey);
    console.log("[Chat API] API Key length:", apiKey?.length);

    console.log("[Chat API] API Key present:", !!apiKey);
    console.log("[Chat API] API Key length:", apiKey?.length);

    if (!apiKey) {
      console.error("[Chat API] TOGETHER_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "API configuration error - Missing API key" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("[Chat API] Preparing conversation and MCP tooling...");

    const systemMessage = {
      role: "system",
      content: `You are an AI assistant for Juan Jaramillo AI Consulting Services. Provide helpful, accurate information about the company's AI consulting services, including AI strategy, machine learning, data analytics, NLP, computer vision, and automation solutions. Format your responses using Markdown for better readability:
- Use **bold** for emphasis
- Use bullet points with - or * for lists
- Use numbered lists where appropriate
- Use markdown tables with proper pipe formatting
- Keep responses clear, professional, and informative
- Avoid using HTML tags like <br> - use proper markdown line breaks instead

If asked about specific services, provide detailed, well-formatted information in clean markdown format.`,
    };

    const conversation = [systemMessage, ...messages];

    let braveClient;
    let braveTransport;
    let braveTools = [];
    let toolsEnabled = false;

    try {
      ({ client: braveClient, transport: braveTransport } =
        await createBraveClient());
      braveTools = await getBraveToolsForOpenAI(braveClient);
      toolsEnabled = braveTools.length > 0;
      console.log(
        "[Chat API] Brave MCP client ready. Tool count:",
        braveTools.length,
      );
    } catch (mcpError) {
      if (process.env.BRAVE_API_KEY) {
        console.error(
          "[Chat API] Failed to initialize Brave MCP client:",
          mcpError,
        );
        throw new Error(
          "Failed to initialize Brave search tooling. See server logs for details.",
        );
      }
      console.warn(
        "[Chat API] BRAVE_API_KEY missing or MCP unavailable. Continuing without tools.",
      );
    }

    let finalMessage = null;

    try {
      for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
        const payload = {
          ...BASE_MODEL_PAYLOAD,
          messages: conversation,
        };

        if (toolsEnabled) {
          payload.tools = braveTools;
          payload.tool_choice = "auto";
        }

        const data = await callTogetherChat(apiKey, payload);

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error(
            "[Chat API] Invalid response structure:",
            JSON.stringify(data),
          );
          throw new Error("Invalid response from Together API");
        }

        const assistantMessage = data.choices[0].message;
        conversation.push(assistantMessage);

        const toolCalls = assistantMessage.tool_calls || [];

        if (!toolCalls.length) {
          finalMessage = assistantMessage;
          break;
        }

        if (!toolsEnabled || !braveClient) {
          throw new Error(
            "Model requested a tool call but Brave tooling is not available.",
          );
        }

        console.log(
          "[Chat API] Tool calls requested:",
          toolCalls.map((call) => call.function?.name),
        );

        for (const toolCall of toolCalls) {
          const toolMessage = await executeBraveTool(braveClient, toolCall);
          conversation.push(toolMessage);
        }
      }
    } finally {
      if (braveClient && braveTransport) {
        await closeBraveClient(braveClient, braveTransport);
      }
    }

    if (!finalMessage) {
      throw new Error(
        "Failed to retrieve final assistant response within tool iteration limit.",
      );
    }

    const content = finalMessage.content;
    console.log(
      "[Chat API] Success! Response content length:",
      content?.length,
    );

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    console.error("[Chat API] Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
