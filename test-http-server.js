#!/usr/bin/env node

/**
 * Test script for HTTP/SSE mode
 * This script starts the server in HTTP mode and makes a test request
 */

import { spawn } from "child_process";
import http from "http";

const PORT = 8888;

// Start the server
console.log("Starting SSH MCP Server in HTTP mode...");
const server = spawn("node", ["build/index.js", "--http-port", PORT.toString()], {
  stdio: ["inherit", "pipe", "pipe"],
});

// Capture server output
server.stdout.on("data", (data) => {
  console.log(`[Server] ${data.toString().trim()}`);
});

server.stderr.on("data", (data) => {
  console.error(`[Server Error] ${data.toString().trim()}`);
});

// Wait for server to start
setTimeout(async () => {
  console.log("\nMaking test request to server...");

  const requestBody = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0",
      },
    },
  });

  const options = {
    hostname: "localhost",
    port: PORT,
    path: "/mcp",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("\n[Response Status]", res.statusCode);
      console.log("[Response Headers]", res.headers);
      console.log("\n[Response Body]");
      console.log(data);

      // Cleanup
      server.kill();
      console.log("\n✓ Test completed successfully!");
      process.exit(0);
    });
  });

  req.on("error", (error) => {
    console.error("\n[Request Error]", error);
    server.kill();
    process.exit(1);
  });

  req.write(requestBody);
  req.end();
}, 2000);

// Handle server errors
server.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Handle server exit
server.on("exit", (code) => {
  if (code !== 0) {
    console.log(`Server exited with code ${code}`);
  }
});
