# OpenCode Codegraph Runtime QA

Date: 2026-09-02
Worktree: `/home/szymon/omo-local-model-harness/oh-my-openagent-restore-codegraph`
Branch: `feat/restore-opencode-codegraph`

## Isolated configuration

The runtime used `/tmp/omo-codegraph-qa-home` for `HOME` and every XDG data directory. Its `opencode.jsonc` loaded this worktree's local `dist/index.js`.

## MCP connectivity

`opencode mcp list` reported five connected servers:

- `websearch`: `https://mcp.exa.ai/mcp?tools=web_search_exa`
- `context7`: `https://mcp.context7.com/mcp`
- `grep_app`: `https://mcp.grep.app`
- `lsp`: local `packages/lsp-daemon/dist/cli.js mcp`
- `codegraph`: `/home/szymon/.local/bin/codegraph serve --mcp`

Result: `5 server(s)` and every server showed `connected`.

## Session bootstrap event

An isolated OpenCode server on `127.0.0.1:35371` was observed with the repository's bounded SSE probe while a session was created through `POST /session`.

```text
watching http://127.0.0.1:35371/event?directory=/home/szymon/omo-local-model-harness/oh-my-openagent-restore-codegraph for 'session.created' (<=15s)
first matching event: {"type":"session.created"}
PASS: observed 'session.created' on http://127.0.0.1:35371
```

Created isolated session: `ses_f9dc3d333ffeVFfLlHmqSVbckQ`.

The server log also showed project instance creation, plugin bootstrap, and the isolated session record for the restoration worktree.

## Database isolation

- Host OpenCode session count before QA: `589`
- Host OpenCode session count after QA: `589`
- Isolated OpenCode database contains only the two QA sessions created by this probe.

Result: runtime QA did not write to the host OpenCode session database.

## Codegraph status

`codegraph --version` returned `1.5.0`.

`codegraph status --json` reported:

```json
{
  "initialized": true,
  "version": "1.5.0",
  "projectPath": "/home/szymon/omo-local-model-harness",
  "fileCount": 26675,
  "nodeCount": 347347,
  "edgeCount": 1430256,
  "backend": "node-sqlite",
  "pendingChanges": {
    "added": 0,
    "modified": 0,
    "removed": 0
  },
  "worktreeMismatch": null,
  "index": {
    "builtWithVersion": "1.5.0",
    "currentExtractionVersion": 24,
    "reindexRecommended": false,
    "state": "complete",
    "pendingRefs": 0
  }
}
```

## Real MCP tool invocation

The active OpenCode session invoked `codegraph_codegraph_explore` with:

```text
createBuiltinMcps createCodegraphMcpConfig createCodegraphBootstrapHook event-hook-dispatcher CodegraphConfigSchema
```

The tool returned current, line-numbered source from the restoration worktree for:

- `packages/omo-opencode/src/hooks/codegraph-bootstrap/hook.ts`
- `packages/omo-opencode/src/mcp/codegraph.ts`
- `packages/omo-opencode/src/mcp/index.ts`
- `packages/omo-opencode/src/config/schema/codegraph.ts`

It also returned callers, direct tests, relationships, and blast-radius data, including three callers of `createBuiltinMcps`, tests for `createCodegraphMcpConfig`, and consumers of `CodegraphConfigSchema`.

Result: the actual namespaced OpenCode MCP tool reads the restoration worktree and returns indexed source plus dependency context.
