> **【说明】**：脚本非原创，修改自 [老王](https://github.com/eooce/Cloudflare-proxy) 和 [CM大佬](https://github.com/cmliu/CF-Workers-BPSUB)脚本，个人自用修改版。感谢各位大佬的技术奉献！
---
# Snippets 文件[[vless](https://github.com/ryty1/cf_snippet/blob/main/vless.js)] / [[shadowsocks](https://github.com/ryty1/cf_snippet/blob/main/shadowsocks.js)] / [[config-manager](https://github.com/ryty1/cf_Snippets/blob/main/Config-Manager.js) 配置说明
---
## 🛠️ 变量修改设置（vless与ss脚本使用方法完全一致）

请在脚本顶部修改以下变量：

### 基本设置
1. **修改 T (UUID) 为您自己的 UUID**
   ```javascript
   const T = '4bc511be-7d08-4487-966b-12f40fd5014a';
   ```
   
2. **修改 默认登录密码 为您自己的 密码**
   ```javascript
   const PW = 'abc123456';  // 默认
   ```

3. **修改 Clash转换 后端**
   ```javascript
   const SB = 'https://123.abc.com';  // 下面 workers / pages 项目域名地址，不填默认内置老王的订阅转换，
   ```
   > Clash转换后端配套定制[clash-sub-converter](https://github.com/ryty1/clash-sub-converter)项目，Fork本项目，直接 `cloudflare workers / pages` 部署，不用其他任何设置。
   
4. **【可选】Github远程配置，不用可不配置，默认即可，需要配置请按下面 [进阶配置](#进阶配置) 操作**
   
   ```
   https://您的域名
   ```

---
## 进阶配置

## 🛠️ Github 远程配置，突破 Sinppets 32KB 大小限制，有效配置将`覆盖`脚本中的配置，`优先级`！

### 1. 创建 GitHub 私有仓库

1. 登录 [GitHub](https://github.com/)，点击右上角 **+** -> **New repository**
2. **Repository name** 填入 `sinppets-config`（或任意名称）
3. **关键步骤**：勾选 **Private**（私有）
4. 点击 **Create repository**

### 2. 获取访问授权 (Token)

私有仓库必须配置 Token 才能访问：

1. 访问 [**GitHub Tokens 设置页**](https://github.com/settings/tokens)
2. 点击右上角 **Generate new token** -> **Generate new token (classic)**
3. **Note** (备注): 随便填，例如 `sinppets`
4. **Scopes** (权限): ⚠️ **必须勾选 `repo`** (Full control of private repositories)
5. 点击页面底部 **Generate token**
6. **复制生成的以 `ghp_` 开头的字符串** (关掉页面就看不到了！)
7. **配置脚本变量**
   ```javascript
   const GT = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
   ```

> 【注意】您的 GitHub Token (必须勾选 repo 权限)

8. **vless.js / shadowsocks.js 片段变量配置**，
   
   ```javascript
   // GitHub API 配置地址 (读取配置,使用 api 格式):
   // 严格按这个格式，只要替换你的 用户名 和 仓库名，其他的不要改。
   const CU = 'https://api.github.com/repos/用户名/仓库名/contents/config.json'; 

   // GitHub Token (必须勾选 repo 权限)
   const GT = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

   // config-manager 片段 项目域名
   const MU = 'https://config-manager-domain.com';

   ```

### 4. 📦 [[config-manager](https://github.com/ryty1/cf_snippet/blob/main/config-manager.js)]  配置管理器（可选）

独立的 GitHub 配置管理面板，支持在线管理 SOCKS5 落地和优选域名配置。

#### 功能特点
- 🔐 支持密码登录保护
- 📝 在线添加/编辑/删除 SOCKS5 配置和优选域名
- 🔄 拖拽排序功能
- 📥 支持 JSON 文件批量导入
- ✅ 实时检测 SOCKS5 在线状态
- 💾 自动同步保存到 GitHub 私有仓库

#### **config-manager** 片段变量配置 ，VU / SU 变量 可全选或者2选1的配置
   ```javascript
   // GitHub API 配置地址 (读取配置,使用 api 格式):
   const CU = 'https://api.github.com/repos/用户名/仓库名/contents/config.json';

   // GitHub Token (必须勾选 repo 权限)
   const GT = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

   // VLESS 订阅 片段 项目域名 (非必选)
   const VU = 'https://your-vless-domain.com';

   // Shadowsocks 订阅 片段 项目域名 (非必选)
   const SU = 'https://your-ss-domain.com';

   // 登录密码
   const PW = 'your_password';

   ```


---

## 🔗 快速部署

1. 在 Cloudflare Dashboard 创建三个 Snippets 片段
2. 分别部署 `vless.js`、`shadowsocks.js`、`config-manager.js`
3. 修改各脚本的变量配置
4. 绑定自定义域名（可选）
5. 访问域名即可使用


---

<img width="1910" height="892" alt="image" src="https://github.com/user-attachments/assets/6447f9b4-d958-463e-b37b-fbd68387ac05" />

---

<img width="1910" height="892" alt="image" src="https://github.com/user-attachments/assets/032e0459-c903-4bb5-9574-e5abc0891fae" />

---

<img width="1910" height="487" alt="image" src="https://github.com/user-attachments/assets/022fb0f4-f568-4bb0-9a2e-7f8fec9b7797" />

---

<img width="1910" height="500" alt="image" src="https://github.com/user-attachments/assets/3d81a95a-b894-47be-8364-b12fc8622ee2" />


---

<img width="1910" height="500" alt="image" src="https://github.com/user-attachments/assets/cb8d0ead-b3d4-4f9c-a97e-9fed155f2891" />


---

<img width="1910" height="892" alt="image" src="https://github.com/user-attachments/assets/6f5ad951-8f0d-4b94-b456-080f88f05e74" />

---

<img width="1910" height="892" alt="image" src="https://github.com/user-attachments/assets/2e3464cc-a924-4e8f-878a-f717014011cd" />

---

<img width="1910" height="892" alt="image" src="https://github.com/user-attachments/assets/999903db-0b7c-4254-9c4d-64958be37188" />
