import { connect } from 'cloudflare:sockets';

// --- 硬编码配置 ---
// UUID，同时用作订阅路径。
const authToken = '8442017a-60c6-4861-97e4-cf2eae8e5ce1';
// 用来访问cloudflare托管的网站
const fallbackAddress = 'ProxyIP.cmliussss.net';
const fallbackPort = '443';

// SOCKS5 禁用。
 const socks5Config = '';
 const parsedSocks5Config = {};
 const isSocksEnabled = false;

// 启用SOCK5，格式: user:pass@host:port

/*
const socks5Config = 'user:pass@host:port';
// 解析 SOCKS5 配置
let parsedSocks5Config = {};
let isSocksEnabled = false;

if (socks5Config && socks5Config.trim()) {
    try {
        parsedSocks5Config = parseSocksConfig(socks5Config);
        isSocksEnabled = true;
        console.log('SOCKS5 proxy enabled:', parsedSocks5Config.hostname);
    } catch (error) {
        console.error('Failed to parse SOCKS5 config:', error.message);
        isSocksEnabled = false;
    }
}
*/

const directDomains = [
    { domain: "cf.090227.xyz" },
    { domain: "cf.877771.xyz" }
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
        isps: url.searchParams.get('isps')?.split(',') || [],
        ports: url.searchParams.get('ports')?.split(',') || [],
        nodynamic: url.searchParams.get('nodynamic') === '1'
    };

    // 验证端口选择 - 如果有端口参数但为空，返回错误
    if (url.searchParams.has('ports') && filters.ports.length === 0) {
        return new Response('请至少选择一个端口', { status: 400 });
    }

    // 始终添加原生地址
    const nativeList = [{ ip: workerDomain, isp: '原生地址' }];
    finalLinks.push(...generateLinksFromSource(nativeList, uuid, workerDomain, filters));

    // 只有在选择了域名时才添加固定域名节点
    if (filters.domains.length > 0) {
        const domainList = directDomains.map(d => ({ ip: d.domain, isp: d.name || d.domain }));
        finalLinks.push(...generateLinksFromSource(domainList, uuid, workerDomain, filters));
    }

    // 只有在未禁用动态IP时才获取
    if (!filters.nodynamic) {
        const dynamicIPList = await fetchDynamicIPs();
        if (dynamicIPList.length > 0) {
            finalLinks.push(...generateLinksFromSource(dynamicIPList, uuid, workerDomain, filters));
        }
    }

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

function generateLinksFromSource(list, uuid, workerDomain, filters = {}) {
    const httpsPorts = [443, 2053, 2083, 2087, 2096, 8443];
    const httpPorts = [80, 8080, 8880, 2052, 2082, 2086, 2095];
    const links = [];
    const wsPath = encodeURIComponent('/?ed=2048');
    const proto = 'vless';

    list.forEach(item => {
        // 应用域名筛选 - 只对固定域名列表生效，不影响动态IP
        if (filters && filters.domains && filters.domains.length > 0) {
            // 检查当前item是否在directDomains列表中
            const isDirectDomain = directDomains.some(d => d.domain === item.ip);
            if (isDirectDomain) {
                // 如果是固定域名，检查是否在筛选列表中
                const domainMatch = filters.domains.some(domain => 
                    item.ip.toLowerCase().includes(domain.toLowerCase())
                );
                if (!domainMatch) return;
            }
            // 如果不是固定域名（如动态IP），则不应用域名筛选
        }

        // 应用ISP筛选 - 只对动态IP生效
        if (filters && filters.isps && filters.isps.length > 0) {
            // 检查当前item是否是动态IP（不在directDomains中且不是原生地址）
            const isDirectDomain = directDomains.some(d => d.domain === item.ip);
            const isNative = item.isp === '原生地址';
            if (!isDirectDomain && !isNative) {
                // 如果是动态IP，应用ISP筛选
                const ispMatch = filters.isps.some(isp => 
                    item.isp.toLowerCase().includes(isp.toLowerCase())
                );
                if (!ispMatch) return;
            }
        }

        const nodeNameBase = item.isp.replace(/\s/g, '_');
        const safeIP = item.ip.includes(':') ? `[${item.ip}]` : item.ip;

        // 生成HTTPS端口节点
        httpsPorts.forEach(port => {
            // 应用端口筛选
            if (filters && filters.ports && filters.ports.length > 0 && !filters.ports.includes(port.toString())) {
                return;
            }
            
            const wsNodeName = `${nodeNameBase}-${port}-WS-TLS`;
            const wsParams = new URLSearchParams({ 
                encryption: 'none', 
                security: 'tls', 
                sni: workerDomain, 
                fp: 'randomized', 
                type: 'ws', 
                host: workerDomain, 
                path: wsPath 
            });
            links.push(`${proto}://${uuid}@${safeIP}:${port}?${wsParams.toString()}#${encodeURIComponent(wsNodeName)}`);
        });

        // 生成HTTP端口节点
        httpPorts.forEach(port => {
            // 应用端口筛选
            if (filters && filters.ports && filters.ports.length > 0 && !filters.ports.includes(port.toString())) {
                return;
            }
            
            const wsNodeName = `${nodeNameBase}-${port}-WS`;
            const wsParams = new URLSearchParams({
                encryption: 'none',
                security: 'none',
                type: 'ws',
                host: workerDomain,
                path: wsPath
            });
            links.push(`${proto}://${uuid}@${safeIP}:${port}?${wsParams.toString()}#${encodeURIComponent(wsNodeName)}`);
        });
    });
    return links;
}

async function fetchDynamicIPs() {
    const v4Url1 = "https://www.wetest.vip/page/cloudflare/address_v4.html";
    const v6Url1 = "https://www.wetest.vip/page/cloudflare/address_v6.html";
    let results = [];

    try {
        const [ipv4List, ipv6List] = await Promise.all([
            fetchAndParseWetest(v4Url1),
            fetchAndParseWetest(v6Url1)
        ]);
        results = [...ipv4List, ...ipv6List];
        if (results.length > 0) {
            console.log(`Successfully fetched ${results.length} IPs from wetest.vip`);
            return results;
        }
    } catch (e) {
        console.error("Failed to fetch from wetest.vip:", e);
    }

    console.log("wetest.vip failed, trying fallback IP source...");
    const fallbackUrl = "https://stock.hostmonit.com/CloudFlareYes";
    try {
        const response = await fetch(fallbackUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok) {
            console.error(`Fallback source failed with status: ${response.status}`);
            return [];
        }
        const html = await response.text();
        const rowRegex = /<tr><td>([\d.:a-fA-F]+)<\/td><td>.*?<\/td><td>.*?<\/td><td>.*?<\/td><td>(.*?)<\/td>.*?<\/tr>/g;
        
        let match;
        while ((match = rowRegex.exec(html)) !== null) {
            if (match[1] && match[2]) {
                results.push({
                    ip: match[1].trim(),
                    isp: match[2].trim().replace(/\s/g, '')
                });
            }
        }

        if (results.length > 0) {
             console.log(`Successfully fetched ${results.length} IPs from fallback source.`);
        } else {
            console.warn(`Warning: Could not parse any IPs from fallback source. The site structure might have changed.`);
        }
       
        return results;
    } catch (e) {
        console.error("Failed to fetch from fallback source:", e);
        return [];
    }
}

async function fetchAndParseWetest(url) {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok) {
            console.error(`Failed to fetch ${url}, status: ${response.status}`);
            return [];
        }
        const html = await response.text();
        const results = [];
        const rowRegex = /<tr[\s\S]*?<\/tr>/g;
        const cellRegex = /<td data-label="线路名称">(.+?)<\/td>[\s\S]*?<td data-label="优选地址">([\d.:a-fA-F]+)<\/td>/;

        let match;
        while ((match = rowRegex.exec(html)) !== null) {
            const rowHtml = match[0];
            const cellMatch = rowHtml.match(cellRegex);
            if (cellMatch && cellMatch[1] && cellMatch[2]) {
                results.push({
                    isp: cellMatch[1].trim().replace(/<.*?>/g, ''),
                    ip: cellMatch[2].trim()
                });
            }
        }
        
        if (results.length === 0) {
            console.warn(`Warning: Could not parse any IPs from ${url}. The site structure might have changed.`);
        }

        return results;
    } catch (error) {
        console.error(`Error parsing ${url}:`, error);
        return [];
    }
}

async function handleWsRequest(request) {
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

            await forwardTCP(addressType, hostname, port, rawData, serverSock, respHeader, remoteConnWrapper);
        },
    })).catch((err) => { console.log('WS Stream Error:', err); });

    return new Response(null, { status: 101, webSocket: clientSock });
}

async function forwardTCP(addrType, host, portNum, rawData, ws, respHeader, remoteConnWrapper) {
    async function connectAndSend(address, port) {
        const remoteSock = isSocksEnabled ?
            await establishSocksConnection(addrType, address, port) :
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
        newSocket.closed.catch(() => {}).finally(() => closeSocketQuietly(ws));
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
	if (cmd === 1) {} else if (cmd === 2) { isUDP = true; } else { return { hasError: true, message: E_UNSUPPORTED_CMD }; }
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

async function establishSocksConnection(addrType, address, port) {
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

function closeSocketQuietly(socket) { try { if (socket.readyState === 1 || socket.readyState === 2) socket.close(); } catch (error) {} }

const hexTable = Array.from({ length: 256 }, (v, i) => (i + 256).toString(16).slice(1));

function formatIdentifier(arr, offset = 0) {
    const id = (hexTable[arr[offset]]+hexTable[arr[offset+1]]+hexTable[arr[offset+2]]+hexTable[arr[offset+3]]+"-"+hexTable[arr[offset+4]]+hexTable[arr[offset+5]]+"-"+hexTable[arr[offset+6]]+hexTable[arr[offset+7]]+"-"+hexTable[arr[offset+8]]+hexTable[arr[offset+9]]+"-"+hexTable[arr[offset+10]]+hexTable[arr[offset+11]]+hexTable[arr[offset+12]]+hexTable[arr[offset+13]]+hexTable[arr[offset+14]]+hexTable[arr[offset+15]]).toLowerCase();
    if (!isValidFormat(id)) throw new TypeError(E_INVALID_ID_STR);
    return id;
}

function getFilterHTML() {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sinppets 严选</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#f5f5f5;padding:20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);overflow:hidden}.header{background:#2196F3;color:#fff;padding:15px;text-align:center}.section{padding:15px;border-bottom:1px solid #eee}.section:last-child{border-bottom:none}.section-title{font-size:14px;font-weight:600;margin-bottom:10px;color:#333}.btn-group{display:flex;gap:8px;margin-bottom:10px}.btn-small{padding:4px 8px;border:1px solid #ddd;border-radius:4px;background:#fff;font-size:12px;cursor:pointer;transition:all 0.2s}.btn-small:hover{background:#f0f0f0}.btn-small.active{background:#2196F3;color:#fff;border-color:#2196F3}.domain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.domain-item{display:flex;align-items:center;padding:8px;border:1px solid #ddd;border-radius:4px;background:#fff;font-size:12px;cursor:pointer;transition:all 0.2s}.domain-item:hover{background:#f0f0f0}.domain-item.selected{background:#E3F2FD;border-color:#2196F3}.domain-item input{margin-right:6px}.isp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.isp-item{display:flex;align-items:center;padding:8px;border:1px solid #ddd;border-radius:4px;background:#fff;font-size:12px;cursor:pointer;transition:all 0.2s}.isp-item:hover{background:#f0f0f0}.isp-item.selected{background:#E3F2FD;border-color:#2196F3}.isp-item input{margin-right:6px}.port-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.port-item{padding:6px;border:1px solid #ddd;border-radius:4px;background:#fff;font-size:11px;text-align:center;cursor:pointer;transition:all 0.2s}.port-item:hover{background:#f0f0f0}.port-item.selected{background:#2196F3;color:#fff;border-color:#2196F3}.generate-btn{width:100%;padding:12px;background:#2196F3;color:#fff;border:none;border-radius:4px;font-size:14px;font-weight:600;cursor:pointer;margin-top:15px}.generate-btn:hover{background:#1976D2}.result{margin-top:15px;padding:10px;background:#f9f9f9;border-radius:4px;border-left:3px solid #2196F3}.result input{width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-family:monospace;font-size:11px;margin-bottom:8px}.copy-btn{padding:6px 12px;background:#4CAF50;color:#fff;border:none;border-radius:4px;font-size:12px;cursor:pointer}@media (max-width:480px){.domain-grid{grid-template-columns:1fr}.isp-grid{grid-template-columns:1fr}.port-grid{grid-template-columns:repeat(3,1fr)}}</style></head><body><div class="container"><div class="header"><h2>Sinppets 严选器</h2><p>UUID: ${authToken}</p></div><form id="filterForm"><div class="section"><div class="section-title">域名选择</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('domain')">全选</button><button type="button" class="btn-small" onclick="clearAll('domain')">清空</button><button type="button" class="btn-small" onclick="toggleDynamic()">⚡ 动态优选IP</button></div><div class="domain-grid" id="domainGrid"></div></div><div class="section"><div class="section-title">网络筛选 (动态IP)</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('isp')">全选</button><button type="button" class="btn-small" onclick="clearAll('isp')">清空</button></div><div class="isp-grid"><div class="isp-item" onclick="toggleISP(this)"><input type="checkbox" name="isp" value="移动" onchange="updateItemStyle(this)">🟢 中国移动</div><div class="isp-item" onclick="toggleISP(this)"><input type="checkbox" name="isp" value="电信" onchange="updateItemStyle(this)">🔵 中国电信</div><div class="isp-item" onclick="toggleISP(this)"><input type="checkbox" name="isp" value="联通" onchange="updateItemStyle(this)">🟡 中国联通</div><div class="isp-item" onclick="toggleISP(this)"><input type="checkbox" name="isp" value="海外" onchange="updateItemStyle(this)">🌍 海外线路</div></div></div><div class="section"><div class="section-title">HTTPS 端口</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('https')">全选</button><button type="button" class="btn-small" onclick="clearAll('https')">清空</button></div><div class="port-grid"><div class="port-item" onclick="togglePort(this,'443')">443</div><div class="port-item" onclick="togglePort(this,'2053')">2053</div><div class="port-item" onclick="togglePort(this,'2083')">2083</div><div class="port-item" onclick="togglePort(this,'2087')">2087</div><div class="port-item" onclick="togglePort(this,'2096')">2096</div><div class="port-item" onclick="togglePort(this,'8443')">8443</div></div></div><div class="section"><div class="section-title">HTTP 端口</div><div class="btn-group"><button type="button" class="btn-small" onclick="selectAll('http')">全选</button><button type="button" class="btn-small" onclick="clearAll('http')">清空</button></div><div class="port-grid"><div class="port-item" onclick="togglePort(this,'80')">80</div><div class="port-item" onclick="togglePort(this,'8080')">8080</div><div class="port-item" onclick="togglePort(this,'8880')">8880</div><div class="port-item" onclick="togglePort(this,'2052')">2052</div><div class="port-item" onclick="togglePort(this,'2082')">2082</div><div class="port-item" onclick="togglePort(this,'2086')">2086</div><div class="port-item" onclick="togglePort(this,'2095')">2095</div></div></div><button type="submit" class="generate-btn">生成筛选订阅</button></form><div id="result" class="result" style="display:none"><input type="text" id="subscriptionUrl" readonly><button class="copy-btn" onclick="copyUrl()">复制链接</button></div></div><script>const domains=[${directDomains.map(d => `{name:"${d.name || d.domain}",domain:"${d.domain}"}`).join(',')}];let includeDynamic=true;function initDomains(){const grid=document.getElementById('domainGrid');domains.forEach((d,i)=>{const div=document.createElement('div');div.className='domain-item';div.innerHTML=\`<input type="checkbox" name="domain" value="\${d.domain}" onchange="updateItemStyle(this)">\${d.name}\`;div.onclick=(e)=>{if(e.target.type!=='checkbox'){const cb=div.querySelector('input');cb.checked=!cb.checked;updateItemStyle(cb)}};grid.appendChild(div)})}function updateItemStyle(checkbox){const item=checkbox.closest('.domain-item,.isp-item');item.classList.toggle('selected',checkbox.checked)}function toggleItem(el,type,value){const cb=el.querySelector('input');cb.checked=!cb.checked;el.classList.toggle('selected',cb.checked);event.stopPropagation()}function togglePort(el,port){el.classList.toggle('selected');el.dataset.selected=el.classList.contains('selected');event.stopPropagation()}function toggleISP(el){const cb=el.querySelector('input');if(event.target.type!=='checkbox'){cb.checked=!cb.checked;updateItemStyle(cb)}}function selectAll(type){document.querySelectorAll(\`[name="\${type}"]\`).forEach(cb=>{cb.checked=true;updateItemStyle(cb)});if(type==='https'||type==='http')document.querySelectorAll('.port-item').forEach(el=>{el.classList.add('selected');el.dataset.selected='true'})}function clearAll(type){document.querySelectorAll(\`[name="\${type}"]\`).forEach(cb=>{cb.checked=false;updateItemStyle(cb)});if(type==='https'||type==='http')document.querySelectorAll('.port-item').forEach(el=>{el.classList.remove('selected');el.dataset.selected='false'})}function toggleDynamic(){includeDynamic=!includeDynamic;event.target.classList.toggle('active',includeDynamic)}document.getElementById('filterForm').onsubmit=function(e){e.preventDefault();const params=new URLSearchParams();const selectedDomains=Array.from(document.querySelectorAll('input[name="domain"]:checked')).map(cb=>cb.value);if(selectedDomains.length>0)params.append('domains',selectedDomains.join(','));const selectedISPs=Array.from(document.querySelectorAll('input[name="isp"]:checked')).map(cb=>cb.value);if(selectedISPs.length>0)params.append('isps',selectedISPs.join(','));const selectedPorts=Array.from(document.querySelectorAll('.port-item.selected')).map(el=>el.textContent);if(selectedPorts.length===0){alert('请至少选择一个端口！');return}if(selectedPorts.length>0)params.append('ports',selectedPorts.join(','));if(!includeDynamic)params.append('nodynamic','1');const url=window.location.origin+'/${authToken}'+(params.toString()?'?'+params.toString():'');document.getElementById('subscriptionUrl').value=url;document.getElementById('result').style.display='block'};function copyUrl(){const input=document.getElementById('subscriptionUrl');input.select();document.execCommand('copy');event.target.textContent='已复制!';setTimeout(()=>event.target.textContent='复制链接',2000)}window.onload=()=>{initDomains();document.querySelector('[onclick="toggleDynamic()"]').classList.add('active')}</script></body></html>`;
}
