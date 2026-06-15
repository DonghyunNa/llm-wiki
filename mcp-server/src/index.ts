#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveVaultPath, assertVault } from "./vault.js";
import { registerTools } from "./tools.js";

async function main() {
  const vaultPath = resolveVaultPath(process.argv.slice(2));
  assertVault(vaultPath); // 잘못된 vault 면 여기서 throw → 조기 종료

  // stdout 은 stdio 프로토콜 전용 — 로그는 반드시 stderr.
  console.error(`[llm-wiki-mcp] vault: ${vaultPath}`);

  const server = new McpServer({
    name: "llm-wiki",
    version: "0.1.0",
  });

  registerTools(server, vaultPath);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[llm-wiki-mcp] ready (stdio)");
}

main().catch((e) => {
  console.error(`[llm-wiki-mcp] fatal: ${(e as Error).message}`);
  process.exit(1);
});
