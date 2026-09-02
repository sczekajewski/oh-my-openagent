# MCP Tool Health QA

## What Was Tested

- `bun test packages/omo-opencode/src/agents/tool-restrictions.test.ts packages/omo-opencode/src/cli/doctor/checks/tools-lsp.test.ts`
- `bun run typecheck`
- `bun run build`
- `bun dist/cli/index.js doctor --json` inside `script/agent/qa-sandbox.sh`
- `opencode run --format json --model opencode/big-pickle "Reply with exactly OK."` with the local `dist/index.js` plugin configured through `OPENCODE_CONFIG_CONTENT` inside `script/agent/qa-sandbox.sh`
- Host OpenCode database session count before and after live QA.

## What Was Observed

- Focused tests passed: 19 tests, 158 assertions, zero failures (`focused-tests.txt`).
- Repository typecheck passed across root, scripts, and all packages (`typecheck.txt`).
- Full build completed successfully (`build.txt`).
- The real doctor output reports the LSP MCP transport in `mcpBuiltin` while reporting `lspServers: []` and warning `No LSP servers detected` (`doctor-json.txt`). This proves transport availability is no longer presented as an installed language server.
- The isolated real OpenCode run loaded the local plugin and returned `OK.` with a normal `step_finish` event (`opencode-run.jsonl`).
- The host database session count was `589` before and `589` after the isolated live run.

## Why This Is Enough

- The focused tests pin the exact registered tool identifiers exposed to Explore and Librarian and the installed/enabled filtering used by the LSP doctor.
- Typecheck and build cover package boundaries, declaration emission, and bundling after adding the `lsp-core` adapter dependency.
- The doctor and OpenCode runs exercise the built artifacts through their real CLI surfaces in isolated XDG state.

## Known Unrelated Failures

- The broad `agents` plus `cli/doctor` suite completed 481 tests successfully but retained three existing model-resolution failures. Those tests load `/home/szymon/.omo/omo.jsonc` and observe the host `llama.cpp/qwen3.8-flash-next` override instead of their fixtures (`isolated-agent-doctor-tests.txt` and `isolated-agent-doctor-tests-home.txt`). None touches the changed prompt or LSP doctor paths.
- `lsp_diagnostics` could not run because the TypeScript language server is not installed and its installation was previously declined. The repository's strict TypeScript typecheck passed instead.
- The isolated doctor exits nonzero because the sandbox intentionally has no installed plugin registration; its loaded build version and Tools payload were still produced successfully. The separate real OpenCode run loaded the local plugin directly.

## Omitted

- No credentials, authentication headers, environment dumps, or provider secrets were recorded.
