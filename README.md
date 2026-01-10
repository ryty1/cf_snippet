# [Sinppets 文件](https://github.com/ryty1/cf_snippet/blob/main/snippet%E5%A4%9ASocks%E8%90%BD%E5%9C%B0(%E6%8E%A8%E8%8D%90%E7%89%88%E6%9C%AC).js) 配置说明

## 🛠️ 变量修改设置

请在脚本顶部修改以下变量：

### 基本设置
1. **修改 T (UUID) 为您自己的 UUID**
   ```javascript
   const T = '4bc511be-7d08-4487-966b-12f40fd5014a';
   ```

2. **设置 PW 为强密码（或留空禁用密码）**
   ```javascript
   const PW = 'abc123456';  // 默认
   ```

3. **（可选）修改 FA 和 FP 回退地址**
   ```javascript
   const FA = 'ProxyIP.cmliussss.net'; // 回退域名
   const FP = '443';                 // 回退端口
   ```

### 节点配置

4. **配置 SC 数组，添加 SOCKS5 落地**
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

5. **配置 DD 数组，按格式添加您的优选域名**
   ```javascript
   const DD = [
       { domain: "cf.sk8.de5.net" },
       { domain: "cf.090227.xyz" }
   ];
   ```

## 🌐 面板访问

配置完成后，您的面板地址为：
```
https://您的域名
```

---
## 🛠️[进阶配置] Github 远程配置，，突破 Sinppets 32KB 大小限制，有效配置将`覆盖`脚本中的配置，`优先级`！

### 1. 创建 GitHub 私有仓库

1. 登录 GitHub，点击右上角 **+** -> **New repository**
2. Repository name 填入 `sinppets-config`（或任意名称）
3. **关键步骤**：勾选 **Private**（私有）
4. 点击 **Create repository**
5. 点击 **uploading an existing file** 上传您的 `config.json`
```javascript
// 您的 config.json 原始链接
const CU = 'https://raw.githubusercontent.com/用户名/仓库名/main/config.json';

// 您的 GitHub Token (私有仓库必需，公开仓库可留空)
// ⚠️ 私有仓库必填，且 Token 需勾选 'repo' 权限
const GT = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

### 2. 获取访问授权 (Token)

私有仓库必须配置 Token 才能访问：

1. 访问 [**GitHub Tokens 设置页**](https://github.com/settings/tokens)
2. 点击右上角 **Generate new token** -> **Generate new token (classic)**
3. **Note** (备注): 随便填，例如 `sinppets`
4. **Scopes** (权限): ⚠️ **必须勾选 `repo`** (Full control of private repositories)
5. 点击页面底部 **Generate token**
6. **复制生成的以 `ghp_` 开头的字符串** (关掉页面就看不到了！)

### 3. 获取配置文件链接 (CU)

1. 在您的私有仓库中，点击 `config.json` 文件
2. 点击右上角的 **Raw** 按钮
3. 复制浏览器地址栏中的链接
   - 格式应为: `https://raw.githubusercontent.com/用户名/仓库名/main/config.json`
   - 注意：如果链接包含 `?token=...`，请**去掉**问号及后面的所有内容，只保留 `.json` 结尾。

---

### 4. 最终配置代码

将以下代码替换 `sinpetts.js` 顶部的变量设置：

```javascript
// 【必须】您的 config.json 原始 Raw 链接 (去掉 ?token=...)
const CU = 'https://raw.githubusercontent.com/用户名/仓库名/main/config.json';

// 【必须】您的 GitHub Token (必须勾选 repo 权限)
const GT = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

### 2. config.json 格式示例
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


<img width="1004" height="651" alt="image" src="https://github.com/user-attachments/assets/a8abdda9-7bdd-4184-bf71-2cd4b39e665a" />

<img width="1456" height="756" alt="image" src="https://github.com/user-attachments/assets/38edb9e0-bca9-49c6-b283-5345a1946ffc" />

<img width="542" height="157" alt="image" src="https://github.com/user-attachments/assets/c6667e11-ab56-433c-b10e-2be2ff028267" />

<img width="1125" height="869" alt="image" src="https://github.com/user-attachments/assets/6f5ad951-8f0d-4b94-b456-080f88f05e74" />

<img width="1136" height="890" alt="image" src="https://github.com/user-attachments/assets/2e3464cc-a924-4e8f-878a-f717014011cd" />

<img width="1163" height="891" alt="image" src="https://github.com/user-attachments/assets/999903db-0b7c-4254-9c4d-64958be37188" />
