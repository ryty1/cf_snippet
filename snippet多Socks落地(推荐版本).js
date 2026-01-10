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
    const allPorts = [443, 80];
    const ports = filters.ports && filters.ports.length > 0
        ? allPorts.filter(p => filters.ports.includes(p.toString()))
        : allPorts;
    const links = [];
    const wsPath = encodeURIComponent('/?ed=2048');
    const proto = 'vless';
    domainList.forEach(item => {
        if (SC.length > 0) {
            SC.forEach((socksConfig, socksIndex) => {
                const { region } = socksConfig;
                ports.forEach(port => {
                    const domainName = item.domain;
                    const nodeName = `Sinppets-${region}-${domainName}-${port}`;
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
                        params.append('fp', 'firefox');
                    }
                    links.push(`${proto}://${uuid}@${item.domain}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
                });
            });
        } else {
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
                    params.append('fp', 'firefox');
                }
                links.push(`${proto}://${uuid}@${item.domain}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`);
            });
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
function pSC(address) {
    let [latter, former] = address.split("@").reverse(); let username, password, hostname, socksPort;
    if (former) { const formers = former.split(":"); if (formers.length !== 2) throw new Error(E9);[username, password] = formers; }
    const latters = latter.split(":"); socksPort = Number(latters.pop()); if (isNaN(socksPort)) throw new Error(E9);
    hostname = latters.join(":"); if (hostname.includes(":") && !/^\[.*\]$/.test(hostname)) throw new Error(E9);
    return { username, password, hostname, socksPort };
}
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
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sinppets 节点订阅</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px;display:flex;align-items:center;justify-content:center}.container{max-width:1056px;width:100%;background:#fff;border-radius:12px}#loginContainer.container{max-width:480px;box-shadow:0 10px 40px rgba(0,0,0,0.2);overflow:hidden}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:20px;text-align:center}.header h2{font-size:24px;margin-bottom:8px}.header p{font-size:14px;opacity:0.9}.section{padding:8px 12px;border-bottom:1px solid #eee}.section:last-child{border-bottom:none}.section-title{font-size:16px;font-weight:600;margin-bottom:10px;color:#333;display:flex;align-items:center}.section-title::before{content:'';display:inline-block;width:4px;height:16px;background:#667eea;margin-right:8px;border-radius:2px}.btn-group{display:flex;gap:4px;margin-bottom:10px}.btn-small{padding:6px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:13px;cursor:pointer;transition:all 0.3s}.btn-small:hover{background:#f0f0f0;transform:translateY(-1px)}.btn-small.active{background:#667eea;color:#fff;border-color:#667eea}.domain-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.domain-item{display:flex;align-items:center;padding:6px 8px;border:2px solid #e0e0e0;border-radius:6px;background:#fafafa;font-size:13px;cursor:pointer;transition:all 0.3s}.domain-item:hover{background:#f0f0f0;border-color:#667eea}.domain-item.selected{background:#f0f4ff;border-color:#667eea;box-shadow:0 2px 8px rgba(102,126,234,0.2)}.domain-item input{margin-right:8px;cursor:pointer}.port-grid{display:flex;gap:8px}.port-item{display:flex;align-items:center;justify-content:flex-start;padding:6px 8px;border:2px solid #e0e0e0;border-radius:6px;background:#fafafa;font-size:13px;cursor:pointer;transition:all 0.3s;width:fit-content}.port-item:hover{background:#f0f0f0;border-color:#667eea}.port-item.selected{background:#f0f4ff;border-color:#667eea;box-shadow:0 2px 8px rgba(102,126,234,0.2)}.port-item input{margin-right:8px;cursor:pointer}.generate-btn{width:100%;padding:14px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 15px rgba(102,126,234,0.4)}.generate-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.5)}.generate-btn:active{transform:translateY(0)}.result{margin-top:15px;padding:15px;background:#f9f9f9;border-radius:8px;border-left:4px solid #667eea}.result input{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:monospace;font-size:12px;margin-bottom:10px;background:#fff}.copy-btn:hover{background:#45a049;transform:translateY(-1px)}.socks-info{background:#e8f0fe;padding:12px;border-radius:6px;font-size:13px;color:#1967d2}.socks-info strong{display:block;margin-bottom:8px}.socks-status-container{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start}.socks-status-card{background:#f8f9fa;border:2px solid #e0e0e0;border-radius:6px;padding:10px;transition:all 0.3s;display:flex;flex-direction:column;gap:6px;flex:0 0 200px;width:200px}.socks-status-card.online{border-color:#4CAF50;background:#f1f8f4}.socks-status-card.offline{border-color:#f44336;background:#fef1f0}.socks-card-row{display:flex;justify-content:space-between;align-items:center;gap:8px}.socks-region{font-weight:600;font-size:13px;color:#333;flex-shrink:0}.socks-ip{font-size:11px;color:#666;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:right}.status-indicator{font-size:11px;padding:3px 8px;border-radius:12px;font-weight:500;white-space:nowrap;flex-shrink:0}.status-indicator.online{background:#4CAF50;color:#fff}.status-indicator.offline{background:#f44336;color:#fff}.status-indicator.checking{background:#9e9e9e;color:#fff}.socks-latency{font-size:11px;color:#666;flex:1;text-align:right}.login-container{padding:24px 32px;max-width:420px;margin:0 auto}.login-form{display:flex;flex-direction:column;gap:16px}.input-group{display:flex;flex-direction:column;gap:6px}.input-group label{font-size:14px;font-weight:500;color:#333}.input-group input{padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px;transition:all 0.3s}.input-group input:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,0.1)}.login-btn{padding:14px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 15px rgba(102,126,234,0.4)}.login-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.5)}.login-btn:active{transform:translateY(0)}.error-msg{color:#f44336;font-size:13px;padding:10px;background:#ffebee;border-radius:6px;display:none}.logout-btn{position:absolute;top:20px;right:20px;padding:8px 16px;background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.3s}.logout-btn:hover{background:rgba(255,255,255,0.3)}@media (max-width:480px){.domain-grid{grid-template-columns:1fr}.port-grid{grid-template-columns:1fr}.logout-btn{position:static;margin-top:10px;width:100%}}</style></head><body><div class="container" id="loginContainer" style="display:${needPassword ? 'block' : 'none'}"><div class="header"><h2>🔐 登录验证</h2><p>请输入访问密码</p></div><div class="login-container"><form class="login-form" id="loginForm"><div class="input-group"><label for="password">访问密码</label><input type="password" id="password" placeholder="请输入密码" required autofocus></div><div class="error-msg" id="errorMsg">密码错误，请重试</div><button type="submit" class="login-btn">🔓 登录</button></form></div></div><div class="container" id="mainContainer" style="display:${needPassword ? 'none' : 'block'}"><div class="header" style="position:relative"><h2>🚀 Sinppets 节点订阅</h2><p>选择域名和端口生成专属订阅链接</p>${needPassword ? '<button class="logout-btn" onclick="logout()">🚪 退出登录</button>' : ''}</div><form id="filterForm"><div class="section"><div class="section-title">优选域名</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('domain')">全选</button><button type="button" class="btn-small" onclick="clearAll('domain')">清空</button></div><div class="domain-grid" id="domainGrid"></div></div><div class="section"><div class="section-title">端口选择</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('port')">全选</button><button type="button" class="btn-small" onclick="clearAll('port')">清空</button></div><div class="port-grid" id="portGrid"><div class="port-item"><input type="checkbox" name="port" value="443" onchange="updateItemStyle(this)">🔒 443 (HTTPS)</div><div class="port-item"><input type="checkbox" name="port" value="80" onchange="updateItemStyle(this)">🌐 80 (HTTP)</div></div></div>                <div class="section"><div class="section-title">📡 SOCKS代理状态<button type="button" class="btn-small" style="margin-left:auto" onclick="checkSocksStatus()">刷新检测</button></div><div id="socksStatusContainer" class="socks-status-container">${SC.map((s, i) => `<div class="socks-status-card" data-index="${i}" data-config="${s.config}"><div class="socks-card-row"><span class="socks-region">${s.region}</span><span class="socks-ip" id="ip-${i}">---</span></div><div class="socks-card-row"><span class="status-indicator checking" id="status-${i}">⚪ 在线</span><span class="socks-latency" id="latency-${i}">---</span></div></div>`).join('')}</div></div><button type="submit" class="generate-btn">✨ 生成订阅链接</button></form><div id="result" class="result" style="display:none"><input type="text" id="subscriptionUrl" readonly onclick="copyUrl()" style="cursor:pointer;text-align:center;color:#667eea;font-weight:600" title="点击复制"></div></div><script>const PASSWORD='${passwordValue}';const needPassword=${needPassword};const domains=[${DD.map(d => `{name:"${d.name || d.domain}",domain:"${d.domain}"}`).join(',')}];function parseIP(config){try{const atIndex=config.lastIndexOf('@');if(atIndex===-1)return'未知';const hostPort=config.substring(atIndex+1);const colonIndex=hostPort.lastIndexOf(':');if(colonIndex===-1)return hostPort;return hostPort.substring(0,colonIndex)}catch(e){return'解析失败'}}function checkLogin(){if(!needPassword)return true;return sessionStorage.getItem('sinppets_logged_in')==='true'}function showMain(){document.getElementById('loginContainer').style.display='none';document.getElementById('mainContainer').style.display='block'}function showLogin(){document.getElementById('loginContainer').style.display='block';document.getElementById('mainContainer').style.display='none'}function logout(){sessionStorage.removeItem('sinppets_logged_in');showLogin();const pwdInput=document.getElementById('password');if(pwdInput)pwdInput.value=''}const loginForm=document.getElementById('loginForm');if(loginForm){loginForm.addEventListener('submit',function(e){e.preventDefault();const pwd=document.getElementById('password').value;if(pwd===PASSWORD){sessionStorage.setItem('sinppets_logged_in','true');showMain();initDomains();displayIPs();document.getElementById('errorMsg').style.display='none'}else{document.getElementById('errorMsg').style.display='block';document.getElementById('password').value='';document.getElementById('password').focus()}})}function displayIPs(){const cards=document.querySelectorAll('.socks-status-card');cards.forEach(card=>{const idx=card.dataset.index;const config=card.dataset.config;const ipEl=document.getElementById('ip-'+idx);if(ipEl)ipEl.textContent=parseIP(config)})}function initDomains(){const grid=document.getElementById('domainGrid');grid.innerHTML='';domains.forEach(d=>{const div=document.createElement('div');div.className='domain-item';div.innerHTML=\`<input type="checkbox" name="domain" value="\${d.domain}" onchange="updateItemStyle(this)">\${d.name}\`;div.onclick=(e)=>{if(e.target.type!=='checkbox'){const cb=div.querySelector('input');cb.checked=!cb.checked;updateItemStyle(cb)}};grid.appendChild(div)})}function updateItemStyle(checkbox){const item=checkbox.closest('.domain-item, .port-item');item.classList.toggle('selected',checkbox.checked)}function selectAll(type){const selector=type==='domain'?'[name="domain"]':'[name="port"]';document.querySelectorAll(selector).forEach(cb=>{cb.checked=true;updateItemStyle(cb)})}function clearAll(type){const selector=type==='domain'?'[name="domain"]':'[name="port"]';document.querySelectorAll(selector).forEach(cb=>{cb.checked=false;updateItemStyle(cb)})}document.getElementById('filterForm').onsubmit=function(e){e.preventDefault();const selectedDomains=Array.from(document.querySelectorAll('input[name="domain"]:checked')).map(cb=>cb.value);const selectedPorts=Array.from(document.querySelectorAll('input[name="port"]:checked')).map(cb=>cb.value);const params=new URLSearchParams();if(selectedDomains.length>0)params.append('domains',selectedDomains.join(','));if(selectedPorts.length>0)params.append('ports',selectedPorts.join(','));const url=window.location.origin+'/${T}'+(params.toString()?'?'+params.toString():'');document.getElementById('subscriptionUrl').value=url;document.getElementById('result').style.display='block';document.getElementById('subscriptionUrl').scrollIntoView({behavior:'smooth',block:'center'})};function copyUrl(){const i=document.getElementById('subscriptionUrl');if(i.value.includes('✅'))return;const v=i.value;i.select();document.execCommand('copy');i.value='✅ 已复制成功!';const oc=i.style.color;i.style.color='#4CAF50';setTimeout(()=>{i.value=v;i.style.color=oc},1500)}async function checkSocksStatus(){const cards=document.querySelectorAll('.socks-status-card');cards.forEach(card=>{card.classList.remove('online','offline');const idx=card.dataset.index;document.getElementById('status-'+idx).className='status-indicator checking';document.getElementById('status-'+idx).textContent='⚪ 检测中';document.getElementById('latency-'+idx).textContent='---'});for(let i=0;i<cards.length;i++){const card=cards[i],idx=card.dataset.index,statusEl=document.getElementById('status-'+idx),latencyEl=document.getElementById('latency-'+idx);statusEl.textContent='⏳';try{const response=await fetch('/api/check-socks?index='+idx);const result=await response.json();if(result.status==='online'){statusEl.className='status-indicator online';statusEl.textContent='🟢 在线';latencyEl.textContent='延迟: '+result.latency+'ms';card.classList.add('online')}else{statusEl.className='status-indicator offline';statusEl.textContent='🔴 离线';latencyEl.textContent='无法连接';card.classList.add('offline')}}catch(error){statusEl.className='status-indicator offline';statusEl.textContent='🔴 错误';latencyEl.textContent='检测失败';card.classList.add('offline')}}}function initPorts(){const grid=document.getElementById('portGrid');const items=grid.querySelectorAll('.port-item');items.forEach(item=>{item.onclick=(e)=>{if(e.target.type!=='checkbox'){const cb=item.querySelector('input');cb.checked=!cb.checked;updateItemStyle(cb)}}})}window.onload=()=>{if(checkLogin()){showMain();initDomains();initPorts();displayIPs();setTimeout(checkSocksStatus,500)}else if(needPassword){showLogin()}else{initDomains();initPorts();displayIPs();setTimeout(checkSocksStatus,500)}}</script></body></html>`;

}
