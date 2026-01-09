## 变量修改设置
- 修改 `T` (UUID) 为您自己的 UUID
- 设置 `PW` 为强密码（或留空禁用密码）
- 配置 `SC` 数组，添加 SOCKS5 落地

```bash
// 启用 socks5 落地，可按格式添加：
const SC = [
    { region: '新加坡', config: 'user:password@ip:port' },
    { region: '香  港', config: 'user:password@ip:port' }
];

或者

const SC = [{ region: '新加坡', config: 'user:password@ip:port' }, { region: '香  港', config: 'user:password@ip:port' }];

// 不启用socks5 ：
const SC = [];
```
- 配置 `PI` 数组，添加 ProxyIP 落地

```bash
// 启用 ProxyIP 落地，可按格式添加：
const PI = [{ region: '新加坡', config: '123.123.123.123' }, { region: '香  港', config: '123.123.123.123' }];

// 不启用 `ProxyIP` 落地 ：
const PI = [];
```

-  配置 `DD` 数组，按格式添加您的优选域名
- （可选）修改 `FA` 和 `FP` 回退地址
-  面板地址：`https://域名`

<img width="1004" height="651" alt="image" src="https://github.com/user-attachments/assets/a8abdda9-7bdd-4184-bf71-2cd4b39e665a" />

<img width="1456" height="756" alt="image" src="https://github.com/user-attachments/assets/38edb9e0-bca9-49c6-b283-5345a1946ffc" />

<img width="542" height="157" alt="image" src="https://github.com/user-attachments/assets/c6667e11-ab56-433c-b10e-2be2ff028267" />

<img width="1125" height="869" alt="image" src="https://github.com/user-attachments/assets/6f5ad951-8f0d-4b94-b456-080f88f05e74" />

<img width="1136" height="890" alt="image" src="https://github.com/user-attachments/assets/2e3464cc-a924-4e8f-878a-f717014011cd" />

<img width="1163" height="891" alt="image" src="https://github.com/user-attachments/assets/999903db-0b7c-4254-9c4d-64958be37188" />
