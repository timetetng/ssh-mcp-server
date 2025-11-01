import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { SSHConfig, SshConnectionConfigMap } from "../models/types.js";

/**
 * SSH Config Loader utility
 * Loads SSH configurations from ~/.ssh/config and ~/.ssh/id_rsa
 */
export class SshConfigLoader {
  /**
   * Load SSH config from ~/.ssh/config
   */
  private static parseSshConfig(): Record<string, SSHConfig> {
    const sshDir = join(homedir(), ".ssh");
    const configPath = join(sshDir, "config");

    if (!existsSync(configPath)) {
      return {};
    }

    const configContent = readFileSync(configPath, "utf-8");
    const configs: Record<string, SSHConfig> = {};

    let currentHost = "";
    let currentConfig: Partial<SSHConfig> = {};

    const lines = configContent.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      // Match Host directive
      const hostMatch = trimmedLine.match(/^Host\s+(.+)$/i);
      if (hostMatch) {
        // Save previous config if exists
        if (currentHost && currentConfig.host) {
          configs[currentHost] = currentConfig as SSHConfig;
        }

        currentHost = hostMatch[1].trim();
        currentConfig = {
          name: currentHost,
          port: 22, // Default port
        };
        continue;
      }

      // Match other directives
      const match = trimmedLine.match(/^(\w+)\s+(.+)$/);
      if (match) {
        const [, key, value] = match;
        const lowerKey = key.toLowerCase();

        switch (lowerKey) {
          case "hostname":
            currentConfig.host = value.trim();
            break;
          case "port":
            currentConfig.port = parseInt(value.trim(), 10);
            break;
          case "user":
            currentConfig.username = value.trim();
            break;
          case "identityfile":
            // Store the private key path
            const keyPath = value.trim().startsWith("~")
              ? value.trim().replace("~", homedir())
              : value.trim();
            currentConfig.privateKey = keyPath;
            break;
          case "identityfile":
            // Handle multiple identity files
            if (!currentConfig.privateKey) {
              const keyPath = value.trim().startsWith("~")
                ? value.trim().replace("~", homedir())
                : value.trim();
              currentConfig.privateKey = keyPath;
            }
            break;
          case "proxycommand":
            // Store proxy command if needed
            currentConfig.socksProxy = value.trim();
            break;
        }
      }
    }

    // Save last config
    if (currentHost && currentConfig.host) {
      configs[currentHost] = currentConfig as SSHConfig;
    }

    return configs;
  }

  /**
   * Load default private key from ~/.ssh/id_rsa or ~/.ssh/id_ed25519
   */
  private static getDefaultPrivateKey(): string | undefined {
    const sshDir = join(homedir(), ".ssh");
    const commonKeys = [
      "id_rsa",
      "id_ed25519",
      "id_ecdsa",
      "id_ecdsa_sk",
      "id_ed25519_sk",
    ];

    for (const keyName of commonKeys) {
      const keyPath = join(sshDir, keyName);
      if (existsSync(keyPath)) {
        return keyPath;
      }
    }

    return undefined;
  }

  /**
   * Load SSH configurations
   * @returns Map of connection configurations
   */
  public static loadSshConfigs(): SshConnectionConfigMap {
    const configs = this.parseSshConfig();
    const result: SshConnectionConfigMap = {};

    // Add configs from ~/.ssh/config
    for (const [name, config] of Object.entries(configs)) {
      // Get default private key if not specified
      if (!config.privateKey) {
        const defaultKey = this.getDefaultPrivateKey();
        if (defaultKey) {
          config.privateKey = defaultKey;
        }
      }

      result[name] = config;
    }

    // If no configs found, try to load default connection
    if (Object.keys(result).length === 0) {
      const defaultKey = this.getDefaultPrivateKey();
      if (defaultKey) {
        result["default"] = {
          name: "default",
          host: "localhost",
          port: 22,
          username: process.env.USER || process.env.USERNAME || "root",
          privateKey: defaultKey,
        };
      }
    }

    return result;
  }

  /**
   * List available SSH configurations
   * @returns Array of connection names
   */
  public static listAvailableConfigs(): string[] {
    const configs = this.loadSshConfigs();
    return Object.keys(configs);
  }
}
