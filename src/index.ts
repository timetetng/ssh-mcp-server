#!/usr/bin/env node

import { SshMcpServer } from "./core/mcp-server.js";
import { CommandLineParser } from "./cli/command-line-parser.js";
import { Logger } from "./utils/logger.js";

/**
 * Main program entry
 */
async function main(): Promise<void> {
  // 1. 解析参数
  const parsedArgs = CommandLineParser.parseArgs();

  // 2. 启动服务器
  const sshMcpServer = new SshMcpServer();
  await sshMcpServer.run(parsedArgs);
}

main().catch((error) => Logger.handleError(error, "【SSH MCP Server Error】", true));
