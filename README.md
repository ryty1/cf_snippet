> **【说明】**：脚本非原创，修改自 [老王](https://github.com/eooce/Cloudflare-proxy) 和 [CM大佬](https://github.com/cmliu/CF-Workers-BPSUB)脚本，个人自用修改版。
---
# Sinppets 文件[[vless](https://github.com/ryty1/cf_snippet/blob/main/vless.js)] / [[shadowsocks](https://github.com/ryty1/cf_snippet/blob/main/shadowsocks.js)] 配置说明
---
## 🛠️ 变量修改设置（vless与ss脚本使用方法完全一致）

请在脚本顶部修改以下变量：

### 基本设置
1. **修改 T (UUID) 为您自己的 UUID**
   ```javascript
   const T = '4bc511be-7d08-4487-966b-12f40fd5014a';
   ```

2. **设置登陆密码 PW 为强密码（或留空禁用密码）**
   ```javascript
   const PW = 'abc123456';  // 默认
   ```
3. **【可选】Github远程配置，不用可不配置，默认即可，需要配置请按下面 [进阶配置](#进阶配置) 操作**

   ```javascript
   // 【注意】config.json 原始 Raw 链接 (去掉 ?token=...)
   const CU = 'https://raw.githubusercontent.com/用户名/仓库名/main/config.json';

   // 【注意】您的 GitHub Token (必须勾选 repo 权限)
   const GT = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
   ```

4. **（可选）修改 FA 和 FP 回退地址**
   ```javascript
   const FA = 'ProxyIP.cmliussss.net'; // 回退域名
   const FP = '443';                 // 回退端口
   ```

### 节点配置(可选Github配置，脚本保持默认，无Github配置可在脚本中按需配置)

5. **配置 SC 数组，添加 SOCKS5 落地**，[Github 远程配置可默认不填]
   ```javascript
   // 启用 socks5 落地，可按格式添加：
   const SC = [
       { region: '新加坡', config: 'user:password@ip:port' },
       { region: '香  港', config: 'user:password@ip:port' }
   ];
   
   // 或者单行格式：
   const SC = [{ region: '新加坡', config: 'user:password@ip:port' }, { region: '香  港', config: 'user:password@ip:port' }];
   
   // 不启用socks5 ：
   const SC = [];
   ```

6. **配置 DD 数组，按格式添加您的优选域名**，[Github 远程配置可默认不填]
   ```javascript
   const DD = [
       { domain: "cf.877774.xyz" },
       { domain: "cf.090227.xyz" }
   ];
   ```

## 🌐 面板访问

配置完成后，您的面板地址为：
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

### 3. 获取配置文件链接 (CU)

1. 在您的私有仓库中，新建编辑 `config.json` 文件， config.json 格式示例
   
```json
{
  "socks": [
    { "region": "新加坡", "config": "user:pass@1.2.3.4:12345" },
    { "region": "香港", "config": "user:pass@1.2.3.4:12345" },
    { "region": "日本", "config": "user:pass@1.2.3.4:12345" }
  ],
  "domains": [
    { "domain": "cf.090227.xyz" },
    { "domain": "cf.877771.xyz" },
    { "domain": "freeyx.cloudflare88.eu.org" }
  ]
}
```
2. 点击右上角的 **Raw** 按钮
3. 复制浏览器地址栏中的链接
   - 格式应为: `https://raw.githubusercontent.com/用户名/仓库名/main/config.json`
   - 注意：如果链接包含 `?token=...`，请**去掉**问号及后面的所有内容，只保留 `.json` 结尾。
4. **配置脚本**
      ```javascript
   const CU = 'https://raw.githubusercontent.com/用户名/仓库名/main/config.json';
   ```

---

<img width="532" height="350" alt="image" src="https://github.com/user-attachments/assets/6447f9b4-d958-463e-b37b-fbd68387ac05" />

---

<img width="1144" height="780" alt="image" src="https://github.com/user-attachments/assets/536a1d33-1dc5-44c4-a23d-645dd432c6cf" />

---

<img width="938" height="663" alt="image" src="https://github.com/user-attachments/assets/fedacb8c-124e-4389-bc21-0327f42a6510" />

---

<img width="531" height="250" alt="image" src="https://github.com/user-attachments/assets/58019867-c9f0-4c48-9218-0dd018842795" />

---

<img width="589" height="208" alt="image" src="https://github.com/user-attachments/assets/fe7867c8-7e20-4816-8407-49e876a89598" />

---

<img width="1125" height="869" alt="image" src="https://github.com/user-attachments/assets/6f5ad951-8f0d-4b94-b456-080f88f05e74" />

---

<img width="1136" height="890" alt="image" src="https://github.com/user-attachments/assets/2e3464cc-a924-4e8f-878a-f717014011cd" />

---

<img width="1163" height="891" alt="image" src="https://github.com/user-attachments/assets/999903db-0b7c-4254-9c4d-64958be37188" />
