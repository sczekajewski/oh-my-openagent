import {
  createStandaloneMcpRequestContext,
  getAllServers,
  runWithRequestContext,
  type ServerStatus,
} from "@oh-my-opencode/lsp-core"
import { createLspMcpConfig } from "../../../mcp/lsp"
import { validatePluginConfig } from "../../../config/validate"

type OmoConfigForDoctor = {
  disabled_mcps?: string[]
}

type InstalledLspServersOptions = {
  readonly cwd?: string
  readonly homeDir?: string
  readonly getServers?: () => ServerStatus[]
}

function isLspMcpDisabled(options: InstalledLspServersOptions): boolean {
  const environment = options.homeDir === undefined
    ? process.env
    : { ...process.env, HOME: options.homeDir }
  const config: OmoConfigForDoctor = validatePluginConfig(options.cwd ?? process.cwd(), environment).config
  return config.disabled_mcps?.includes("lsp") ?? false
}

export function getInstalledLspServers(options: InstalledLspServersOptions = {}): Array<{ id: string; extensions: string[] }> {
  if (isLspMcpDisabled(options)) {
    return []
  }

  const lspMcpConfig = createLspMcpConfig({ cwd: options.cwd })
  if (!lspMcpConfig.enabled) {
    return []
  }

  const context = createStandaloneMcpRequestContext({
    cwd: lspMcpConfig.cwd,
    env: lspMcpConfig.environment,
    homeDir: options.homeDir,
  })
  const servers = runWithRequestContext(context, options.getServers ?? getAllServers)

  return servers
    .filter((server) => server.installed && !server.disabled)
    .map(({ id, extensions }) => ({ id, extensions }))
}
