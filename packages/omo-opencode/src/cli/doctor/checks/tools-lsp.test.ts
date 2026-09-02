/// <reference types="bun-types" />

import { afterEach, describe, expect, it } from "bun:test"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { ServerStatus } from "@oh-my-opencode/lsp-core"

const temporaryDirectories: string[] = []

function createTemporaryDirectory(prefix: string): string {
  const directory = mkdtempSync(join(tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

function createLspDistCli(workspaceDirectory: string): void {
  const directory = join(workspaceDirectory, "packages", "lsp-tools-mcp", "dist")
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, "cli.js"), "#!/usr/bin/env node\n", "utf-8")
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe("getInstalledLspServers", () => {
  it("#given an omo project view disabling lsp #when checking servers #then returns none", async () => {
    const homeDirectory = createTemporaryDirectory("omo-tools-lsp-home-")
    const workspaceDirectory = createTemporaryDirectory("omo-tools-lsp-workspace-")
    const configPath = join(workspaceDirectory, ".omo", "omo.jsonc")
    mkdirSync(join(configPath, ".."), { recursive: true })
    createLspDistCli(workspaceDirectory)
    writeFileSync(configPath, JSON.stringify({ "[opencode]": { disabled_mcps: ["lsp"] } }))

    const { getInstalledLspServers } = await import(`./tools-lsp?t=${Date.now()}-disabled`)

    expect(getInstalledLspServers({ homeDir: homeDirectory, cwd: workspaceDirectory })).toEqual([])
  })

  it("#given configured servers without executables #when checking servers #then returns none", async () => {
    const homeDirectory = createTemporaryDirectory("omo-tools-lsp-home-")
    const workspaceDirectory = createTemporaryDirectory("omo-tools-lsp-enabled-")
    createLspDistCli(workspaceDirectory)
    const configuredServers: ServerStatus[] = [
      { id: "typescript", extensions: [".ts"], installed: false, disabled: false, source: "builtin", priority: -100 },
    ]

    const { getInstalledLspServers } = await import(`./tools-lsp?t=${Date.now()}-enabled`)

    expect(getInstalledLspServers({
      homeDir: homeDirectory,
      cwd: workspaceDirectory,
      getServers: () => configuredServers,
    })).toEqual([])
  })

  it("#given installed and disabled servers #when checking servers #then returns only enabled executables", async () => {
    const homeDirectory = createTemporaryDirectory("omo-tools-lsp-home-")
    const workspaceDirectory = createTemporaryDirectory("omo-tools-lsp-installed-")
    createLspDistCli(workspaceDirectory)
    const configuredServers: ServerStatus[] = [
      { id: "typescript", extensions: [".ts", ".tsx"], installed: true, disabled: false, source: "builtin", priority: -100 },
      { id: "python", extensions: [".py"], installed: false, disabled: false, source: "builtin", priority: -100 },
      { id: "rust", extensions: [".rs"], installed: true, disabled: true, source: "disabled", priority: 0 },
    ]

    const { getInstalledLspServers } = await import(`./tools-lsp?t=${Date.now()}-installed`)

    expect(getInstalledLspServers({
      homeDir: homeDirectory,
      cwd: workspaceDirectory,
      getServers: () => configuredServers,
    })).toEqual([{ id: "typescript", extensions: [".ts", ".tsx"] }])
  })
})
