# Codegraph Restoration Test Gates

Date: 2026-09-02
Worktree: `/home/szymon/omo-local-model-harness/oh-my-openagent-restore-codegraph`

## Consolidated regression suite

Command:

```text
bun test packages/utils/src/codegraph*.test.ts packages/utils/src/codegraph/*.test.ts packages/utils/src/process-sweep-families.test.ts packages/omo-opencode/src/config/schema/codegraph*.test.ts packages/omo-opencode/src/hooks/codegraph-bootstrap/*.test.ts packages/omo-opencode/src/mcp/codegraph.test.ts packages/omo-opencode/src/mcp/zauc-mocks-mcp-index/index.test.ts packages/omo-opencode/src/plugin/hooks/create-session-hooks.test.ts packages/omo-opencode/src/plugin/tool-execute-after.test.ts packages/omo-opencode/src/shared/omo-process-sweep.test.ts packages/omo-opencode/src/tools/skill-mcp/builtin-mcp-hint.test.ts
```

Observed:

```text
198 pass
0 fail
439 expect() calls
Ran 198 tests across 26 files.
```

The suite covers runtime resolution and provisioning, workspace and exclusion behavior, process cleanup, configuration defaults, MCP registration, session-start bootstrap, tool-result guidance, hook composition, and builtin MCP hints.

## Preserved hook coverage

The final diff review found that the restoration had replaced two existing ast-grep hook-composition tests. Those tests were restored alongside the Codegraph cases.

Command:

```text
bun test packages/omo-opencode/src/plugin/hooks/create-session-hooks.test.ts
```

Observed:

```text
8 pass
0 fail
8 expect() calls
```

## TypeScript rules

Command:

```text
bun run packages/shared-skills/skills/programming/scripts/typescript/check-no-excuse-rules.ts packages/omo-opencode/src/plugin/hooks/create-session-hooks.test.ts
```

Observed: `No violations in 1 file(s).`

## Typecheck

Command: `bun run typecheck`

Observed: root `tsgo --noEmit`, script typecheck, and all package typechecks completed successfully.

## Build

Command: `bun run build`

Observed: all build stages completed successfully, including the OpenCode bundle, CLI bundles, schema generation, declarations, LSP runtimes, Codex plugin, and Senpi plugin.

The build touched five unrelated generated Codex/Senpi files. They were restored before staging; only the expected OpenCode schema outputs remain.

## Diff hygiene

Command: `git diff --check`

Observed: no whitespace errors in the intended change set.

## Diagnostic limitation

`lsp_diagnostics` could not connect to `/home/szymon/.omo/lsp-daemon/v0.1.0/daemon.sock`. The repository's strict full typecheck passed and is used as the static diagnostic gate. Runtime behavior is separately proven in `runtime-qa.md`.
