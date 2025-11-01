# 🔐 ssh-mcp-server

[![NPM 版本](https://img.shields.io/npm/v/@fangjunjie/ssh-mcp-server.svg)](https://www.npmjs.com/package/@fangjunjie/ssh-mcp-server)
[![许可证](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/classfang/ssh-mcp-server)
[![Node.js 版本](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)

基于 SSH 的 MCP (Model Context Protocol) 服务器，支持 stdio 和 HTTP/SSE 传输模式，允许通过 MCP 协议远程执行 SSH 命令。

[English Document](README.md) | 中文文档

## 📝 项目介绍

ssh-mcp-server 是一个桥接工具，可以让 AI 助手等支持 MCP 协议的应用通过标准化接口执行远程 SSH 命令。这使得 AI 助手能够安全地操作远程服务器，执行命令并获取结果，而无需直接暴露 SSH 凭据给 AI 模型。

**v1.2.3 新增功能**：现在支持 HTTP/SSE 传输模式，适用于远程部署，并支持从 `~/.ssh/config` 自动加载 SSH 配置。

## ✨ 功能亮点

- **🔒 安全连接**：支持多种安全的 SSH 连接方式，包括密码认证和私钥认证（支持带密码的私钥）
- **🛡️ 命令安全控制**：通过灵活的黑白名单机制，精确控制允许执行的命令范围，防止危险操作
- **🔄 双重传输模式**：
  - **stdio 模式**（默认）：通过标准输入输出通信，适用于本地集成
  - **HTTP/SSE 模式**：基于网络的 HTTP 通信，适用于远程部署
- **📂 文件传输**：支持双向文件传输功能，可上传本地文件到服务器或从服务器下载文件
- **🔑 凭据隔离**：SSH 凭据完全在本地管理，不会暴露给 AI 模型，增强安全性
- **🚀 即用即走**：使用 NPX 可直接运行，无需全局安装，方便快捷
- **⚙️ 自动加载 SSH 配置**：自动从 `~/.ssh/config` 加载 SSH 配置文件和默认 SSH 密钥
- **🧩 多 SSH 连接**：支持多个 SSH 连接，可通过连接名称选择

## 📦 开源仓库

GitHub：[https://github.com/classfang/ssh-mcp-server](https://github.com/classfang/ssh-mcp-server)
NPM: [https://www.npmjs.com/package/@fangjunjie/ssh-mcp-server](https://www.npmjs.com/package/@fangjunjie/ssh-mcp-server)

## 📦 安装

### 使用 NPX（推荐）

无需安装 - 直接使用 npx 运行：

```bash
# stdio 模式
npx -y @fangjunjie/ssh-mcp-server --host 192.168.1.1 --username root --password your_password

# HTTP/SSE 模式
npx -y @fangjunjie/ssh-mcp-server --http-port 8080
```

### 从源码安装

```bash
git clone https://github.com/classfang/ssh-mcp-server.git
cd ssh-mcp-server
npm install
npm run build
```

## 🛠️ 工具列表

| 工具 | 名称 | 描述 |
|---------|-----------|----------|
| execute-command | 命令执行工具 | 在远程服务器上执行 SSH 命令并获取执行结果 |
| upload | 文件上传工具 | 将本地文件上传到远程服务器指定位置 |
| download | 文件下载工具 | 从远程服务器下载文件到本地指定位置 |
| list-servers | 服务器列表工具 | 列出所有可用SSH服务器配置 |

## 📚 使用方法

### 🔧 命令行选项

#### 传输模式选项

| 选项 | 描述 | 示例 |
|--------|-------------|---------|
| `--http-port <端口>` | 启用 HTTP/SSE 模式并指定端口 | `--http-port 8080` |
| `--ssh-config <主机名>` | 从 `~/.ssh/config` 加载特定 SSH 配置 | `--ssh-config myserver` |

#### SSH 连接选项

| 选项 | 短选项 | 描述 | 示例 |
|--------|-------|-------------|---------|
| `--ssh <配置>` | - | 手动 SSH 连接配置 | `--ssh "name=prod,host=1.2.3.4,port=22,user=admin,password=xxx"` |
| `--host` | `-h` | SSH 服务器主机地址 | `--host 192.168.1.1` |
| `--port` | `-p` | SSH 服务器端口 | `--port 22` |
| `--username` | `-u` | SSH 用户名 | `--username root` |
| `--password` | `-w` | SSH 密码 | `--password pwd123` |
| `--privateKey` | `-k` | SSH 私钥文件路径 | `--privateKey ~/.ssh/id_rsa` |
| `--passphrase` | `-P` | 私钥密码 | `--passphrase pwd123` |
| `--whitelist` | `-W` | 命令白名单（正则表达式，逗号分隔） | `--whitelist "^ls,^cat,^df"` |
| `--blacklist` | `-B` | 命令黑名单（正则表达式，逗号分隔） | `--blacklist "^rm,^shutdown"` |
| `--socksProxy` | `-s` | SOCKS 代理地址 | `--socksProxy socks://user:pass@host:port` |

### 🚀 快速开始示例

#### HTTP/SSE 模式（推荐用于远程部署）

```bash
# 从 ~/.ssh/config 自动加载 SSH 配置
npm run build
node build/index.js --http-port 8080

# 加载特定 SSH 配置
node build/index.js --http-port 8080 --ssh-config myserver

# 多个连接
node build/index.js --http-port 8080 \
  --ssh "name=prod,host=prod.com,port=22,user=admin,password=pass" \
  --ssh "name=dev,host=dev.com,port=22,user=dev,privateKey=~/.ssh/id_ed25519"

# 带命令白名单（推荐）
node build/index.js --http-port 8080 \
  --ssh "name=server,host=example.com,port=22,user=root,password=pass" \
  --ssh whitelist="ls|cat|grep|pwd|echo"
```

#### stdio 模式（默认，向后兼容）

```bash
# 使用密码
npx -y @fangjunjie/ssh-mcp-server \
  --host 192.168.1.1 \
  --port 22 \
  --username root \
  --password pwd123456

# 使用私钥
npx -y @fangjunjie/ssh-mcp-server \
  --host 192.168.1.1 \
  --port 22 \
  --username root \
  --privateKey ~/.ssh/id_rsa

# 多个 SSH 连接
npx -y @fangjunjie/ssh-mcp-server \
  --ssh "name=dev,host=1.2.3.4,port=22,user=alice,password=xxx" \
  --ssh "name=prod,host=5.6.7.8,port=22,user=bob,password=yyy"
```

### 📋 MCP 配置示例

> **⚠️ 重要提示**: 在 MCP 配置文件中，每个命令行参数和其值必须是 `args` 数组中的独立元素。不要用空格将它们连接在一起。例如，使用 `"--host", "192.168.1.1"` 而不是 `"--host 192.168.1.1"`。

#### 使用密码

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

#### 使用私钥

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

#### 使用命令白名单和黑名单

**白名单示例**（推荐）：

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

**黑名单示例**：

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

> **注意**：如果同时指定了白名单和黑名单，系统会先检查命令是否在白名单中，然后再检查是否在黑名单中。命令必须同时通过两项检查才能被执行。

### 💻 HTTP 客户端集成

#### JavaScript/TypeScript

```typescript
import fetch from "node-fetch";

// 初始化会话
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

// 列出工具
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

// 监听服务器推送（SSE）
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

# 初始化会话
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

# 发送后续请求
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

### 🌐 HTTP 端点（HTTP/SSE 模式）

- `POST /mcp` - 主要 MCP 协议通信端点
  - 首次请求：初始化会话（不需要会话 ID）
  - 后续请求：包含 `mcp-session-id` 头部
- `GET /mcp` - 服务器推送事件（SSE）端点，用于通知
  - 必需头部：`mcp-session-id: <sessionId>`
- `DELETE /mcp` - 终止会话端点
  - 必需头部：`mcp-session-id: <sessionId>`

### 🧩 多 SSH 连接用法

使用多个 SSH 连接时，通过 `connectionName` 参数指定连接名称：

```json
{
  "tool": "execute-command",
  "params": {
    "cmdString": "ls -al",
    "connectionName": "prod"
  }
}
```

### ⏱️ 命令执行超时

`execute-command` 工具支持超时选项，防止命令无限期挂起：

- **timeout**: 命令执行超时时间（毫秒，默认为 30000ms）

示例：

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

这对于像 `ping`、`tail -f` 或其他可能阻塞执行的长时间运行进程特别有用。

### 🗂️ 列出所有 SSH 服务器

```json
{
  "tool": "list-servers",
  "params": {}
}
```

返回示例：

```json
[
  { "name": "dev", "host": "1.2.3.4", "port": 22, "username": "alice" },
  { "name": "prod", "host": "5.6.7.8", "port": 22, "username": "bob" }
]
```

## 🛡️ 安全考虑

此服务器提供了强大的功能来在远程服务器上执行命令和传输文件。为了确保安全使用，请考虑以下几点：

- **命令白名单**：*强烈建议*使用 `--whitelist` 选项限制可执行的命令集。没有白名单，远程服务器上的任何命令都可以执行，这可能是重大的安全风险。
- **私钥安全**：服务器将 SSH 私钥读入内存。确保运行 `ssh-mcp-server` 的机器是安全的。不要将服务器暴露在不信任的网络中。
- **拒绝服务（DoS）**：服务器没有内置的速率限制。攻击者可能通过向服务器发送大量连接请求或大文件传输来发起 DoS 攻击。建议在具有速率限制功能的防火墙或反向代理后运行服务器。
- **路径遍历**：服务器对本地文件系统具有内置的路径遍历攻击保护。但是，在 `upload` 和 `download` 命令中使用的路径仍需谨慎。
- **HTTPS 部署**：对于使用 HTTP 模式的生产环境，建议在启用 HTTPS 的反向代理（例如 Nginx）后部署。
- **防火墙配置**：仅允许受信任的 IP 地址访问 HTTP 端口。
- **CORS 配置**：服务器配置了宽松的 CORS 头以用于开发。在生产环境中根据需要审查和限制。

## 📋 系统要求

- **Node.js**：>= 18.x
- **MCP 协议版本**：2024-11-05
- **SSH 服务器**：任何标准 SSH 服务器（OpenSSH 等）

## 🔧 故障排除

### 端口已被占用
```
Error: EADDRINUSE: address already in use :::8080
```
**解决方案**：使用不同的端口
```bash
node build/index.js --http-port 3000
```

### CORS 错误
```
Access to fetch at 'http://localhost:8080/mcp' from origin...
```
**解决方案**：确保客户端发送正确的 Accept 头部：
```javascript
"Accept": "application/json, text/event-stream"
```

### SSH 连接失败
**解决方案**：验证 SSH 凭据、网络连接和配置：
- 检查 `~/.ssh/config` 的正确设置
- 验证用户名、密码或私钥
- 手动测试 SSH 连接：`ssh user@host`

### 缺少会话 ID
```
Bad Request: No valid session ID provided
```
**解决方案**：确保初始化请求成功，并在后续请求中使用返回的 `sessionId`

## 📄 许可证

MIT

## 🚀 更多资源

- [MCP 协议规范](https://modelcontextprotocol.io)
- [MCP SDK 文档](https://github.com/modelcontextprotocol/sdk)
- [GitHub 仓库](https://github.com/classfang/ssh-mcp-server)
- [NPM 包](https://www.npmjs.com/package/@fangjunjie/ssh-mcp-server)

---

**当前版本**：v1.2.3 | **Node.js**：>= 18.x | **MCP 协议**：2024-11-05
