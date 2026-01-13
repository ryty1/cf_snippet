import { connect } from 'cloudflare:sockets';
let subPath = 'link', proxyIP = '210.61.97.241:81';
let T = '6bf23214-fbe3-456b-9f61-d556727f9904', SSpath = '';
const CU = '';
const GT = '';
const PW = 'abc123456';
let SC = [];
let DD = [];
let cC = null, cT = 0;
const CD = 5 * 60 * 1000;
let cfip = ['cf.090227.xyz#SG', 'cf.877774.xyz#HK'];
async function lC() { const now = Date.now(); if (cC && (now - cT) < CD) return cC; try { const h = { 'User-Agent': 'Cloudflare-Worker' }; if (GT) h.Authorization = `token ${GT}`; const r = await fetch(CU, { headers: h, cf: { cacheTtl: 300, cacheEverything: true } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); const c = await r.json(); if (c.socks && Array.isArray(c.socks)) SC = c.socks; if (c.domains && Array.isArray(c.domains)) DD = c.domains; cC = { socks: SC, domains: DD }; cT = now; } catch (e) { } return { socks: SC, domains: DD }; }
function cS(s) { try { if (s.readyState === 1 || s.readyState === 2) s.close(); } catch (e) { } }
function b64A(b) { if (!b) return { error: null }; try { const bs = atob(b.replace(/-/g, '+').replace(/_/g, '/')); const by = new Uint8Array(bs.length); for (let i = 0; i < bs.length; i++)by[i] = bs.charCodeAt(i); return { earlyData: by.buffer, error: null }; } catch (e) { return { error: e }; } }
function pPA(s) { if (!s) return null; s = s.trim(); if (s.startsWith('socks://') || s.startsWith('socks5://')) { try { const u = new URL(s.replace(/^socks/, 'socks5')); return { type: 'socks5', host: u.hostname, port: parseInt(u.port) || 1080, username: u.username ? decodeURIComponent(u.username) : '', password: u.password ? decodeURIComponent(u.password) : '' }; } catch (e) { return null; } } if (s.startsWith('http://') || s.startsWith('https://')) { try { const u = new URL(s); return { type: 'http', host: u.hostname, port: parseInt(u.port) || (s.startsWith('https://') ? 443 : 80), username: u.username ? decodeURIComponent(u.username) : '', password: u.password ? decodeURIComponent(u.password) : '' }; } catch (e) { return null; } } if (s.includes('@')) { const ai = s.lastIndexOf('@'), ap = s.substring(0, ai), hp = s.substring(ai + 1); let u = '', pw = ''; const ci = ap.indexOf(':'); if (ci > 0) { u = ap.substring(0, ci); pw = ap.substring(ci + 1); } let h = hp, p = 1080; if (hp.startsWith('[')) { const cb = hp.indexOf(']'); if (cb > 0) { h = hp.substring(1, cb); const r = hp.substring(cb + 1); if (r.startsWith(':')) { const pn = parseInt(r.substring(1), 10); if (!isNaN(pn) && pn > 0 && pn <= 65535) p = pn; } } } else { const lci = hp.lastIndexOf(':'); if (lci > 0) { h = hp.substring(0, lci); const pn = parseInt(hp.substring(lci + 1), 10); if (!isNaN(pn) && pn > 0 && pn <= 65535) p = pn; } } return { type: 'socks5', host: h, port: p, username: u, password: pw }; } if (s.startsWith('[')) { const cb = s.indexOf(']'); if (cb > 0) { const h = s.substring(1, cb), r = s.substring(cb + 1); if (r.startsWith(':')) { const p = parseInt(r.substring(1), 10); if (!isNaN(p) && p > 0 && p <= 65535) return { type: 'direct', host: h, port: p }; } return { type: 'direct', host: h, port: 443 }; } } const lci = s.lastIndexOf(':'); if (lci > 0) { const h = s.substring(0, lci), ps = s.substring(lci + 1), p = parseInt(ps, 10); if (!isNaN(p) && p > 0 && p <= 65535) return { type: 'direct', host: h, port: p }; } return { type: 'direct', host: s, port: 443 }; }
function iSTS(h) { const d = ['speedtest.net', 'fast.com', 'speedtest.cn', 'speed.cloudflare.com', 'ovo.speedtestcustom.com']; if (d.includes(h)) return true; for (const x of d) if (h.endsWith('.' + x) || h === x) return true; return false; }
async function handleSSRequest(request, cpi) {
    const url = new URL(request.url);
    const socksIndex = parseInt(url.searchParams.get('socks') || '0');
    let parsedSocksConfig = null;
    let useSocksProxy = false;

    if (SC.length > 0 && socksIndex >= 0 && socksIndex < SC.length) {
        const socksConfigStr = SC[socksIndex].config;
        if (socksConfigStr) {
            parsedSocksConfig = pPA(socksConfigStr);
            if (parsedSocksConfig && parsedSocksConfig.type === 'socks5') {
                useSocksProxy = true;
            }
        }
    }
    const wssPair = new WebSocketPair();
    const [clientSock, serverSock] = Object.values(wssPair);
    serverSock.accept();
    let rcw = { socket: null };
    const earlyData = request.headers.get('sec-websocket-protocol') || '';
    const readable = makeReadableStr(serverSock, earlyData);
    readable.pipeTo(new WritableStream({
        async write(chunk) {
            if (rcw.socket) {
                const writer = rcw.socket.writable.getWriter();
                await writer.write(chunk);
                writer.releaseLock();
                return;
            }
            const { hasError, message, addressType, port, hostname, rawIndex } = parseSSPacketHeader(chunk);
            if (hasError) throw new Error(message);

            if (iSTS(hostname)) {
                throw new Error('Speedtest site is blocked');
            }
            const rawData = chunk.slice(rawIndex);
            await fT(hostname, port, rawData, serverSock, null, rcw, useSocksProxy ? parsedSocksConfig : cpi);
        },
    })).catch((err) => {
    });
    return new Response(null, { status: 101, webSocket: clientSock });
}
function parseSSPacketHeader(chunk) {
    if (chunk.byteLength < 7) return { hasError: true, message: 'Invalid data' };
    try {
        const view = new Uint8Array(chunk);
        const addressType = view[0];
        let addrIdx = 1, addrLen = 0, addrValIdx = addrIdx, hostname = '';
        switch (addressType) {
            case 1:
                addrLen = 4;
                hostname = new Uint8Array(chunk.slice(addrValIdx, addrValIdx + addrLen)).join('.');
                addrValIdx += addrLen;
                break;
            case 3:
                addrLen = view[addrIdx];
                addrValIdx += 1;
                hostname = new TextDecoder().decode(chunk.slice(addrValIdx, addrValIdx + addrLen));
                addrValIdx += addrLen;
                break;
            case 4:
                addrLen = 16;
                const ipv6 = [];
                const ipv6View = new DataView(chunk.slice(addrValIdx, addrValIdx + addrLen));
                for (let i = 0; i < 8; i++) ipv6.push(ipv6View.getUint16(i * 2).toString(16));
                hostname = ipv6.join(':');
                addrValIdx += addrLen;
                break;
            default:
                return { hasError: true, message: `Invalid address type: ${addressType}` };
        }
        if (!hostname) return { hasError: true, message: `Invalid address: ${addressType}` };
        const port = new DataView(chunk.slice(addrValIdx, addrValIdx + 2)).getUint16(0);
        return { hasError: false, addressType, port, hostname, rawIndex: addrValIdx + 2 };
    } catch (e) {
        return { hasError: true, message: 'Failed to parse SS packet header' };
    }
}
async function c2s5(proxyConfig, targetHost, targetPort, initialData) {
    const { host, port, username, password } = proxyConfig;
    const connectHost = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
    const socket = connect({ hostname: connectHost, port: port });
    const writer = socket.writable.getWriter();
    const reader = socket.readable.getReader();
    try {
        const authMethods = username && password ?
            new Uint8Array([0x05, 0x02, 0x00, 0x02]) :
            new Uint8Array([0x05, 0x01, 0x00]);

        await writer.write(authMethods);
        const methodResponse = await reader.read();
        if (methodResponse.done || methodResponse.value.byteLength < 2) {
            throw new Error('S5 method selection failed');
        }
        const selectedMethod = new Uint8Array(methodResponse.value)[1];
        if (selectedMethod === 0x02) {
            if (!username || !password) {
                throw new Error('S5 requires authentication');
            }
            const userBytes = new TextEncoder().encode(username);
            const passBytes = new TextEncoder().encode(password);
            const authPacket = new Uint8Array(3 + userBytes.length + passBytes.length);
            authPacket[0] = 0x01;
            authPacket[1] = userBytes.length;
            authPacket.set(userBytes, 2);
            authPacket[2 + userBytes.length] = passBytes.length;
            authPacket.set(passBytes, 3 + userBytes.length);
            await writer.write(authPacket);
            const authResponse = await reader.read();
            if (authResponse.done || new Uint8Array(authResponse.value)[1] !== 0x00) {
                throw new Error('S5 authentication failed');
            }
        } else if (selectedMethod !== 0x00) {
            throw new Error(`S5 unsupported auth method: ${selectedMethod}`);
        }
        const hostBytes = new TextEncoder().encode(targetHost);
        const connectPacket = new Uint8Array(7 + hostBytes.length);
        connectPacket[0] = 0x05;
        connectPacket[1] = 0x01;
        connectPacket[2] = 0x00;
        connectPacket[3] = 0x03;
        connectPacket[4] = hostBytes.length;
        connectPacket.set(hostBytes, 5);
        new DataView(connectPacket.buffer).setUint16(5 + hostBytes.length, targetPort, false);
        await writer.write(connectPacket);
        const connectResponse = await reader.read();
        if (connectResponse.done || new Uint8Array(connectResponse.value)[1] !== 0x00) {
            throw new Error('S5 connection failed');
        }
        await writer.write(initialData);
        writer.releaseLock();
        reader.releaseLock();
        return socket;
    } catch (error) {
        writer.releaseLock();
        reader.releaseLock();
        throw error;
    }
}
async function c2h(proxyConfig, targetHost, targetPort, initialData) {
    const { host, port, username, password } = proxyConfig;
    const socket = connect({ hostname: host, port: port });
    const writer = socket.writable.getWriter();
    const reader = socket.readable.getReader();
    try {
        let connectRequest = `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\n`;
        connectRequest += `Host: ${targetHost}:${targetPort}\r\n`;

        if (username && password) {
            const auth = btoa(`${username}:${password}`);
            connectRequest += `Proxy-Authorization: Basic ${auth}\r\n`;
        }
        connectRequest += `User-Agent: Mozilla/5.0\r\n`;
        connectRequest += `Connection: keep-alive\r\n`;
        connectRequest += '\r\n';
        await writer.write(new TextEncoder().encode(connectRequest));
        let responseBuffer = new Uint8Array(0);
        let headerEndIndex = -1;
        let bytesRead = 0;
        const maxHeaderSize = 8192;
        while (headerEndIndex === -1 && bytesRead < maxHeaderSize) {
            const { done, value } = await reader.read();
            if (done) {
                throw new Error('Connection closed before receiving HTTP response');
            }
            const newBuffer = new Uint8Array(responseBuffer.length + value.length);
            newBuffer.set(responseBuffer);
            newBuffer.set(value, responseBuffer.length);
            responseBuffer = newBuffer;
            bytesRead = responseBuffer.length;
            for (let i = 0; i < responseBuffer.length - 3; i++) {
                if (responseBuffer[i] === 0x0d && responseBuffer[i + 1] === 0x0a &&
                    responseBuffer[i + 2] === 0x0d && responseBuffer[i + 3] === 0x0a) {
                    headerEndIndex = i + 4;
                    break;
                }
            }
        }
        if (headerEndIndex === -1) {
            throw new Error('Invalid HTTP response');
        }
        const headerText = new TextDecoder().decode(responseBuffer.slice(0, headerEndIndex));
        const statusLine = headerText.split('\r\n')[0];
        const statusMatch = statusLine.match(/HTTP\/\d\.\d\s+(\d+)/);
        if (!statusMatch) {
            throw new Error(`Invalid response: ${statusLine}`);
        }
        const statusCode = parseInt(statusMatch[1]);
        if (statusCode < 200 || statusCode >= 300) {
            throw new Error(`Connection failed: ${statusLine}`);
        }
        await writer.write(initialData);
        writer.releaseLock();
        reader.releaseLock();
        return socket;
    } catch (error) {
        try {
            writer.releaseLock();
        } catch (e) { }
        try {
            reader.releaseLock();
        } catch (e) { }
        try {
            socket.close();
        } catch (e) { }
        throw error;
    }
}
async function fT(host, portNum, rawData, ws, respHeader, rcw, cpi) {
    async function cD(address, port, data) {
        const remoteSock = connect({ hostname: address, port: port });
        const writer = remoteSock.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
        return remoteSock;
    }
    let proxyConfig = null;
    let shouldUseProxy = false;
    if (cpi) {
        if (typeof cpi === 'object' && cpi.type) {
            proxyConfig = cpi;
            if (proxyConfig.type === 'socks5' || proxyConfig.type === 'http' || proxyConfig.type === 'https') {
                shouldUseProxy = true;
            }
        } else if (typeof cpi === 'string') {
            proxyConfig = pPA(cpi);
            if (proxyConfig && (proxyConfig.type === 'socks5' || proxyConfig.type === 'http' || proxyConfig.type === 'https')) {
                shouldUseProxy = true;
            } else if (!proxyConfig) {
                proxyConfig = pPA(proxyIP) || { type: 'direct', host: proxyIP, port: 443 };
            }
        }
    } else {
        proxyConfig = pPA(proxyIP) || { type: 'direct', host: proxyIP, port: 443 };
        if (proxyConfig.type === 'socks5' || proxyConfig.type === 'http' || proxyConfig.type === 'https') {
            shouldUseProxy = true;
        }
    }
    async function c2p() {
        let newSocket;
        if (proxyConfig.type === 'socks5') {
            newSocket = await c2s5(proxyConfig, host, portNum, rawData);
        } else if (proxyConfig.type === 'http' || proxyConfig.type === 'https') {
            newSocket = await c2h(proxyConfig, host, portNum, rawData);
        } else {
            newSocket = await cD(proxyConfig.host, proxyConfig.port, rawData);
        }
        rcw.socket = newSocket;
        newSocket.closed.catch(() => { }).finally(() => cS(ws));
        cS2(newSocket, ws, respHeader, null);
    }
    if (shouldUseProxy) {
        try {
            await c2p();
        } catch (err) {
            throw err;
        }
    } else {
        try {
            const initialSocket = await cD(host, portNum, rawData);
            rcw.socket = initialSocket;
            cS2(initialSocket, ws, respHeader, c2p);
        } catch (err) {
            cS2(null, ws, respHeader, c2p);
        }
    }
}
function makeReadableStr(socket, earlyDataHeader) {
    let cancelled = false;
    return new ReadableStream({
        start(controller) {
            socket.addEventListener('message', (event) => {
                if (!cancelled) controller.enqueue(event.data);
            });
            socket.addEventListener('close', () => {
                if (!cancelled) {
                    cS(socket);
                    controller.close();
                }
            });
            socket.addEventListener('error', (err) => controller.error(err));
            const { earlyData, error } = b64A(earlyDataHeader);
            if (error) controller.error(error);
            else if (earlyData) controller.enqueue(earlyData);
        },
        cancel() {
            cancelled = true;
            cS(socket);
        }
    });
}
async function cS2(remoteSocket, webSocket, headerData, retryFunc) {
    let header = headerData, hasData = false;
    await remoteSocket.readable.pipeTo(
        new WritableStream({
            async write(chunk, controller) {
                hasData = true;
                if (webSocket.readyState !== WebSocket.OPEN) controller.error('wsreadyState not open');
                if (header) {
                    const response = new Uint8Array(header.length + chunk.byteLength);
                    response.set(header, 0);
                    response.set(chunk, header.length);
                    webSocket.send(response.buffer);
                    header = null;
                } else {
                    webSocket.send(chunk);
                }
            },
            abort() { },
        })
    ).catch((err) => {
        cS(webSocket);
    });
    if (!hasData && retryFunc) {
        await retryFunc();
    }
}
async function handleCheckSocks(request) {
    const url = new URL(request.url);
    const idx = url.searchParams.get('index');
    const checkOne = async (socksConfig) => {
        const startTime = Date.now();
        try {
            const parsed = pPA(socksConfig.config);
            if (!parsed || parsed.type !== 'socks5') {
                return {
                    region: socksConfig.region,
                    status: 'offline',
                    latency: -1,
                    error: '不是 SOCKS5 配置'
                };
            }
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('连接超时')), 2000);
            });
            const connectionPromise = c2s5(parsed, '1.1.1.1', 80, new Uint8Array(0));
            const socket = await Promise.race([connectionPromise, timeoutPromise]);
            const latency = Date.now() - startTime;
            try {
                socket.close();
            } catch (e) {
            }
            return {
                region: socksConfig.region,
                status: 'online',
                latency: latency
            };
        } catch (error) {
            return {
                region: socksConfig.region,
                status: 'offline',
                latency: -1,
                error: error.message || 'Connection failed'
            };
        }
    };
    if (idx !== null) {
        const i = parseInt(idx);
        if (i >= 0 && i < SC.length) {
            const result = await checkOne(SC[i]);
            return new Response(JSON.stringify(result), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }
    const results = [];
    for (const socksConfig of SC) {
        results.push(await checkOne(socksConfig));
    }
    return new Response(JSON.stringify({ results }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
export default {
    async fetch(request, env) {
        await lC(); try {
            if (subPath === 'link' || subPath === '') { subPath = T; }
            if (SSpath === '') { SSpath = T; }
            let validPath = `/${SSpath}`;
            const servers = proxyIP.split(',').map(s => s.trim());
            proxyIP = servers[0];
            const method = 'none';
            const url = new URL(request.url);
            const pathname = url.pathname;
            let pathProxyIP = null;
            if (pathname.startsWith('/proxyip=')) {
                try {
                    pathProxyIP = decodeURIComponent(pathname.substring(9)).trim();
                } catch (e) {
                    // ingore error
                }
                if (pathProxyIP && !request.headers.get('Upgrade')) {
                    proxyIP = pathProxyIP;
                    return new Response(`set proxyIP to: ${proxyIP}\n\n`, {
                        headers: {
                            'Content-Type': 'text/plain; charset=utf-8',
                            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        },
                    });
                }
            }
            if (request.headers.get('Upgrade') === 'websocket') {
                if (!pathname.toLowerCase().startsWith(validPath.toLowerCase())) {
                    return new Response('Unauthorized', { status: 401 });
                }
                let wsPathProxyIP = null;
                if (pathname.startsWith('/proxyip=')) {
                    try {
                        wsPathProxyIP = decodeURIComponent(pathname.substring(9)).trim();
                    } catch (e) {
                        // ingore error
                    }
                }
                const cpi = wsPathProxyIP || url.searchParams.get('proxyip') || request.headers.get('proxyip');
                return await handleSSRequest(request, cpi);
            } else if (request.method === 'GET') {
                if (url.pathname === '/api/check-socks') {
                    return await handleCheckSocks(request);
                }
                if (url.pathname === '/') {
                    const cd = url.hostname, np = !!(PW && PW.trim());
                    const h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SS订阅</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:linear-gradient(135deg,#7dd3ca,#a17ec4);min-height:100vh;padding:20px;display:flex;align-items:center;justify-content:center}.co{max-width:1056px;width:100%;background:#fff;border-radius:12px}#lo.co{max-width:480px}.h{background:linear-gradient(135deg,#7dd3ca,#a17ec4);color:#fff;padding:20px;text-align:center;position:relative}.h h2{font-size:24px;margin-bottom:8px}.h p{font-size:14px;opacity:.9}.h .logout{position:absolute;top:20px;right:20px;color:#fff;background:rgba(255,255,255,.2);border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600}.h .logout:hover{background:rgba(255,255,255,.3)}.s{padding:8px 12px;border-bottom:1px solid #eee}.s:last-child{border:none}.t{font-size:16px;font-weight:600;margin-bottom:10px;color:#333;display:flex;align-items:center}.t::before{content:'';display:inline-block;width:4px;height:16px;background:#7dd3ca;margin-right:8px;border-radius:2px}.btn-group{display:flex;gap:4px;margin-bottom:10px}.btn-small{padding:6px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:13px;cursor:pointer}.btn-small:hover{background:#f0f0f0}.btn-small:last-child{margin-left:auto}.dg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.di{display:flex;align-items:center;padding:6px 8px;border:2px solid #e0e0e0;border-radius:6px;background:#fafafa;font-size:13px;cursor:pointer}.di:hover{background:#f0f0f0;border-color:#7dd3ca}.di.sel{background:#f0f4ff;border-color:#7dd3ca}.di input{margin-right:8px;cursor:pointer}#sc{display:flex;flex-wrap:wrap;gap:8px}.c{background:#f8f9fa;border:2px solid #e0e0e0;border-radius:6px;padding:10px;flex:0 0 200px}.c.on{border-color:#4CAF50;background:#f1f8f4}.c.off{border-color:#f44;background:#fef1f0}.c div{display:flex;justify-content:space-between;gap:8px;margin:3px 0}.c b{font-size:13px}.c span{font-size:11px;color:#666}.gen{width:100%;padding:14px;background:linear-gradient(135deg,#7dd3ca,#a17ec4);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}.gen:hover{opacity:.9}.res{margin-top:15px;padding:15px;background:#f9f9f9;border-radius:8px;border-left:4px solid #7dd3ca;display:none}.res .app-label{display:inline-block;background:#f44;color:#fff;padding:4px 12px;border-radius:4px;font-weight:600;font-size:14px;margin-right:10px;vertical-align:middle;width:80px;text-align:center}.res .link-wrapper{display:flex;align-items:center}.res input{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:monospace;font-size:12px;background:#fff;cursor:pointer;text-align:left;color:#7dd3ca;font-weight:600}.lo{padding:24px;max-width:420px;margin:0 auto}.lf{display:flex;flex-direction:column;gap:16px}.ig{display:flex;flex-direction:column;gap:6px}.ig label{font-size:14px;font-weight:500;color:#333}.ig input{padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px}.ig input:focus{outline:none;border-color:#7dd3ca}.lb{padding:14px;background:linear-gradient(135deg,#7dd3ca,#a17ec4);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}.em{color:#f44;font-size:13px;padding:10px;background:#fee;border-radius:6px;display:none}</style></head><body><div class="co" id="lo" style="display:${np ? 'block' : 'none'}"><div class="h"><h2>🔐 登录</h2></div><div class="lo"><form class="lf" id="lf"><div class="ig"><label>密码</label><input type="password" id="pw" required></div><div class="em" id="em">密码错误</div><button type="submit" class="lb">登录</button></form></div></div><div class="co" id="mc" style="display:${np ? 'none' : 'block'}"><div class="h"><button class="logout" onclick="logout()">退出</button><h2>🚀 SS节点订阅</h2><p>选择域名生成专属订阅链接(默认443端口)</p></div><form id="ff"><div class="s"><div class="t">优选域名</div><div class="btn-group"><button type="button" class="btn-small" onclick="sA()">全选</button><button type="button" class="btn-small" onclick="cA()">清空</button></div><div class="dg" id="dg"></div></div><div class="s"><div class="t">📡 SOCKS状态<button type="button" class="btn-small" onclick="chkS()">刷新</button></div><div id="sc">${SC.map((s, i) => `<div class="c" data-i="${i}"><div><b>${s.region}</b><span id="ip${i}">-</span></div><div><span id="s${i}">⚪</span><span id="l${i}">-</span></div></div>`).join('')}</div></div><button type="submit" class="gen">✨ 生成订阅</button></form><div id="res" class="res"><div class="link-wrapper"><span class="app-label">V2rayN</span><input type="text" id="url" readonly onclick="cpU()" title="点击复制"></div></div><div id="cres" class="res" style="margin-top:10px"><div class="link-wrapper"><span class="app-label">Clash</span><input type="text" id="curl" readonly onclick="cpC()" title="点击复制"></div></div></div><script>const PW='${PW}',np=${np},ds=[${DD.map(d => `{n:"${d.name || d.domain}",d:"${d.domain}"}`).join(',')}],SC=[${SC.map(s => `{region:"${s.region}",config:"${s.config}"}`).join(',')}];function cl(){return!np||sessionStorage.getItem('ss_l')==='1'}function sm(){document.getElementById('lo').style.display='none';document.getElementById('mc').style.display='block'}const lf=document.getElementById('lf');if(lf){lf.addEventListener('submit',e=>{e.preventDefault();if(document.getElementById('pw').value===PW){sessionStorage.setItem('ss_l','1');sm();init();setTimeout(chkS,500);document.getElementById('em').style.display='none'}else{document.getElementById('em').style.display='block';document.getElementById('pw').value=''}})}function pIP(c){try{const a=c.lastIndexOf('@');if(a===-1)return'未知';const h=c.substring(a+1),ci=h.lastIndexOf(':');return ci===-1?h:h.substring(0,ci)}catch(e){return'失败'}}function init(){const g=document.getElementById('dg');g.innerHTML='';ds.forEach(d=>{const di=document.createElement('div');di.className='di';di.innerHTML=\`<input type="checkbox" name="d" value="\${d.d}" onchange="uS(this)">\${d.n}\`;di.onclick=e=>{if(e.target.type!=='checkbox'){const cb=di.querySelector('input');cb.checked=!cb.checked;uS(cb)}};g.appendChild(di)});const cs=document.querySelectorAll('.c');cs.forEach(c=>{const ix=c.dataset.i;const cfg=SC[ix]?.config;if(cfg)document.getElementById('ip'+ix).textContent=pIP(cfg)})}function uS(cb){cb.closest('.di').classList.toggle('sel',cb.checked)}function sA(){document.querySelectorAll('[name="d"]').forEach(cb=>{cb.checked=true;uS(cb)})}function cA(){document.querySelectorAll('[name="d"]').forEach(cb=>{cb.checked=false;uS(cb)})}document.getElementById('ff').onsubmit=function(e){e.preventDefault();const sd=Array.from(document.querySelectorAll('input[name="d"]:checked')).map(cb=>cb.value);const p=new URLSearchParams();if(sd.length>0)p.append('domains',sd.join(','));const u=window.location.origin+'/sub/${subPath}'+(p.toString()?'?'+p.toString():'');const cu='https://sub.ssss.xx.kg/clash?config='+u;document.getElementById('url').value=u;document.getElementById('curl').value=cu;document.getElementById('res').style.display='block';document.getElementById('cres').style.display='block';document.getElementById('url').scrollIntoView({behavior:'smooth',block:'center'})};function cpU(){const i=document.getElementById('url');if(i.value.includes('✅'))return;const v=i.value;i.select();document.execCommand('copy');i.value='✅ 已复制成功!';const oc=i.style.color;i.style.color='#4CAF50';setTimeout(()=>{i.value=v;i.style.color=oc},1500)}function cpC(){const i=document.getElementById('curl');if(i.value.includes('✅'))return;const v=i.value;i.select();document.execCommand('copy');i.value='✅ 已复制成功!';const oc=i.style.color;i.style.color='#4CAF50';setTimeout(()=>{i.value=v;i.style.color=oc},1500)}function logout(){sessionStorage.removeItem('ss_l');location.reload()}async function chkS(){const cs=document.querySelectorAll('.c');cs.forEach(c=>{c.classList.remove('on','off')});for(let i=0;i<cs.length;i++){const c=cs[i],ix=c.dataset.i;document.getElementById('s'+ix).textContent='⏳';try{const r=await fetch('/api/check-socks?index='+ix),d=await r.json();if(d.status==='online'){document.getElementById('s'+ix).textContent='🟢';document.getElementById('l'+ix).textContent=d.latency+'ms';c.classList.add('on')}else{document.getElementById('s'+ix).textContent='🔴';document.getElementById('l'+ix).textContent='离线';c.classList.add('off')}}catch(e){document.getElementById('s'+ix).textContent='🔴';document.getElementById('l'+ix).textContent='错误';c.classList.add('off')}}}window.onload=()=>{if(cl()){sm();init();setTimeout(chkS,500)}else if(np){document.getElementById('lo').style.display='block'}else{init();setTimeout(chkS,500)}}</script></body></html>`;
                    return new Response(h, { status: 200, headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'no-cache' } });
                }
                if (url.pathname.toLowerCase() === `/sub/${subPath.toLowerCase()}` || url.pathname.toLowerCase() === `/sub/${subPath.toLowerCase()}/`) { const cd = url.hostname, sh = 's' + 's', sl = []; const domainParam = url.searchParams.get('domains'); const portParam = url.searchParams.get('ports'); let selectedDomains = domainParam ? domainParam.split(',') : []; let selectedPorts = portParam ? portParam.split(',').map(p => parseInt(p)) : [443]; if (DD.length > 0 && SC.length > 0) { const domainsToUse = selectedDomains.length > 0 ? DD.filter(d => selectedDomains.includes(d.domain)) : DD; domainsToUse.forEach(d => { SC.forEach((s, i) => { selectedPorts.forEach(p => { const n = `Sinppets-${s.region}`, c = btoa(`${method}:${T}`), wp = `${validPath}/?ed=2560&socks=${i}`; sl.push(`${sh}://${c}@${d.domain}:${p}?plugin=v2ray-plugin;mode%3Dwebsocket;host%3D${cd};path%3D${encodeURIComponent(wp)};${p === 443 ? 'tls;sni%3D' + cd + ';' : ''}skip-cert-verify%3Dtrue;mux%3D0#${encodeURIComponent(n)}`) }) }) }); } else { cfip.forEach(ci => { let h, p = 443, n = ''; if (ci.includes('#')) { const pts = ci.split('#'); ci = pts[0]; n = pts[1]; } if (ci.startsWith('[') && ci.includes(']:')) { const ipv6End = ci.indexOf(']:'); h = ci.substring(0, ipv6End + 1); p = parseInt(ci.substring(ipv6End + 2)) || 443; } else if (ci.includes(':')) { const pts = ci.split(':'); h = pts[0]; p = parseInt(pts[1]) || 443; } else { h = ci; } const c = btoa(`${method}:${T}`), nn = n ? `${n}-${sh}` : sh; sl.push(`${sh}://${c}@${h}:${p}?plugin=v2ray-plugin;mode%3Dwebsocket;host%3D${cd};path%3D${validPath}/?ed%3D2560;tls;sni%3D${cd};skip-cert-verify%3Dtrue;mux%3D0#${nn}`) }); } return new Response(btoa(unescape(encodeURIComponent(sl.join('\n')))), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }); }
            }
            return new Response('Not Found', { status: 404 });
        } catch (err) {
            return new Response('Internal Server Error', { status: 500 });
        }
    },
};
