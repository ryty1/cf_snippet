# Cloudflare Workers KV 配置管理系统

一套基于 Cloudflare Workers 和 KV 存储的 VLESS/Shadowsocks 代理配置管理系统。通过 KV 存储实现配置的集中管理和实时同步。

## 📁 项目结构

| 文件 | 部署方式 | 说明 |
|------|----------|------|
| `config-manager-kv.js` | Workers | 配置管理中心，需绑定 KV |
| `vless-kv.js` | Snippets (片段) | VLESS 代理订阅服务 |
| `shadowsocks-kv.js` | Snippets (片段) | Shadowsocks 代理订阅服务 |

## 🚀 快速部署

### 1️⃣ 部署 config-manager-kv.js (Workers + KV)

这是配置管理中心，用于统一管理 SOCKS 代理和优选域名配置。

#### 步骤一：创建 KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 `Workers & Pages` → `KV`
3. 点击 `Create a namespace`
4. 命名空间名称填写：`CONFIG_KV`（或其他名称）
5. 点击 `Add` 创建

#### 步骤二：创建 Worker

1. 进入 `Workers & Pages` → `Create`
2. 选择 `Create Worker`
3. 为 Worker 命名（如：`config-manager`）
4. 点击 `Deploy` 创建
5. 点击 `Edit code`，将 `config-manager-kv.js` 的内容粘贴进去
6. 点击 `Deploy` 保存

#### 步骤三：绑定 KV 变量

1. 进入刚创建的 Worker 设置页面
2. 点击 `Settings` → `Bindings`
3. 点击 `Add` → `KV Namespace`
4. **Variable name** 填写：`CONFIG_KV`（必须与代码中一致）
5. **KV namespace** 选择步骤一创建的 KV 命名空间
6. 点击 `Save` 保存

> ⚠️ **重要**：Variable name 必须填写 `CONFIG_KV`，这是代码中使用的变量名。

#### 步骤四：修改配置

编辑代码中的以下变量：

```javascript
const PW = 'abc123456';            // 登录密码
const AS = '24bb-49aa-9c37';       // 调用验证密钥（务必修改）
const VU = '';                     // vless-kv.js 的部署地址
const SU = '';                     // shadowsocks-kv.js 的部署地址
```

---

### 2️⃣ 部署 vless-kv.js (Snippets 片段)

VLESS 代理订阅服务，从 config-manager 同步配置。

#### 步骤一：创建 Snippet 片段

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的域名
3. 进入 `Rules` → `Snippets`
4. 点击 `Create snippet`
5. 命名片段（如：`vless-kv`）
6. 将 `vless-kv.js` 的内容粘贴进去

#### 步骤二：修改配置

```javascript
const T = 'e4d59882-dbac-426b-ae64-5abed091b6be';  // UUID (务必修改)
const FA = 'ProxyIP.cmliussss.net';                 // ProxyIP 地址
const FP = '443';                                   // ProxyIP 端口
const CU = '';                                      // config-manager-kv.js 的部署地址
const AS = '24bb-49aa-9c37';                        // 与 config-manager 中的密钥一致
const SB = '';                                      // clash 订阅后端地址
const PW = 'abc123456';                             // 密码
```

---

### 3️⃣ 部署 shadowsocks-kv.js (Snippets 片段)

Shadowsocks 代理订阅服务，从 config-manager 同步配置。

#### 步骤一：创建 Snippet 片段

1. 选择你的域名
2. 进入 `Rules` → `Snippets`
3. 点击 `Create snippet`
4. 命名片段（如：`shadowsocks-kv`）
5. 将 `shadowsocks-kv.js` 的内容粘贴进去

#### 步骤二：修改配置

```javascript
let T = '5dc15e15-f285-4a9d-959b-0e4fbdd77b63';    // Token (务必修改)
const CU = '';                                      // config-manager-kv.js 的部署地址
const AS = '24bb-49aa-9c37';                        // 与 config-manager 中的密钥一致
const SB = '';                                      // clash 订阅后端地址
const PW = 'abc123456';                             // 密码
```

#### 步骤三：配置触发规则

同 vless-kv.js 的步骤三。

---

## 🔗 配置同步

配置完成后，需要将各服务地址填写到对应位置：

1. **config-manager-kv.js** 中：
   - `VU`：填写 vless-kv.js 部署完成后的访问地址
   - `SU`：填写 shadowsocks-kv.js 部署完成后的访问地址

2. **vless-kv.js** 和 **shadowsocks-kv.js** 中：
   - `CU`：填写 config-manager-kv.js 部署完成后的访问地址

3. **确保 `AS` 密钥一致**：三个文件中的 `AS` 验证密钥必须相同

---

## 📖 使用说明

### 访问配置管理

访问 config-manager 时需要带上来源参数：
- VLESS: `https://your-worker.workers.dev/?from=vless`
- SS: `https://your-worker.workers.dev/?from=ss`

也可以从 vless-kv 或 shadowsocks-kv 的页面点击「配置」按钮进入。

### 管理功能

- **优选域名管理**：添加、编辑、删除优选 CF 域名
- **SOCKS 代理管理**：添加、编辑、删除 SOCKS5 代理配置
- **拖拽排序**：支持拖拽调整配置顺序
- **批量操作**：支持全选、批量删除
- **导入/导出**：支持 JSON 格式配置导入

### 订阅地址

部署完成后，通过对应服务的根路径生成订阅：
- **VLESS 订阅**：`https://your-vless-domain.com/{uuid前缀}`
- **Shadowsocks 订阅**：`https://your-ss-domain.com/sub/{token前缀}`

支持 `?clash` 参数获取 Clash 格式订阅。

---

## ⚙️ 配置项说明

### 通用配置

| 变量 | 说明 | 示例 |
|------|------|------|
| `PW` | 登录密码 | `'abc123456'` |
| `AS` | API 验证密钥 | `'24bb-49aa-9c37'` |
| `CU` | config-manager 地址 | `'https://xxx.workers.dev'` |
| `SB` | Clash 订阅后端 | 可留空使用默认 |

### VLESS 专用

| 变量 | 说明 |
|------|------|
| `T` | VLESS UUID |
| `FA` | 回落 ProxyIP |
| `FP` | 回落端口 |

### Shadowsocks 专用

| 变量 | 说明 |
|------|------|
| `T` | Token |
| `sP` | 订阅路径前缀 |
| `pI` | 回落 ProxyIP |

---

## 🔐 安全建议

1. **修改默认密码**：务必修改 `PW` 为强密码
2. **修改验证密钥**：务必修改 `AS` 为随机字符串
3. **修改 UUID/Token**：不要使用示例中的 UUID 或 Token
4. **使用 HTTPS**：确保所有服务通过 HTTPS 访问


---

## 📝 注意事项

1. **KV 绑定名称**：必须为 `CONFIG_KV`
2. **配置实时生效**：修改配置后立即生效，无需重启
3. **SOCKS 验证**：每个 SOCKS 节点都有唯一的安全密钥
4. **Snippets 限制**：Snippets 有一定的代码大小限制（100KB）

---

