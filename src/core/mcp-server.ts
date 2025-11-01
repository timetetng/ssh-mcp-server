import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";
import http from "http";
import { SSHConnectionManager } from "../services/ssh-connection-manager.js";
import { Logger } from "../utils/logger.js";
import { registerAllTools } from "../tools/index.js";
import { SERVER_CONFIG } from "../config/server.js";
import { ParsedArgs } from "../models/types.js";

/**
 * MCP Server class
 */
export class SshMcpServer {
  private server: McpServer;
  private sshManager: SSHConnectionManager;
  private transports: Map<string, StreamableHTTPServerTransport> = new Map();

  constructor() {
    this.server = new McpServer(SERVER_CONFIG);
    this.sshManager = SSHConnectionManager.getInstance();
  }

  /**
   * Register tools
   */
  private registerTools(): void {
    registerAllTools(this.server);
  }

  /**
   * Run the server
   */
  public async run(parsedArgs: ParsedArgs): Promise<void> {
    const { sshConfig, httpPort } = parsedArgs;

    // Initialize SSH configuration
    this.sshManager.setConfig(sshConfig);

    // Security warning (only if SSH configs are present)
    const allConfigs = Object.values(sshConfig);
    if (allConfigs.length > 0) {
      if (
        allConfigs.some(
          (c) => !c.commandWhitelist || c.commandWhitelist.length === 0
        )
      ) {
        Logger.log(
          "WARNING: Running without a command whitelist is strongly discouraged. Please configure a whitelist to restrict the commands that can be executed.",
          "info"
        );
      }
    }

    // Register tools
    this.registerTools();

    if (httpPort) {
      // HTTP/SSE 模式
      const app = express();
      app.use(cors());
      app.use(express.json());

      // Handle POST requests for client-to-server communication
      app.post("/mcp", async (req, res) => {
        try {
          // Check for existing session ID
          const sessionId = req.headers["mcp-session-id"] as string | undefined;
          let transport: StreamableHTTPServerTransport;

          if (sessionId && this.transports.has(sessionId)) {
            // Reuse existing transport
            transport = this.transports.get(sessionId)!;
          } else if (!sessionId && isInitializeRequest(req.body)) {
            // New initialization request
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (sessionId) => {
                // Store the transport by session ID
                this.transports.set(sessionId, transport);
              },
            });

            // Clean up transport when closed
            transport.onclose = () => {
              if (transport.sessionId) {
                this.transports.delete(transport.sessionId);
              }
            };

            // Connect to the MCP server
            await this.server.connect(transport);
          } else {
            // Invalid request
            res.status(400).json({
              jsonrpc: "2.0",
              error: {
                code: -32000,
                message: "Bad Request: No valid session ID provided",
              },
              id: null,
            });
            return;
          }

          // Handle the request
          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          Logger.handleError(error, "Failed to connect HTTP transport");
          if (!res.headersSent) {
            res.status(500).send("Server Error");
          }
        }
      });

      // Reusable handler for GET and DELETE requests
      const handleSessionRequest = async (req: express.Request, res: express.Response) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;
        if (!sessionId || !this.transports.has(sessionId)) {
          res.status(400).send("Invalid or missing session ID");
          return;
        }

        const transport = this.transports.get(sessionId)!;
        await transport.handleRequest(req, res);
      };

      // Handle GET requests for server-to-client notifications via SSE
      app.get("/mcp", handleSessionRequest);

      // Handle DELETE requests for session termination
      app.delete("/mcp", handleSessionRequest);

      app.listen(httpPort, () => {
        Logger.log(
          `MCP server running in HTTP/SSE mode on http://localhost:${httpPort}/mcp`
        );
      });
    } else {
      // Stdio 模式 (回退)
      Logger.log("MCP server running in stdio mode");
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
    }
  }
}
