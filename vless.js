import { connect } from 'cloudflare:sockets';
const T = '4bc511be-7d08-4487-966b-12f40fd5014a';
const FA = 'ProxyIP.cmliussss.net';
const FP = '443';
const PW = 'abc123456';
const CU = '';
const GT = '';
let SC = [];
let DD = [{ domain: 'cf.090227.xyz' }];
let cC = null;
let cT = 0;
const CD = 5 * 60 * 1000;
const E1 = atob('aW52YWxpZCBkYXRh');
const E2 = atob('aW52YWxpZCB1c2Vy');
const E3 = atob('Y29tbWFuZCBpcyBub3Qgc3VwcG9ydGVk');
const E4 = atob('VURQIHByb3h5IG9ubHkgZW5hYmxlIGZvciBETlMgd2hpY2ggaXMgcG9ydCA1Mw==');
const E5 = atob('aW52YWxpZCBhZGRyZXNzVHlwZQ==');
const E6 = atob('YWRkcmVzc1ZhbHVlIGlzIGVtcHR5');
const E7 = atob('d2ViU29ja2V0LmVhZHlTdGF0ZSBpcyBub3Qgb3Blbg==');
const E8 = atob('U3RyaW5naWZpZWQgaWRlbnRpZmllciBpcyBpbnZhbGlk');
const E9 = atob('SW52YWxpZCBTT0NLUyBhZGRyZXNzIGZvcm1hdA==');
const EA = atob('bm8gYWNjZXB0YWJsZSBtZXRob2Rz');
const EB = atob('c29ja3Mgc2VydmVyIG5lZWRzIGF1dGg=');
const EC = atob('ZmFpbCB0byBhdXRoIHNvY2tzIHNlcnZlcg==');
const ED = atob('ZmFpbCB0byBvcGVuIHNvY2tzIGNvbm5lY3Rpb24=');
const A1 = 1;
const A2 = 2;
const A3 = 3;
async function lC() {
    const now = Date.now();
    if (cC && (now - cT) < CD) {
        return cC;
    }
    try {
        const headers = {
            'User-Agent': 'Cloudflare-Worker'
        };
        if (GT) {
            headers['Authorization'] = `token ${GT}`;
        }
        const response = await fetch(CU, {
            headers: headers,
            cf: { cacheTtl: 300, cacheEverything: true }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const config = await response.json();
        if (config.socks && Array.isArray(config.socks)) SC = config.socks;
        if (config.domains && Array.isArray(config.domains)) DD = config.domains;
        cC = { socks: SC, domains: DD };
        cT = now;
        console.log('✅ Config OK');
    } catch (error) {
        console.log('❌ Config Error:', error.message);
    }
    return { socks: SC, domains: DD };
}
export default {
    async fetch(request, env, ctx) {
        await lC();
        try {
            const subPath = T;
            const url = new URL(request.url);

            if (request.headers.get('Upgrade') === 'websocket') {
                return await hWs(request);
            } else if (request.method === 'GET') {
                if (url.pathname === '/') {
                    return new Response(gHTML(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                }
                if (url.pathname === '/api/check-socks') {
                    return await hChk(request);
                }
                if (url.pathname.toLowerCase().includes(`/${subPath}`)) {
                    return await hSub(request, T);
                }
            }
            return new Response('Not Found', { status: 404 });
        } catch (err) {
            return new Response(err.toString(), { status: 500 });
        }
    },
};
async function hSub(request, uuid) {
    const url = new URL(request.url);
    const finalLinks = [];
    const workerDomain = url.hostname;
    const filters = {
        domains: url.searchParams.get('domains')?.split(',') || [],
        ports: url.searchParams.get('ports')?.split(',') || []
    };
    const domainList = filters.domains.length > 0
        ? DD.filter(d => filters.domains.some(sel => d.domain.toLowerCase().includes(sel.toLowerCase())))
        : DD;
    finalLinks.push(...gLinks(domainList, uuid, workerDomain, filters));
    if (finalLinks.length === 0) {
        return new Response('No nodes available', { status: 404 });
    }
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
function gLinks(domainList, uuid, workerDomain, filters = {}) {
    const port = 443;
    const links = [];
    const wsPath = encodeURIComponent('/?ed=2048');
    const proto = 'vless';
    domainList.forEach(item => {
        if (SC.length > 0) {
            SC.forEach((socksConfig, socksIndex) => {
                const { region, note } = socksConfig;
                const domainName = item.domain;
                const nodeName = `Sin-${region}-${note || ''}`;
                const wsPathWithSocks = encodeURIComponent(`/?ed=2048&socks=${socksIndex}`);
                const params = new URLSearchParams({
                    encryption: 'none',
                    security: 'tls',
                    type: 'ws',
                    host: workerDomain,
                    path: wsPathWithSocks
                });
                params.append('sni', workerDomain);
                params.append('fp', 'firefox');
                links.push(`${proto}://${uuid}@${item.domain}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
            });
        } else {
            const domainName = item.domain;
            const nodeName = `Sinppets-${domainName}`;
            const params = new URLSearchParams({
                encryption: 'none',
                security: 'tls',
                type: 'ws',
                host: workerDomain,
                path: wsPath
            });
            params.append('sni', workerDomain);
            params.append('fp', 'firefox');
            links.push(`${proto}://${uuid}@${item.domain}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
        }
    });
    return links;
}
async function hWs(request) {
    const url = new URL(request.url);
    const socksIndex = parseInt(url.searchParams.get('socks') || '0');
    let parsedSocks5Config = {};
    let isSocksEnabled = false;
    if (SC.length > 0 && socksIndex >= 0 && socksIndex < SC.length) {
        try {
            parsedSocks5Config = pSC(SC[socksIndex].config);
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
    const readable = mRS(serverSock, earlyData);
    readable.pipeTo(new WritableStream({
        async write(chunk) {
            if (isDnsQuery) return await fUDP(chunk, serverSock, null);
            if (remoteConnWrapper.socket) {
                const writer = remoteConnWrapper.socket.writable.getWriter();
                await writer.write(chunk);
                writer.releaseLock();
                return;
            }
            const { hasError, message, addressType, port, hostname, rawIndex, version, isUDP } = pPkt(chunk, T);
            if (hasError) throw new Error(message);
            if (isUDP) {
                if (port === 53) isDnsQuery = true;
                else throw new Error(E4);
            }
            const respHeader = new Uint8Array([version[0], 0]);
            const rawData = chunk.slice(rawIndex);
            if (isDnsQuery) return fUDP(rawData, serverSock, respHeader);
            await fTCP(addressType, hostname, port, rawData, serverSock, respHeader, remoteConnWrapper, isSocksEnabled, parsedSocks5Config);
        },
    })).catch((err) => { console.log('WS Stream Error:', err); });
    return new Response(null, { status: 101, webSocket: clientSock });
}
async function fTCP(addrType, host, portNum, rawData, ws, respHeader, remoteConnWrapper, isSocksEnabled, parsedSocks5Config) {
    async function connectAndSend(address, port) {
        const remoteSock = isSocksEnabled ?
            await eSocks(addrType, address, port, parsedSocks5Config) :
            connect({ hostname: address, port: port });
        const writer = remoteSock.writable.getWriter();
        await writer.write(rawData);
        writer.releaseLock();
        return remoteSock;
    }
    async function retryConnection() {
        const newSocket = isSocksEnabled ?
            await connectAndSend(host, portNum) :
            await connectAndSend(FA || host, parseInt(FP, 10) || portNum);
        remoteConnWrapper.socket = newSocket;
        newSocket.closed.catch(() => { }).finally(() => cSock(ws));
        cStr(newSocket, ws, respHeader, null);
    }
    try {
        const initialSocket = await connectAndSend(host, portNum);
        remoteConnWrapper.socket = initialSocket;
        cStr(initialSocket, ws, respHeader, retryConnection);
    } catch (err) {
        console.log('Initial connection failed, trying fallback:', err);
        retryConnection();
    }
}
function pPkt(chunk, token) {
    if (chunk.byteLength < 24) return { hasError: true, message: E1 };
    const version = new Uint8Array(chunk.slice(0, 1));
    if (fID(new Uint8Array(chunk.slice(1, 17))) !== token) return { hasError: true, message: E2 };
    const optLen = new Uint8Array(chunk.slice(17, 18))[0];
    const cmd = new Uint8Array(chunk.slice(18 + optLen, 19 + optLen))[0];
    let isUDP = false;
    if (cmd === 1) { } else if (cmd === 2) { isUDP = true; } else { return { hasError: true, message: E3 }; }
    const portIdx = 19 + optLen;
    const port = new DataView(chunk.slice(portIdx, portIdx + 2)).getUint16(0);
    let addrIdx = portIdx + 2, addrLen = 0, addrValIdx = addrIdx + 1, hostname = '';
    const addressType = new Uint8Array(chunk.slice(addrIdx, addrValIdx))[0];
    switch (addressType) {
        case A1: addrLen = 4; hostname = new Uint8Array(chunk.slice(addrValIdx, addrValIdx + addrLen)).join('.'); break;
        case A2: addrLen = new Uint8Array(chunk.slice(addrValIdx, addrValIdx + 1))[0]; addrValIdx += 1; hostname = new TextDecoder().decode(chunk.slice(addrValIdx, addrValIdx + addrLen)); break;
        case A3: addrLen = 16; const ipv6 = []; const ipv6View = new DataView(chunk.slice(addrValIdx, addrValIdx + addrLen)); for (let i = 0; i < 8; i++) ipv6.push(ipv6View.getUint16(i * 2).toString(16)); hostname = ipv6.join(':'); break;
        default: return { hasError: true, message: `${E5}: ${addressType}` };
    }
    if (!hostname) return { hasError: true, message: `${E6}: ${addressType}` };
    return { hasError: false, addressType, port, hostname, isUDP, rawIndex: addrValIdx + addrLen, version };
}
function mRS(socket, earlyDataHeader) {
    let cancelled = false;
    return new ReadableStream({
        start(controller) {
            socket.addEventListener('message', (event) => { if (!cancelled) controller.enqueue(event.data); });
            socket.addEventListener('close', () => { if (!cancelled) { cSock(socket); controller.close(); } });
            socket.addEventListener('error', (err) => controller.error(err));
            const { earlyData, error } = b64A(earlyDataHeader);
            if (error) controller.error(error); else if (earlyData) controller.enqueue(earlyData);
        },
        cancel() { cancelled = true; cSock(socket); }
    });
}
async function cStr(remoteSocket, webSocket, headerData, retryFunc) {
    let header = headerData, hasData = false;
    await remoteSocket.readable.pipeTo(
        new WritableStream({
            async write(chunk, controller) {
                hasData = true;
                if (webSocket.readyState !== 1) controller.error(E7);
                if (header) { webSocket.send(await new Blob([header, chunk]).arrayBuffer()); header = null; }
                else { webSocket.send(chunk); }
            },
            abort(reason) { console.error("Readable aborted:", reason); },
        })
    ).catch((error) => { console.error("Stream connection error:", error); cSock(webSocket); });
    if (!hasData && retryFunc) retryFunc();
}
async function fUDP(udpChunk, webSocket, respHeader) {
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
async function eSocks(addrType, address, port, parsedSocks5Config) {
    const { username, password, hostname, socksPort } = parsedSocks5Config;
    const socket = connect({ hostname, port: socksPort });
    const writer = socket.writable.getWriter();
    await writer.write(new Uint8Array(username ? [5, 2, 0, 2] : [5, 1, 0]));
    const reader = socket.readable.getReader();
    let res = (await reader.read()).value;
    if (res[0] !== 5 || res[1] === 255) throw new Error(EA);
    if (res[1] === 2) {
        if (!username || !password) throw new Error(EB);
        const encoder = new TextEncoder();
        const authRequest = new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]);
        await writer.write(authRequest);
        res = (await reader.read()).value;
        if (res[0] !== 1 || res[1] !== 0) throw new Error(EC);
    }
    const encoder = new TextEncoder(); let DSTADDR;
    switch (addrType) {
        case A1: DSTADDR = new Uint8Array([1, ...address.split('.').map(Number)]); break;
        case A2: DSTADDR = new Uint8Array([3, address.length, ...encoder.encode(address)]); break;
        case A3: DSTADDR = new Uint8Array([4, ...address.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]); break;
        default: throw new Error(E5);
    }
    await writer.write(new Uint8Array([5, 1, 0, ...DSTADDR, port >> 8, port & 255]));
    res = (await reader.read()).value;
    if (res[1] !== 0) throw new Error(ED);
    writer.releaseLock(); reader.releaseLock();
    return socket;
}
function pSC(s) { let u, p, h, pt; const ai = s.lastIndexOf('@'); if (ai > 0) { const ap = s.substring(0, ai), hp = s.substring(ai + 1), ci = ap.indexOf(':'); if (ci > 0) { u = ap.substring(0, ci); p = ap.substring(ci + 1); } const lc = hp.lastIndexOf(':'); if (lc > 0) { h = hp.substring(0, lc); pt = Number(hp.substring(lc + 1)); } else { h = hp; pt = 1080; } } else { const lc = s.lastIndexOf(':'); if (lc > 0) { h = s.substring(0, lc); pt = Number(s.substring(lc + 1)); } else { h = s; pt = 1080; } } if (isNaN(pt)) throw new Error(E9); return { username: u, password: p, hostname: h, socksPort: pt }; }
function b64A(b64Str) {
    if (!b64Str) return { error: null };
    try { b64Str = b64Str.replace(/-/g, '+').replace(/_/g, '/'); return { earlyData: Uint8Array.from(atob(b64Str), (c) => c.charCodeAt(0)).buffer, error: null }; }
    catch (error) { return { error }; }
}
function isVF(uuid) { return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid); }
function cSock(socket) { try { if (socket.readyState === 1 || socket.readyState === 2) socket.close(); } catch (error) { } }
const hexTable = Array.from({ length: 256 }, (v, i) => (i + 256).toString(16).slice(1));
function fID(arr, offset = 0) {
    const id = (hexTable[arr[offset]] + hexTable[arr[offset + 1]] + hexTable[arr[offset + 2]] + hexTable[arr[offset + 3]] + "-" + hexTable[arr[offset + 4]] + hexTable[arr[offset + 5]] + "-" + hexTable[arr[offset + 6]] + hexTable[arr[offset + 7]] + "-" + hexTable[arr[offset + 8]] + hexTable[arr[offset + 9]] + "-" + hexTable[arr[offset + 10]] + hexTable[arr[offset + 11]] + hexTable[arr[offset + 12]] + hexTable[arr[offset + 13]] + hexTable[arr[offset + 14]] + hexTable[arr[offset + 15]]).toLowerCase();
    if (!isVF(id)) throw new TypeError(E8);
    return id;
}
async function hChk(request) {
    const url = new URL(request.url);
    const idx = url.searchParams.get('index');
    const checkOne = async (socksConfig) => {
        const startTime = Date.now();
        try {
            const parsed = pSC(socksConfig.config);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('连接超时')), 2000);
            });
            const connectionPromise = eSocks(
                A1,
                '1.1.1.1',
                80,
                parsed
            );
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
function gHTML() {
    const needPassword = !!(PW && PW.trim());
    const passwordValue = PW || '';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VLESS订阅</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:linear-gradient(135deg,#7dd3ca,#a17ec4);min-height:100vh;padding:20px;display:flex;align-items:center;justify-content:center}.co{max-width:1056px;width:100%;background:#fff;border-radius:12px}#lo.co{max-width:480px}.h{background:linear-gradient(135deg,#7dd3ca,#a17ec4);color:#fff;padding:20px;text-align:center;position:relative}.h h2{font-size:24px;margin-bottom:8px}.h p{font-size:14px;opacity:.9}.h .logout{position:absolute;top:20px;right:20px;color:#fff;background:rgba(255,255,255,.2);border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600}.h .logout:hover{background:rgba(255,255,255,.3)}.s{padding:8px 12px;border-bottom:1px solid #eee}.s:last-child{border:none}.t{font-size:16px;font-weight:600;margin-bottom:10px;color:#333;display:flex;align-items:center}.t::before{content:'';display:inline-block;width:4px;height:16px;background:#7dd3ca;margin-right:8px;border-radius:2px}.btn-group{display:flex;gap:4px;margin-bottom:10px}.btn-small{padding:6px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:13px;cursor:pointer}.btn-small:hover{background:#f0f0f0}.btn-small:last-child{margin-left:auto}.dg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.di{display:flex;align-items:center;padding:6px 8px;border:2px solid #e0e0e0;border-radius:6px;background:#fafafa;font-size:13px;cursor:pointer}.di:hover{background:#f0f0f0;border-color:#7dd3ca}.di.sel{background:#f0f4ff;border-color:#7dd3ca}.di input{margin-right:8px;cursor:pointer}#sc{display:flex;flex-wrap:wrap;gap:8px}.c{background:#f8f9fa;border:2px solid #e0e0e0;border-radius:6px;padding:10px;flex:0 0 200px}.c.on{border-color:#4CAF50;background:#f1f8f4}.c.off{border-color:#f44;background:#fef1f0}.c div{display:flex;justify-content:space-between;gap:8px;margin:3px 0}.c b{font-size:13px}.c span{font-size:11px;color:#666}.c .chk-btn{padding:2px 8px;font-size:10px;background:#7dd3ca;color:#fff;border:none;border-radius:4px;cursor:pointer}.c .chk-btn:hover{opacity:.8}.c .row2{display:flex;align-items:center;justify-content:space-between;gap:4px}.gen{width:100%;padding:14px;background:linear-gradient(135deg,#7dd3ca,#a17ec4);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}.gen:hover{opacity:.9}.res{margin-top:15px;padding:15px;background:#f9f9f9;border-radius:8px;border-left:4px solid #7dd3ca;display:none}.res .app-label{display:inline-block;background:#f44;color:#fff;padding:4px 12px;border-radius:4px;font-weight:600;font-size:14px;margin-right:10px;vertical-align:middle;width:80px;text-align:center}.res .link-wrapper{display:flex;align-items:center}.res input{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:monospace;font-size:12px;background:#fff;cursor:pointer;text-align:left;color:#7dd3ca;font-weight:600}.lo{padding:24px;max-width:420px;margin:0 auto}.lf{display:flex;flex-direction:column;gap:16px}.ig{display:flex;flex-direction:column;gap:6px}.ig label{font-size:14px;font-weight:500;color:#333}.ig input{padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px}.ig input:focus{outline:none;border-color:#7dd3ca}.lb{padding:14px;background:linear-gradient(135deg,#7dd3ca,#a17ec4);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}.em{color:#f44;font-size:13px;padding:10px;background:#fee;border-radius:6px;display:none}</style></head><body><div class="co" id="lo" style="display:${needPassword ? 'block' : 'none'}"><div class="h"><h2>🔐 登录</h2></div><div class="lo"><form class="lf" id="lf"><div class="ig"><label>密码</label><input type="password" id="pw" required></div><div class="em" id="em">密码错误</div><button type="submit" class="lb">登录</button></form></div></div><div class="co" id="mc" style="display:${needPassword ? 'none' : 'block'}"><div class="h"><button class="logout" onclick="logout()">退出</button><h2>🚀 VLESS节点订阅</h2><p>选择域名生成专属订阅链接(默认443端口)，Clash订阅拼接为老王大佬的后端</p></div><form id="ff"><div class="s"><div class="t">优选域名</div><div class="btn-group"><button type="button" class="btn-small" onclick="sA()">全选</button><button type="button" class="btn-small" onclick="cA()">清空</button></div><div class="dg" id="dg"></div></div><div class="s"><div class="t">📡 SOCKS状态<button type="button" class="btn-small" onclick="chkS()">刷新全部</button></div><div id="sc">${SC.map((s, i) => `<div class="c" data-i="${i}"><div><b>${s.region}</b><span id="ip${i}">-</span></div><div class="row2"><span id="s${i}">⚪</span><button type="button" class="chk-btn" onclick="event.stopPropagation();chkOne(${i})">检测</button><span id="l${i}">-</span></div></div>`).join('')}</div></div><button type="submit" class="gen">✨ 生成订阅</button></form><div id="res" class="res"><div class="link-wrapper"><span class="app-label">V2rayN</span><input type="text" id="url" readonly onclick="cpU()" title="点击复制"></div></div><div id="cres" class="res" style="margin-top:10px"><div class="link-wrapper"><span class="app-label">Clash</span><input type="text" id="curl" readonly onclick="cpC()" title="点击复制"></div></div></div><script>const PW='${passwordValue}',np=${needPassword},ds=[${DD.map(d => `{n:"${d.name || d.domain}",d:"${d.domain}"}`).join(',')}],SC=[${SC.map(s => `{region:"${s.region}",config:"${s.config}"}`).join(',')}];function cl(){return!np||sessionStorage.getItem('vl_l')==='1'}function sm(){document.getElementById('lo').style.display='none';document.getElementById('mc').style.display='block'}const lf=document.getElementById('lf');if(lf){lf.addEventListener('submit',e=>{e.preventDefault();if(document.getElementById('pw').value===PW){sessionStorage.setItem('vl_l','1');sm();init();setTimeout(chkS,500);document.getElementById('em').style.display='none'}else{document.getElementById('em').style.display='block';document.getElementById('pw').value=''}})}function pIP(c){try{const a=c.lastIndexOf('@');if(a===-1)return'未知';const h=c.substring(a+1),ci=h.lastIndexOf(':');return ci===-1?h:h.substring(0,ci)}catch(e){return'失败'}}function init(){const g=document.getElementById('dg');g.innerHTML='';ds.forEach(d=>{const di=document.createElement('div');di.className='di';di.innerHTML=\`<input type="checkbox" name="d" value="\${d.d}" onchange="uS(this)">\${d.n}\`;di.onclick=e=>{if(e.target.type!=='checkbox'){const cb=di.querySelector('input');cb.checked=!cb.checked;uS(cb)}};g.appendChild(di)});const cs=document.querySelectorAll('.c');cs.forEach(c=>{const ix=c.dataset.i;const cfg=SC[ix]?.config;if(cfg)document.getElementById('ip'+ix).textContent=pIP(cfg)})}function uS(cb){cb.closest('.di').classList.toggle('sel',cb.checked)}function sA(){document.querySelectorAll('[name="d"]').forEach(cb=>{cb.checked=true;uS(cb)})}function cA(){document.querySelectorAll('[name="d"]').forEach(cb=>{cb.checked=false;uS(cb)})}document.getElementById('ff').onsubmit=function(e){e.preventDefault();const sd=Array.from(document.querySelectorAll('input[name=\"d\"]:checked')).map(cb=>cb.value);const p=new URLSearchParams();if(sd.length>0)p.append('domains',sd.join(','));const u=window.location.origin+'/${T}'+(p.toString()?'?'+p.toString():'');const cu='https://sub.ssss.xx.kg/clash?config='+u+'&ua=&selectedRules=\"comprehensive\"&customRules=[]';document.getElementById('url').value=u;document.getElementById('curl').value=cu;document.getElementById('res').style.display='block';document.getElementById('cres').style.display='block';document.getElementById('url').scrollIntoView({behavior:'smooth',block:'center'})};function cpU(){const i=document.getElementById('url');if(i.value.includes('✅'))return;const v=i.value;i.select();document.execCommand('copy');i.value='✅ 已复制成功!';const oc=i.style.color;i.style.color='#4CAF50';setTimeout(()=>{i.value=v;i.style.color=oc},1500)}function cpC(){const i=document.getElementById('curl');if(i.value.includes('✅'))return;const v=i.value;i.select();document.execCommand('copy');i.value='✅ 已复制成功!';const oc=i.style.color;i.style.color='#4CAF50';setTimeout(()=>{i.value=v;i.style.color=oc},1500)}function logout(){sessionStorage.removeItem('vl_l');location.reload()}async function chkOne(ix){const c=document.querySelectorAll('.c')[ix];c.classList.remove('on','off');document.getElementById('s'+ix).textContent='⏳';try{const r=await fetch('/api/check-socks?index='+ix),d=await r.json();if(d.status==='online'){document.getElementById('s'+ix).textContent='🟢';document.getElementById('l'+ix).textContent=d.latency+'ms';c.classList.add('on')}else{document.getElementById('s'+ix).textContent='🔴';document.getElementById('l'+ix).textContent='离线';c.classList.add('off')}}catch(e){document.getElementById('s'+ix).textContent='🔴';document.getElementById('l'+ix).textContent='错误';c.classList.add('off')}}async function chkS(){const cs=document.querySelectorAll('.c');cs.forEach(c=>{c.classList.remove('on','off')});for(let i=0;i<cs.length;i++){await chkOne(i)}}window.onload=()=>{if(cl()){sm();init();setTimeout(chkS,500)}else if(np){document.getElementById('lo').style.display='block'}else{init();setTimeout(chkS,500)}}</script></body></html>`;

}
