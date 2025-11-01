import { env } from "astro:env/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const CLIENT_INFO = {
  name: "astro-contact-agent",
  version: "0.1.0",
};

const DEFAULT_TRANSPORT_OPTIONS = {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-brave-search"],
};

function getBraveApiKey() {
  if (env?.BRAVE_API_KEY) {
    return env.BRAVE_API_KEY;
  }

  if (process.env.BRAVE_API_KEY) {
    return process.env.BRAVE_API_KEY;
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.BRAVE_API_KEY) {
    return import.meta.env.BRAVE_API_KEY;
  }

  return undefined;
}

function buildTransportEnv(braveApiKey) {
  return {
    ...process.env,
    BRAVE_API_KEY: braveApiKey,
  };
}

export async function createBraveClient() {
  const braveApiKey = getBraveApiKey();

  if (!braveApiKey) {
    throw new Error("BRAVE_API_KEY is not configured");
  }

  const transport = new StdioClientTransport({
    ...DEFAULT_TRANSPORT_OPTIONS,
    env: buildTransportEnv(braveApiKey),
  });

  const client = new Client(CLIENT_INFO, {
    capabilities: {
      tools: {},
    },
  });

  try {
    await client.connect(transport);
  } catch (error) {
    await transport.close();
    throw error;
  }

  return { client, transport };
}

export async function getBraveToolsForOpenAI(client) {
  const { tools } = await client.listTools();

  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema ?? {
        type: "object",
        properties: {},
        additionalProperties: true,
      },
    },
  }));
}

function extractToolText(result) {
  const candidateText = (result?.content || [])
    .map((entry) => entry?.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (result?.structuredContent?.results?.length) {
    const lines = result.structuredContent.results.slice(0, 5).map((item) => {
      const title = item.title || item.name || "Result";
      const url = item.url || item.link || item.href || "";
      const snippet = item.description || item.snippet || "";
      const link = url ? `- [${title}](${url})` : `- ${title}`;
      return snippet ? `${link} — ${snippet}` : link;
    });

    if (lines.length) {
      return lines.join("\n");
    }
  }

  if (candidateText) {
    try {
      const parsed = JSON.parse(candidateText);
      if (parsed?.results?.length) {
        const lines = parsed.results.slice(0, 5).map((item) => {
          const title = item.title || item.name || "Result";
          const url = item.url || item.link || item.href || "";
          const snippet = item.description || item.snippet || "";
          const link = url ? `- [${title}](${url})` : `- ${title}`;
          return snippet ? `${link} — ${snippet}` : link;
        });
        if (lines.length) {
          return lines.join("\n");
        }
      }
    } catch (parseError) {
      // fall through to raw text
    }
    return candidateText;
  }

  return JSON.stringify(result);
}

export async function executeBraveTool(client, toolCall) {
  let parsedArguments = {};

  if (toolCall.function?.arguments) {
    try {
      parsedArguments = JSON.parse(toolCall.function.arguments);
    } catch (error) {
      throw new Error(
        `Failed to parse tool arguments for ${toolCall.function?.name}: ${error.message}`,
      );
    }
  }

  const result = await client.callTool({
    name: toolCall.function.name,
    arguments: parsedArguments,
  });

  return {
    role: "tool",
    tool_call_id: toolCall.id,
    name: toolCall.function.name,
    content: extractToolText(result),
  };
}

export async function closeBraveClient(client, transport) {
  try {
    await client.close();
  } catch (error) {
    console.error("[Brave MCP] Error closing client:", error);
  }

  try {
    await transport.close();
  } catch (error) {
    console.error("[Brave MCP] Error closing transport:", error);
  }
}
