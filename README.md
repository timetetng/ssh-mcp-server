# 🔐 ssh-mcp-server

[![NPM Version](https://img.shields.io/npm/v/@fangjunjie/ssh-mcp-server.svg)](https://www.npmjs.com/package/@fangjunjie/ssh-mcp-server)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/classfang/ssh-mcp-server)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)

SSH-based MCP (Model Context Protocol) server that allows remote execution of SSH commands via the MCP protocol with support for both stdio and HTTP/SSE transport modes.

[中文文档](README_CN.md)

## 📝 Project Overview

ssh-mcp-server is a bridging tool that enables AI assistants and other applications supporting the MCP protocol to execute remote SSH commands through a standardized interface. This allows AI assistants to safely operate remote servers, execute commands, and retrieve results without directly exposing SSH credentials to AI models.

**New in v1.2.3**: Now supports HTTP/SSE transport mode for remote deployment and automatic SSH configuration loading from `~/.ssh/config`.

## ✨ Key Features

- **🔒 Secure Connections**: Supports multiple secure SSH connection methods, including password authentication and private key authentication (with passphrase support)
- **🛡️ Command Security Control**: Precisely control the range of allowed commands through flexible blacklist and whitelist mechanisms to prevent dangerous operations
- **🔄 Dual Transport Modes**:
  - **stdio mode** (default): Communication via standard input/output, suitable for local integration
  - **HTTP/SSE mode**: Network-based HTTP communication, suitable for remote deployment
- **📂 File Transfer**: Supports bidirectional file transfers, uploading local files to servers or downloading files from servers
- **🔑 Credential Isolation**: SSH credentials are managed entirely locally and never exposed to AI models, enhancing security
- **🚀 Ready to Use**: Can be run directly using NPX without global installation, making it convenient and quick to deploy
- **⚙️ Auto SSH Config Loading**: Automatically loads SSH configurations from `~/.ssh/config` and default SSH keys
- **🧩 Multi-SSH Connection**: Support for multiple SSH connections with connection name selection

## 📦 Installation

### Using NPX (Recommended)

No installation required - run directly with npx:

```bash
# stdio mode
npx -y @fangjunjie/ssh-mcp-server --host 192.168.1.1 --username root --password your_password

# HTTP/SSE mode
npx -y @fangjunjie/ssh-mcp-server --http-port 8080
```

### From Source

```bash
git clone https://github.com/classfang/ssh-mcp-server.git
cd ssh-mcp-server
npm install
npm run build
```

## 🛠️ Tools List

| Tool | Name | Description |
|---------|-----------|----------|
| execute-command | Command Execution Tool | Execute SSH commands on remote servers and get results |
| upload | File Upload Tool | Upload local files to specified locations on remote servers |
| download | File Download Tool | Download files from remote servers to local specified locations |
| list-servers | List Servers Tool | List all available SSH server configurations |

## 📚 Usage

### 🔧 Command Line Options

#### Transport Mode Options

| Option | Description | Example |
|--------|-------------|---------|
| `--http-port <port>` | Enable HTTP/SSE mode with specified port | `--http-port 8080` |
| `--ssh-config <hostname>` | Load specific SSH config from `~/.ssh/config` | `--ssh-config myserver` |

#### SSH Connection Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--ssh <config>` | - | Manual SSH connection config | `--ssh "name=prod,host=1.2.3.4,port=22,user=admin,password=xxx"` |
| `--host` | `-h` | SSH server host address | `--host 192.168.1.1` |
| `--port` | `-p` | SSH server port | `--port 22` |
| `--username` | `-u` | SSH username | `--username root` |
| `--password` | `-w` | SSH password | `--password pwd123` |
| `--privateKey` | `-k` | SSH private key file path | `--privateKey ~/.ssh/id_rsa` |
| `--passphrase` | `-P` | Private key passphrase | `--passphrase pwd123` |
| `--whitelist` | `-W` | Command whitelist (regex, comma-separated) | `--whitelist "^ls,^cat,^df"` |
| `--blacklist` | `-B` | Command blacklist (regex, comma-separated) | `--blacklist "^rm,^shutdown"` |
| `--socksProxy` | `-s` | SOCKS proxy address | `--socksProxy socks://user:pass@host:port` |

### 🚀 Quick Start Examples

#### HTTP/SSE Mode (Recommended for Remote Deployment)

```bash
# Auto-load SSH config from ~/.ssh/config
npm run build
node build/index.js --http-port 8080

# Load specific SSH config
node build/index.js --http-port 8080 --ssh-config myserver

# Multiple connections
node build/index.js --http-port 8080 \
  --ssh "name=prod,host=prod.com,port=22,user=admin,password=pass" \
  --ssh "name=dev,host=dev.com,port=22,user=dev,privateKey=~/.ssh/id_ed25519"

# With command whitelist (recommended)
node build/index.js --http-port 8080 \
  --ssh "name=server,host=example.com,port=22,user=root,password=pass" \
  --ssh whitelist="ls|cat|grep|pwd|echo"
```

#### stdio Mode (Default, Backward Compatible)

```bash
# Using password
npx -y @fangjunjie/ssh-mcp-server \
  --host 192.168.1.1 \
  --port 22 \
  --username root \
  --password pwd123456

# Using private key
npx -y @fangjunjie/ssh-mcp-server \
  --host 192.168.1.1 \
  --port 22 \
  --username root \
  --privateKey ~/.ssh/id_rsa

# Multiple SSH connections
npx -y @fangjunjie/ssh-mcp-server \
  --ssh "name=dev,host=1.2.3.4,port=22,user=alice,password=xxx" \
  --ssh "name=prod,host=5.6.7.8,port=22,user=bob,password=yyy"
```

### 📋 MCP Configuration Examples

> **⚠️ Important**: In MCP configuration files, each command line argument and its value must be separate elements in the `args` array. Do NOT combine them with spaces. For example, use `"--host", "192.168.1.1"` instead of `"--host 192.168.1.1"`.

#### Using Password

```json
{
  "mcpServers": {
    "ssh-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@fangjunjie/ssh-mcp-server",
        "--host", "192.168.1.1",
        "--port", "22",
        "--username", "root",
        "--password", "pwd123456"
      ]
    }
  }
}
```

#### Using Private Key

```json
{
  "mcpServers": {
    "ssh-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@fangjunjie/ssh-mcp-server",
        "--host", "192.168.1.1",
        "--port", "22",
        "--username", "root",
        "--privateKey", "~/.ssh/id_rsa"
      ]
    }
  }
}
```

#### Using Command Whitelist and Blacklist

**Whitelist Example** (recommended):

```json
{
  "mcpServers": {
    "ssh-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@fangjunjie/ssh-mcp-server",
        "--host", "192.168.1.1",
        "--port", "22",
        "--username", "root",
        "--password", "pwd123456",
        "--whitelist", "^ls( .*)?,^cat .*,^df.*"
      ]
    }
  }
}
```

**Blacklist Example**:

```json
{
  "mcpServers": {
    "ssh-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@fangjunjie/ssh-mcp-server",
        "--host", "192.168.1.1",
        "--port", "22",
        "--username", "root",
        "--password", "pwd123456",
        "--blacklist", "^rm .*,^shutdown.*,^reboot.*"
      ]
    }
  }
}
```

> **Note**: If both whitelist and blacklist are specified, the system will first check whether the command is in the whitelist, and then check whether it is in the blacklist. The command must pass both checks to be executed.

### 💻 HTTP Client Integration

#### JavaScript/TypeScript

```typescript
import fetch from "node-fetch";

// Initialize session
const initResponse = await fetch("http://localhost:8080/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "my-client",
        version: "1.0.0",
      },
    },
  }),
});

const initResult = await initResponse.json();
const sessionId = initResult.result.sessionId;

if (!sessionId) {
  throw new Error("Failed to get session ID");
}

// List tools
const toolsResponse = await fetch("http://localhost:8080/mcp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "mcp-session-id": sessionId,
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  }),
});

const tools = await toolsResponse.json();
console.log("Available tools:", tools);

// Listen to server push (SSE)
const eventSource = new EventSource(
  `http://localhost:8080/mcp?sessionId=${sessionId}`
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received notification:", data);
};
```

#### Python

```python
import requests
import json

# Initialize session
init_response = requests.post(
    "http://localhost:8080/mcp",
    json={
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "python-client",
                "version": "1.0.0",
            },
        },
    },
)

init_result = init_response.json()
session_id = init_result["result"]["sessionId"]

# Send subsequent requests
tools_response = requests.post(
    "http://localhost:8080/mcp",
    headers={"mcp-session-id": session_id},
    json={
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {},
    },
)

tools = tools_response.json()
print("Available tools:", tools)
```

### 🌐 HTTP Endpoints (HTTP/SSE Mode)

- `POST /mcp` - Main MCP protocol communication endpoint
  - First request: Initialize session (no session ID required)
  - Subsequent requests: Include `mcp-session-id` header
- `GET /mcp` - Server-Sent Events (SSE) endpoint for notifications
  - Required header: `mcp-session-id: <sessionId>`
- `DELETE /mcp` - Terminate session endpoint
  - Required header: `mcp-session-id: <sessionId>`

### 🧩 Multi-SSH Connection Usage

When using multiple SSH connections, specify the connection name via the `connectionName` parameter:

```json
{
  "tool": "execute-command",
  "params": {
    "cmdString": "ls -al",
    "connectionName": "prod"
  }
}
```

### ⏱️ Command Execution Timeout

The `execute-command` tool supports timeout options to prevent commands from hanging indefinitely:

- **timeout**: Command execution timeout in milliseconds (default: 30000ms)

Example:

```json
{
  "tool": "execute-command",
  "params": {
    "cmdString": "ping -c 10 127.0.0.1",
    "connectionName": "prod",
    "timeout": 5000
  }
}
```

This is particularly useful for commands like `ping`, `tail -f`, or other long-running processes.

### 🗂️ List All SSH Servers

```json
{
  "tool": "list-servers",
  "params": {}
}
```

Example response:

```json
[
  { "name": "dev", "host": "1.2.3.4", "port": 22, "username": "alice" },
  { "name": "prod", "host": "5.6.7.8", "port": 22, "username": "bob" }
]
```

## 🛡️ Security Considerations

This server provides powerful capabilities to execute commands and transfer files on remote servers. To ensure it is used securely, please consider the following:

- **Command Whitelisting**: It is *strongly recommended* to use the `--whitelist` option to restrict the set of commands that can be executed. Without a whitelist, any command can be executed on the remote server, which can be a significant security risk.
- **Private Key Security**: The server reads the SSH private key into memory. Ensure that the machine running the `ssh-mcp-server` is secure. Do not expose the server to untrusted networks.
- **Denial of Service (DoS)**: The server does not have built-in rate limiting. An attacker could potentially launch a DoS attack by flooding the server with connection requests or large file transfers. It is recommended to run the server behind a firewall or reverse proxy with rate-limiting capabilities.
- **Path Traversal**: The server has built-in protection against path traversal attacks on the local filesystem. However, it is still important to be mindful of the paths used in `upload` and `download` commands.
- **HTTPS Deployment**: For production environments using HTTP mode, it is recommended to deploy behind a reverse proxy (e.g., Nginx) with HTTPS enabled.
- **Firewall Configuration**: Only allow trusted IP addresses to access the HTTP port.
- **CORS Configuration**: The server is configured with permissive CORS headers for development. Review and restrict as needed for production.

## 📋 System Requirements

- **Node.js**: >= 18.x
- **MCP Protocol Version**: 2024-11-05
- **SSH Server**: Any standard SSH server (OpenSSH, etc.)

## 🔧 Troubleshooting

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::8080
```
**Solution**: Use a different port
```bash
node build/index.js --http-port 3000
```

### CORS Errors
```
Access to fetch at 'http://localhost:8080/mcp' from origin...
```
**Solution**: Ensure client sends correct Accept header:
```javascript
"Accept": "application/json, text/event-stream"
```

### SSH Connection Failed
**Solution**: Verify SSH credentials, network connectivity, and configuration:
- Check `~/.ssh/config` for correct settings
- Verify username, password, or private key
- Test SSH connection manually: `ssh user@host`

### Missing Session ID
```
Bad Request: No valid session ID provided
```
**Solution**: Ensure initialization request succeeded and use returned `sessionId` in subsequent requests

## 📄 License

MIT

## 🚀 More Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [GitHub Repository](https://github.com/classfang/ssh-mcp-server)
- [NPM Package](https://www.npmjs.com/package/@fangjunjie/ssh-mcp-server)

---

**Current Version**: v1.2.3 | **Node.js**: >= 18.x | **MCP Protocol**: 2024-11-05
