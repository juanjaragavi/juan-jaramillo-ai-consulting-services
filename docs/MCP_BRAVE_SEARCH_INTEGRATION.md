# MCP Integration: Brave Search Tooling for Together `openai/gpt-oss-20b`

## 1. Goal & Context

- **Objective**: Allow the Contact page assistant (currently powered by Together's `openai/gpt-oss-20b`) to answer real-time queries by routing tool calls to the Brave Search MCP server.
- **Why MCP**: Model Context Protocol (MCP) lets the model invoke external capabilities ("tools") through a standard interface. `@modelcontextprotocol/server-brave-search` exposes Brave Search as an MCP tool named `brave_web_search`.
- **Current Limitation**: The Contact endpoint makes a single Together API call without `tools`; the model cannot invoke search and therefore responds with "no browser access" to live queries.

## 2. High-Level Architecture

1. **Chat UI**: Sends message history to `src/pages/api/chat.js`.
2. **Astro API Route**: Orchestrates an agent loop:
   - Bootstraps an MCP client that spawns the Brave Search server via `npx @modelcontextprotocol/server-brave-search`.
   - Advertises the tool schema to Together by supplying the OpenAI-compatible `tools` array in the `chat.completions` request.
   - Detects `tool_calls` in Together responses, dispatches the call to the MCP client, and appends the tool result back into the conversation.
3. **Together API**: Runs `openai/gpt-oss-20b`, leverages the exposed tool, and returns either further tool calls or a final answer.
4. **Brave MCP Server**: Executes the `brave_web_search` command using the Brave Search REST API.
5. **Response**: Final model message (after any tool usage) is returned to the Chat UI.

## 3. Prerequisites

- **Node runtime**: Node 18.x (already required by Astro project).
- **Environment variables**:
  - `TOGETHER_API_KEY` – already in use for model access.
  - `BRAVE_API_KEY` – supplied value must be kept secret; add to local `.env`, Netlify/Vercel UI, and any CI secrets.
- **Packages**: `@modelcontextprotocol/sdk`, `@modelcontextprotocol/client`, and (optionally) `zod` for JSON validation.
- **Network egress**: Ensure the hosting platform allows outbound calls to `api.search.brave.com`.

## 4. Implementation Steps

### Step 4.1 – Install Dependencies

```bash
npm install @modelcontextprotocol/sdk @modelcontextprotocol/client zod
```

- `@modelcontextprotocol/sdk` provides transports, wire protocol helpers, and schema conversion utilities.
- `@modelcontextprotocol/client` bundles higher-level helpers (can be omitted if you build directly on the SDK).
- `zod` is optional but recommended for validating tool payloads before forwarding them to Together.

### Step 4.2 – Create an MCP Client Helper

Add a helper (for example `src/lib/mcp/braveClient.js`) to encapsulate spawning and caching the Brave MCP server.

```javascript
import { MCPClient } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/transport/node";

const transportOptions = {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-brave-search"],
  env: {
    ...process.env,
    BRAVE_API_KEY: process.env.BRAVE_API_KEY,
  },
  timeout: 60_000,
};

export async function createBraveClient() {
  if (!process.env.BRAVE_API_KEY) {
    throw new Error("BRAVE_API_KEY is missing");
  }

  const transport = new StdioClientTransport(transportOptions);
  const client = new MCPClient(
    {
      name: "astro-contact-agent",
      version: "0.1.0",
    },
    transport,
  );

  await client.connect();
  return { client, transport };
}
```

**Notes**:

- Wrap the helper in a simple connection pool if you expect multiple concurrent requests; re-use the client per invocation otherwise call `await client.close()` in a `finally` block.
- Set `timeout` to match the configuration snippet provided (60 seconds).

### Step 4.3 – Translate MCP Tool Schema to OpenAI Tools

The Brave server exposes a `brave_web_search` tool with a JSON schema. Convert it to the OpenAI tool format before calling Together.

```javascript
export async function getBraveToolsForOpenAI(client) {
  const { tools } = await client.listTools();
  return tools.map(({ name, description, inputSchema }) => ({
    type: "function",
    function: {
      name,
      description,
      parameters: inputSchema, // already JSON Schema draft-07
    },
  }));
}
```

### Step 4.4 – Execute Tool Calls via MCP

Add a helper that executes tool calls returned by Together and normalizes the result payload.

```javascript
export async function executeMcpTool(client, toolCall) {
  const { id, function: fn } = toolCall;
  const args = JSON.parse(fn.arguments ?? "{}");
  const result = await client.callTool({
    name: fn.name,
    arguments: args,
  });

  return {
    role: "tool",
    tool_call_id: id,
    name: fn.name,
    content: JSON.stringify(result),
  };
}
```

- `client.callTool` returns an `MCPResult`, typically `{ content: [...], isError: false }`. Retain the full object to preserve metadata for the model; Together accepts arbitrary JSON string content for tool responses.
- Guard against JSON parsing errors and convert binary data to text if the server ever returns buffers.

### Step 4.5 – Update `src/pages/api/chat.js`

1. Initialize the Brave client before the request loop and obtain `tools` via `getBraveToolsForOpenAI`.

1. Extend the chat completion request with `tools` and `tool_choice: "auto"`.

1. Implement an agent loop pattern:
   - Send `messages` to Together.
   - Append the model reply to the local conversation.
   - If `tool_calls` exist, execute each via `executeMcpTool` and push the tool message into the conversation.
   - Repeat until Together returns a message without `tool_calls`.

1. Ensure the Brave client is closed in `finally`.

Pseudo-structure:

```javascript
const conversation = [systemMessage, ...messages];
const tools = await getBraveToolsForOpenAI(client);

while (true) {
  const response = await togetherFetch({
    messages: conversation,
    tools,
    tool_choice: "auto",
  });
  const choice = response.choices[0];
  const assistantMessage = choice.message;
  conversation.push(assistantMessage);

  if (!assistantMessage.tool_calls?.length) {
    finalMessage = assistantMessage;
    break;
  }

  for (const toolCall of assistantMessage.tool_calls) {
    const toolMessage = await executeMcpTool(client, toolCall);
    conversation.push(toolMessage);
  }
}
```

### Step 4.6 – Manage Streaming (Optional)

- If you enable Together's streaming API, halt the stream when `tool_calls` appear, run the tool, and resume by sending the augmented conversation in a fresh request.
- For initial implementation keep the non-streaming pathway to reduce complexity.

## 5. Configuration & Deployment

- **Environment files**: Add `BRAVE_API_KEY=...` to `.env` (local) and to the platform’s secret manager (Netlify `Build & Deploy > Environment`, Vercel `Project Settings > Environment Variables`).
- **SSR Builds**: Verify the serverless runtime used by Astro (Netlify/Vercel) allows spawning child processes. If not, deploy the Brave MCP server as a separate long-lived service and connect via `http` transport instead of `stdio`.
- **Security**: Restrict Brave API key scope where possible. The Brave MCP server reads the key from `process.env.BRAVE_API_KEY`—avoid logging it.

## 6. Testing Checklist

1. **Local smoke test**: Run `npm run dev`, open the Contact page, and ask "What is Juan Jaramillo's LinkedIn page?" The model should call `brave_web_search` (check terminal logs) and respond with live data.
2. **Tool fallback**: Temporarily unset `BRAVE_API_KEY`; the API route should return a 500 with a clear error. This guards against silent failures in production.
3. **Latency**: Measure response time before and after integration. Tool usage adds the Brave round-trip (~500–800 ms). Consider caching frequent queries if needed.
4. **Monitoring**: Add structured logs around `tool_calls` and MCP execution to identify timeouts or API quota issues.

## 7. Troubleshooting

- **`tool_calls` Missing**: Confirm the `tools` array and `tool_choice` are included in the Together payload. Without them the model will never request the tool.
- **`UNIMPLEMENTED` from Together**: Ensure you are on Together's latest OpenAI-compatible endpoint (`/v1/chat/completions`); older inference endpoints do not support tool calls.
- **Process Spawn Errors**: If the host disallows `npx`, bundle the server in dependencies and call the binary directly (e.g., `node ./node_modules/.bin/mcp-brave-search`).
- **Schema Drift**: If Brave updates the tool schema, rerun `client.listTools()` at startup to fetch the latest parameters instead of hard-coding them.
- **Quotas**: Brave Search API enforces rate limits; add exponential backoff or `429` handling in the MCP tool executor.

## 8. Next Steps

- Add caching for frequent search queries (Redis or in-memory LRU) to reduce Brave API calls.
- Consider registering additional MCP tools (e.g., internal knowledge base) and publishing their schemas alongside Brave in the same orchestration loop.
- Explore Together's JSON mode or structured outputs to render richer UI components leveraging the fetched search data.
