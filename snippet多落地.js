import { connect } from 'cloudflare:sockets';

// --- 硬编码配置 ---
// UUID，同时用作订阅路径。
const authToken = '952513cf-46db-41b3-a2db-384557432136';
// 用来访问cloudflare托管的网站
const fallbackAddress = 'ProxyIP.cmliussss.net';
const fallbackPort = '443';
// 前端访问密码（留空则不需要密码）
const accessPassword = '';

// 多SOCKS5配置，格式: { region: '地区名称', config: 'user:pass@host:port' }
const socks5Configs = [
    { region: '地区名称1', config: 'user:pass@host:port' },
    { region: '地区名称2', config: 'user:pass@host:port' }
    // 可以继续添加更多SOCKS配置
];

// 域名列表
const directDomains = [
    { domain: "cf.090227.xyz" },
    { domain: "freeyx.cloudflare88.eu.org" },
    { domain: "cf.877774.xyz" }
    // 可以继续添加更多SOCKS配置
];

const E_INVALID_DATA = atob('aW52YWxpZCBkYXRh');
const E_INVALID_USER = atob('aW52YWxpZCB1c2Vy');
const E_UNSUPPORTED_CMD = atob('Y29tbWFuZCBpcyBub3Qgc3VwcG9ydGVk');
const E_UDP_DNS_ONLY = atob('VURQIHByb3h5IG9ubHkgZW5hYmxlIGZvciBETlMgd2hpY2ggaXMgcG9ydCA1Mw==');
const E_INVALID_ADDR_TYPE = atob('aW52YWxpZCBhZGRyZXNzVHlwZQ==');
const E_EMPTY_ADDR = atob('YWRkcmVzc1ZhbHVlIGlzIGVtcHR5');
const E_WS_NOT_OPEN = atob('d2ViU29ja2V0LmVhZHlTdGF0ZSBpcyBub3Qgb3Blbg==');
const E_INVALID_ID_STR = atob('U3RyaW5naWZpZWQgaWRlbnRpZmllciBpcyBpbnZhbGlk');
const E_INVALID_SOCKS_ADDR = atob('SW52YWxpZCBTT0NLUyBhZGRyZXNzIGZvcm1hdA==');
const E_SOCKS_NO_METHOD = atob('bm8gYWNjZXB0YWJsZSBtZXRob2Rz');
const E_SOCKS_AUTH_NEEDED = atob('c29ja3Mgc2VydmVyIG5lZWRzIGF1dGg=');
const E_SOCKS_AUTH_FAIL = atob('ZmFpbCB0byBhdXRoIHNvY2tzIHNlcnZlcg==');
const E_SOCKS_CONN_FAIL = atob('ZmFpbCB0byBvcGVuIHNvY2tzIGNvbm5lY3Rpb24=');

const ADDRESS_TYPE_IPV4 = 1;
const ADDRESS_TYPE_URL = 2;
const ADDRESS_TYPE_IPV6 = 3;

export default {
    async fetch(request, env, ctx) {
        try {
            const subPath = authToken;
            const url = new URL(request.url);

            if (request.headers.get('Upgrade') === 'websocket') {
                return await handleWsRequest(request);
            } else if (request.method === 'GET') {
                if (url.pathname === '/') {
                    return new Response(getFilterHTML(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                }
                if (url.pathname.toLowerCase().includes(`/${subPath}`)) {
                    return await handleSubscriptionRequest(request, authToken);
                }
            }
            return new Response('Not Found', { status: 404 });
        } catch (err) {
            return new Response(err.toString(), { status: 500 });
        }
    },
};

async function handleSubscriptionRequest(request, uuid) {
    const url = new URL(request.url);
    const finalLinks = [];
    const workerDomain = url.hostname;

    // 获取筛选参数
    const filters = {
        domains: url.searchParams.get('domains')?.split(',') || [],
        ports: url.searchParams.get('ports')?.split(',') || []
    };

    // 生成节点
    const domainList = filters.domains.length > 0
        ? directDomains.filter(d => filters.domains.some(sel => d.domain.toLowerCase().includes(sel.toLowerCase())))
        : directDomains;

    // 为每个域名和每个SOCKS配置生成节点
    finalLinks.push(...generateLinksFromDomains(domainList, uuid, workerDomain, filters));

    // 确保有节点数据
    if (finalLinks.length === 0) {
        return new Response('No nodes available', { status: 404 });
    }

    // 正确处理UTF-8编码的Base64
    const subscriptionText = finalLinks.join('\n');
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(subscriptionText);
    const subscriptionContent = btoa(String.fromCharCode(...utf8Bytes));

    return new Response(subscriptionContent, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
    });
}

function generateLinksFromDomains(domainList, uuid, workerDomain, filters = {}) {
    const allPorts = [443, 80]; // 只使用443和80端口
    const ports = filters.ports && filters.ports.length > 0
        ? allPorts.filter(p => filters.ports.includes(p.toString()))
        : allPorts;
    const links = [];
    const wsPath = encodeURIComponent('/?ed=2048');
    const proto = 'vless';

    domainList.forEach(item => {
        // 如果有SOCKS配置，为每个SOCKS生成节点
        if (socks5Configs.length > 0) {
            socks5Configs.forEach((socksConfig, socksIndex) => {
                const { region } = socksConfig;

                ports.forEach(port => {
                    const domainName = item.domain; // 使用完整域名
                    const nodeName = `Sinppets-${region}-${domainName}-${port}`;

                    // 创建包含socks参数的WebSocket路径
                    const wsPathWithSocks = encodeURIComponent(`/?ed=2048&socks=${socksIndex}`);

                    const params = new URLSearchParams({
                        encryption: 'none',
                        security: port === 443 ? 'tls' : 'none',
                        type: 'ws',
                        host: workerDomain,
                        path: wsPathWithSocks
                    });

                    if (port === 443) {
                        params.append('sni', workerDomain);
                        params.append('fp', 'randomized');
                    }

                    links.push(`${proto}://${uuid}@${item.domain}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
                });
            });
        } else {
            // 没有SOCKS配置时，使用默认节点名称
            ports.forEach(port => {
                const domainName = item.domain;
                const nodeName = `Sinppets-${domainName}-${port}`;

                const params = new URLSearchParams({
                    encryption: 'none',
                    security: port === 443 ? 'tls' : 'none',
                    type: 'ws',
                    host: workerDomain,
                    path: wsPath
                });

                if (port === 443) {
                    params.append('sni', workerDomain);
                    params.append('fp', 'randomized');
                }

                links.push(`${proto}://${uuid}@${item.domain}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
            });
        }
    });

    return links;
}

async function handleWsRequest(request) {
    // 从查询参数中获取SOCKS配置索引
    const url = new URL(request.url);
    const socksIndex = parseInt(url.searchParams.get('socks') || '0');

    // 解析当前请求对应的SOCKS配置
    let parsedSocks5Config = {};
    let isSocksEnabled = false;

    if (socks5Configs.length > 0 && socksIndex >= 0 && socksIndex < socks5Configs.length) {
        try {
            parsedSocks5Config = parseSocksConfig(socks5Configs[socksIndex].config);
            isSocksEnabled = true;
        } catch (error) {
            console.error('Failed to parse SOCKS5 config:', error.message);
        }
    }

    const wsPair = new WebSocketPair();
    const [clientSock, serverSock] = Object.values(wsPair);
    serverSock.accept();

    let remoteConnWrapper = { socket: null };
    let isDnsQuery = false;

    const earlyData = request.headers.get('sec-websocket-protocol') || '';
    const readable = makeReadableStream(serverSock, earlyData);

    readable.pipeTo(new WritableStream({
        async write(chunk) {
            if (isDnsQuery) return await forwardUDP(chunk, serverSock, null);
            if (remoteConnWrapper.socket) {
                const writer = remoteConnWrapper.socket.writable.getWriter();
                await writer.write(chunk);
                writer.releaseLock();
                return;
            }
            const { hasError, message, addressType, port, hostname, rawIndex, version, isUDP } = parseWsPacketHeader(chunk, authToken);
            if (hasError) throw new Error(message);

            if (isUDP) {
                if (port === 53) isDnsQuery = true;
                else throw new Error(E_UDP_DNS_ONLY);
            }
            const respHeader = new Uint8Array([version[0], 0]);
            const rawData = chunk.slice(rawIndex);

            if (isDnsQuery) return forwardUDP(rawData, serverSock, respHeader);

            await forwardTCP(addressType, hostname, port, rawData, serverSock, respHeader, remoteConnWrapper, isSocksEnabled, parsedSocks5Config);
        },
    })).catch((err) => { console.log('WS Stream Error:', err); });

    return new Response(null, { status: 101, webSocket: clientSock });
}

async function forwardTCP(addrType, host, portNum, rawData, ws, respHeader, remoteConnWrapper, isSocksEnabled, parsedSocks5Config) {
    async function connectAndSend(address, port) {
        const remoteSock = isSocksEnabled ?
            await establishSocksConnection(addrType, address, port, parsedSocks5Config) :
            connect({ hostname: address, port: port });
        const writer = remoteSock.writable.getWriter();
        await writer.write(rawData);
        writer.releaseLock();
        return remoteSock;
    }
    async function retryConnection() {
        const newSocket = isSocksEnabled ?
            await connectAndSend(host, portNum) :
            await connectAndSend(fallbackAddress || host, parseInt(fallbackPort, 10) || portNum);
        remoteConnWrapper.socket = newSocket;
        newSocket.closed.catch(() => { }).finally(() => closeSocketQuietly(ws));
        connectStreams(newSocket, ws, respHeader, null);
    }
    try {
        const initialSocket = await connectAndSend(host, portNum);
        remoteConnWrapper.socket = initialSocket;
        connectStreams(initialSocket, ws, respHeader, retryConnection);
    } catch (err) {
        console.log('Initial connection failed, trying fallback:', err);
        retryConnection();
    }
}

function parseWsPacketHeader(chunk, token) {
    if (chunk.byteLength < 24) return { hasError: true, message: E_INVALID_DATA };
    const version = new Uint8Array(chunk.slice(0, 1));
    if (formatIdentifier(new Uint8Array(chunk.slice(1, 17))) !== token) return { hasError: true, message: E_INVALID_USER };
    const optLen = new Uint8Array(chunk.slice(17, 18))[0];
    const cmd = new Uint8Array(chunk.slice(18 + optLen, 19 + optLen))[0];
    let isUDP = false;
    if (cmd === 1) { } else if (cmd === 2) { isUDP = true; } else { return { hasError: true, message: E_UNSUPPORTED_CMD }; }
    const portIdx = 19 + optLen;
    const port = new DataView(chunk.slice(portIdx, portIdx + 2)).getUint16(0);
    let addrIdx = portIdx + 2, addrLen = 0, addrValIdx = addrIdx + 1, hostname = '';
    const addressType = new Uint8Array(chunk.slice(addrIdx, addrValIdx))[0];
    switch (addressType) {
        case ADDRESS_TYPE_IPV4: addrLen = 4; hostname = new Uint8Array(chunk.slice(addrValIdx, addrValIdx + addrLen)).join('.'); break;
        case ADDRESS_TYPE_URL: addrLen = new Uint8Array(chunk.slice(addrValIdx, addrValIdx + 1))[0]; addrValIdx += 1; hostname = new TextDecoder().decode(chunk.slice(addrValIdx, addrValIdx + addrLen)); break;
        case ADDRESS_TYPE_IPV6: addrLen = 16; const ipv6 = []; const ipv6View = new DataView(chunk.slice(addrValIdx, addrValIdx + addrLen)); for (let i = 0; i < 8; i++) ipv6.push(ipv6View.getUint16(i * 2).toString(16)); hostname = ipv6.join(':'); break;
        default: return { hasError: true, message: `${E_INVALID_ADDR_TYPE}: ${addressType}` };
    }
    if (!hostname) return { hasError: true, message: `${E_EMPTY_ADDR}: ${addressType}` };
    return { hasError: false, addressType, port, hostname, isUDP, rawIndex: addrValIdx + addrLen, version };
}

function makeReadableStream(socket, earlyDataHeader) {
    let cancelled = false;
    return new ReadableStream({
        start(controller) {
            socket.addEventListener('message', (event) => { if (!cancelled) controller.enqueue(event.data); });
            socket.addEventListener('close', () => { if (!cancelled) { closeSocketQuietly(socket); controller.close(); } });
            socket.addEventListener('error', (err) => controller.error(err));
            const { earlyData, error } = base64ToArray(earlyDataHeader);
            if (error) controller.error(error); else if (earlyData) controller.enqueue(earlyData);
        },
        cancel() { cancelled = true; closeSocketQuietly(socket); }
    });
}

async function connectStreams(remoteSocket, webSocket, headerData, retryFunc) {
    let header = headerData, hasData = false;
    await remoteSocket.readable.pipeTo(
        new WritableStream({
            async write(chunk, controller) {
                hasData = true;
                if (webSocket.readyState !== 1) controller.error(E_WS_NOT_OPEN);
                if (header) { webSocket.send(await new Blob([header, chunk]).arrayBuffer()); header = null; }
                else { webSocket.send(chunk); }
            },
            abort(reason) { console.error("Readable aborted:", reason); },
        })
    ).catch((error) => { console.error("Stream connection error:", error); closeSocketQuietly(webSocket); });
    if (!hasData && retryFunc) retryFunc();
}

async function forwardUDP(udpChunk, webSocket, respHeader) {
    try {
        const tcpSocket = connect({ hostname: '8.8.4.4', port: 53 });
        let vlessHeader = respHeader;
        const writer = tcpSocket.writable.getWriter();
        await writer.write(udpChunk);
        writer.releaseLock();
        await tcpSocket.readable.pipeTo(new WritableStream({
            async write(chunk) {
                if (webSocket.readyState === 1) {
                    if (vlessHeader) { webSocket.send(await new Blob([vlessHeader, chunk]).arrayBuffer()); vlessHeader = null; }
                    else { webSocket.send(chunk); }
                }
            },
        }));
    } catch (error) { console.error(`DNS forward error: ${error.message}`); }
}

async function establishSocksConnection(addrType, address, port, parsedSocks5Config) {
    const { username, password, hostname, socksPort } = parsedSocks5Config;
    const socket = connect({ hostname, port: socksPort });
    const writer = socket.writable.getWriter();
    await writer.write(new Uint8Array(username ? [5, 2, 0, 2] : [5, 1, 0]));
    const reader = socket.readable.getReader();
    let res = (await reader.read()).value;
    if (res[0] !== 5 || res[1] === 255) throw new Error(E_SOCKS_NO_METHOD);
    if (res[1] === 2) {
        if (!username || !password) throw new Error(E_SOCKS_AUTH_NEEDED);
        const encoder = new TextEncoder();
        const authRequest = new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]);
        await writer.write(authRequest);
        res = (await reader.read()).value;
        if (res[0] !== 1 || res[1] !== 0) throw new Error(E_SOCKS_AUTH_FAIL);
    }
    const encoder = new TextEncoder(); let DSTADDR;
    switch (addrType) {
        case ADDRESS_TYPE_IPV4: DSTADDR = new Uint8Array([1, ...address.split('.').map(Number)]); break;
        case ADDRESS_TYPE_URL: DSTADDR = new Uint8Array([3, address.length, ...encoder.encode(address)]); break;
        case ADDRESS_TYPE_IPV6: DSTADDR = new Uint8Array([4, ...address.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]); break;
        default: throw new Error(E_INVALID_ADDR_TYPE);
    }
    await writer.write(new Uint8Array([5, 1, 0, ...DSTADDR, port >> 8, port & 255]));
    res = (await reader.read()).value;
    if (res[1] !== 0) throw new Error(E_SOCKS_CONN_FAIL);
    writer.releaseLock(); reader.releaseLock();
    return socket;
}

function parseSocksConfig(address) {
    let [latter, former] = address.split("@").reverse(); let username, password, hostname, socksPort;
    if (former) { const formers = former.split(":"); if (formers.length !== 2) throw new Error(E_INVALID_SOCKS_ADDR);[username, password] = formers; }
    const latters = latter.split(":"); socksPort = Number(latters.pop()); if (isNaN(socksPort)) throw new Error(E_INVALID_SOCKS_ADDR);
    hostname = latters.join(":"); if (hostname.includes(":") && !/^\[.*\]$/.test(hostname)) throw new Error(E_INVALID_SOCKS_ADDR);
    return { username, password, hostname, socksPort };
}

function base64ToArray(b64Str) {
    if (!b64Str) return { error: null };
    try { b64Str = b64Str.replace(/-/g, '+').replace(/_/g, '/'); return { earlyData: Uint8Array.from(atob(b64Str), (c) => c.charCodeAt(0)).buffer, error: null }; }
    catch (error) { return { error }; }
}

function isValidFormat(uuid) { return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid); }

function closeSocketQuietly(socket) { try { if (socket.readyState === 1 || socket.readyState === 2) socket.close(); } catch (error) { } }

const hexTable = Array.from({ length: 256 }, (v, i) => (i + 256).toString(16).slice(1));

function formatIdentifier(arr, offset = 0) {
    const id = (hexTable[arr[offset]] + hexTable[arr[offset + 1]] + hexTable[arr[offset + 2]] + hexTable[arr[offset + 3]] + "-" + hexTable[arr[offset + 4]] + hexTable[arr[offset + 5]] + "-" + hexTable[arr[offset + 6]] + hexTable[arr[offset + 7]] + "-" + hexTable[arr[offset + 8]] + hexTable[arr[offset + 9]] + "-" + hexTable[arr[offset + 10]] + hexTable[arr[offset + 11]] + hexTable[arr[offset + 12]] + hexTable[arr[offset + 13]] + hexTable[arr[offset + 14]] + hexTable[arr[offset + 15]]).toLowerCase();
    if (!isValidFormat(id)) throw new TypeError(E_INVALID_ID_STR);
    return id;
}

function getFilterHTML() {
    const needPassword = !!(accessPassword && accessPassword.trim());
    const passwordValue = accessPassword || '';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sinppets 节点订阅</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px;display:flex;align-items:center;justify-content:center}.container{max-width:600px;width:100%;background:#fff;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.2);overflow:hidden}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:30px;text-align:center}.header h2{font-size:24px;margin-bottom:8px}.header p{font-size:14px;opacity:0.9}.section{padding:20px;border-bottom:1px solid #eee}.section:last-child{border-bottom:none}.section-title{font-size:16px;font-weight:600;margin-bottom:15px;color:#333;display:flex;align-items:center}.section-title::before{content:'';display:inline-block;width:4px;height:16px;background:#667eea;margin-right:8px;border-radius:2px}.btn-group{display:flex;gap:8px;margin-bottom:12px}.btn-small{padding:6px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:13px;cursor:pointer;transition:all 0.3s}.btn-small:hover{background:#f0f0f0;transform:translateY(-1px)}.btn-small.active{background:#667eea;color:#fff;border-color:#667eea}.domain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.domain-item{display:flex;align-items:center;padding:12px;border:2px solid #e0e0e0;border-radius:8px;background:#fafafa;font-size:13px;cursor:pointer;transition:all 0.3s}.domain-item:hover{background:#f0f0f0;border-color:#667eea}.domain-item.selected{background:#f0f4ff;border-color:#667eea;box-shadow:0 2px 8px rgba(102,126,234,0.2)}.domain-item input{margin-right:8px;cursor:pointer}.port-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.port-item{display:flex;align-items:center;justify-content:center;padding:12px;border:2px solid #e0e0e0;border-radius:8px;background:#fafafa;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.3s}.port-item:hover{background:#f0f0f0;border-color:#667eea}.port-item.selected{background:#f0f4ff;border-color:#667eea;box-shadow:0 2px 8px rgba(102,126,234,0.2)}.generate-btn{width:100%;padding:14px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 15px rgba(102,126,234,0.4)}.generate-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.5)}.generate-btn:active{transform:translateY(0)}.result{margin-top:15px;padding:15px;background:#f9f9f9;border-radius:8px;border-left:4px solid #667eea}.result input{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:monospace;font-size:12px;margin-bottom:10px;background:#fff}.copy-btn{padding:8px 16px;background:#4CAF50;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;transition:all 0.3s}.copy-btn:hover{background:#45a049;transform:translateY(-1px)}.socks-info{background:#e8f0fe;padding:12px;border-radius:6px;font-size:13px;color:#1967d2}.socks-info strong{display:block;margin-bottom:8px}.login-container{padding:40px}.login-form{display:flex;flex-direction:column;gap:20px}.input-group{display:flex;flex-direction:column;gap:8px}.input-group label{font-size:14px;font-weight:500;color:#333}.input-group input{padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px;transition:all 0.3s}.input-group input:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,0.1)}.login-btn{padding:14px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 15px rgba(102,126,234,0.4)}.login-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.5)}.login-btn:active{transform:translateY(0)}.error-msg{color:#f44336;font-size:13px;padding:10px;background:#ffebee;border-radius:6px;display:none}.logout-btn{position:absolute;top:20px;right:20px;padding:8px 16px;background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.3s}.logout-btn:hover{background:rgba(255,255,255,0.3)}@media (max-width:480px){.domain-grid{grid-template-columns:1fr}.port-grid{grid-template-columns:1fr}.logout-btn{position:static;margin-top:10px;width:100%}}</style></head><body><div class="container" id="loginContainer" style="display:${needPassword ? 'block' : 'none'}"><div class="header"><h2>🔐 登录验证</h2><p>请输入访问密码</p></div><div class="login-container"><form class="login-form" id="loginForm"><div class="input-group"><label for="password">访问密码</label><input type="password" id="password" placeholder="请输入密码" required autofocus></div><div class="error-msg" id="errorMsg">密码错误，请重试</div><button type="submit" class="login-btn">🔓 登录</button></form></div></div><div class="container" id="mainContainer" style="display:${needPassword ? 'none' : 'block'}"><div class="header" style="position:relative"><h2>🚀 Sinppets 节点订阅</h2><p>选择域名和端口生成专属订阅链接</p>${needPassword ? '<button class="logout-btn" onclick="logout()">🚪 退出登录</button>' : ''}</div><form id="filterForm"><div class="section"><div class="section-title">域名选择</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('domain')">全选</button><button type="button" class="btn-small" onclick="clearAll('domain')">清空</button></div><div class="domain-grid" id="domainGrid"></div></div><div class="section"><div class="section-title">端口选择</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('port')">全选</button><button type="button" class="btn-small" onclick="clearAll('port')">清空</button></div><div class="port-grid"><div class="port-item" data-port="443" onclick="togglePort(this)">🔒 443 (HTTPS)</div><div class="port-item" data-port="80" onclick="togglePort(this)">🌐 80 (HTTP)</div></div></div><div class="section"><div class="socks-info"><strong>📡 SOCKS代理配置 (${socks5Configs.length}个)</strong>${socks5Configs.map(s => `<div>✓ ${s.region}</div>`).join('')}</div></div><button type="submit" class="generate-btn">✨ 生成订阅链接</button></form><div id="result" class="result" style="display:none"><input type="text" id="subscriptionUrl" readonly><button class="copy-btn" onclick="copyUrl()">📋 复制链接</button></div></div><script>const PASSWORD='${passwordValue}';const needPassword=${needPassword};const domains=[${directDomains.map(d => `{name:"${d.name || d.domain}",domain:"${d.domain}"}`).join(',')}];function checkLogin(){if(!needPassword)return true;return sessionStorage.getItem('sinppets_logged_in')==='true'}function showMain(){document.getElementById('loginContainer').style.display='none';document.getElementById('mainContainer').style.display='block'}function showLogin(){document.getElementById('loginContainer').style.display='block';document.getElementById('mainContainer').style.display='none'}function logout(){sessionStorage.removeItem('sinppets_logged_in');showLogin();const pwdInput=document.getElementById('password');if(pwdInput)pwdInput.value=''}const loginForm=document.getElementById('loginForm');if(loginForm){loginForm.addEventListener('submit',function(e){e.preventDefault();const pwd=document.getElementById('password').value;if(pwd===PASSWORD){sessionStorage.setItem('sinppets_logged_in','true');showMain();initDomains();selectAll('port');document.getElementById('errorMsg').style.display='none'}else{document.getElementById('errorMsg').style.display='block';document.getElementById('password').value='';document.getElementById('password').focus()}})}function initDomains(){const grid=document.getElementById('domainGrid');grid.innerHTML='';domains.forEach(d=>{const div=document.createElement('div');div.className='domain-item';div.innerHTML=\`<input type="checkbox" name="domain" value="\${d.domain}" onchange="updateItemStyle(this)">\${d.name}\`;div.onclick=(e)=>{if(e.target.type!=='checkbox'){const cb=div.querySelector('input');cb.checked=!cb.checked;updateItemStyle(cb)}};grid.appendChild(div)})}function updateItemStyle(checkbox){const item=checkbox.closest('.domain-item');item.classList.toggle('selected',checkbox.checked)}function togglePort(el){el.classList.toggle('selected')}function selectAll(type){if(type==='domain'){document.querySelectorAll('[name="domain"]').forEach(cb=>{cb.checked=true;updateItemStyle(cb)})}else if(type==='port'){document.querySelectorAll('.port-item').forEach(el=>el.classList.add('selected'))}}function clearAll(type){if(type==='domain'){document.querySelectorAll('[name="domain"]').forEach(cb=>{cb.checked=false;updateItemStyle(cb)})}else if(type==='port'){document.querySelectorAll('.port-item').forEach(el=>el.classList.remove('selected'))}}document.getElementById('filterForm').onsubmit=function(e){e.preventDefault();const selectedDomains=Array.from(document.querySelectorAll('input[name="domain"]:checked')).map(cb=>cb.value);const selectedPorts=Array.from(document.querySelectorAll('.port-item.selected')).map(el=>el.dataset.port);const params=new URLSearchParams();if(selectedDomains.length>0)params.append('domains',selectedDomains.join(','));if(selectedPorts.length>0)params.append('ports',selectedPorts.join(','));const url=window.location.origin+'/${authToken}'+(params.toString()?'?'+params.toString():'');document.getElementById('subscriptionUrl').value=url;document.getElementById('result').style.display='block';document.getElementById('subscriptionUrl').scrollIntoView({behavior:'smooth',block:'center'})};function copyUrl(){const input=document.getElementById('subscriptionUrl');input.select();document.execCommand('copy');const btn=event.target;const originalText=btn.textContent;btn.textContent='✅ 已复制!';btn.style.background='#66bb6a';setTimeout(()=>{btn.textContent=originalText;btn.style.background='#4CAF50'},2000)}window.onload=()=>{if(checkLogin()){showMain();initDomains();selectAll('port')}else if(needPassword){showLogin()}else{initDomains();selectAll('port')}}</script></body></html>`;
}
