import { connect } from 'cloudflare:sockets';
const T = '05afc6ab-d912-4c55-982d-ad03cde92be7', FA = 'ProxyIP.cmliussss.net', FP = '443', PW = '登录密码',
    SC = [{ region: '地区名1', config: 'user:password@ip:port' }, { region: '地区名2', config: 'user:password@ip:port' }],
    PI = [{ region: '香港', ip: '103.219.194.43' }, { region: '新加坡', ip: '139.180.159.133' }, { region: '日本', ip: '141.147.147.180' }, { region: '韩国', ip: '123.111.169.70' }, { region: '美国', ip: '104.131.168.146' }, { region: '加拿大', ip: '149.248.56.22' }, { region: '英国', ip: '192.236.193.108' }, { region: '德国', ip: '158.101.183.27' }, { region: '荷兰', ip: '103.137.249.117' }, { region: '芬兰', ip: '109.206.236.23' }, { region: '瑞典', ip: '62.182.192.226' }],
    DD = [{ domain: "cf.090227.xyz" }, { domain: "freeyx.cloudflare88.eu.org" }, { domain: "cf.877774.xyz" }];
const E1 = atob('aW52YWxpZCBkYXRh'), E2 = atob('aW52YWxpZCB1c2Vy'), E3 = atob('Y29tbWFuZCBpcyBub3Qgc3VwcG9ydGVk'), E4 = atob('VURQIHByb3h5IG9ubHkgZW5hYmxlIGZvciBETlMgd2hpY2ggaXMgcG9ydCA1Mw=='), E5 = atob('aW52YWxpZCBhZGRyZXNzVHlwZQ=='), E6 = atob('YWRkcmVzc1ZhbHVlIGlzIGVtcHR5'), E7 = atob('d2ViU29ja2V0LmVhZHlTdGF0ZSBpcyBub3Qgb3Blbg=='), E8 = atob('U3RyaW5naWZpZWQgaWRlbnRpZmllciBpcyBpbnZhbGlk'), E9 = atob('SW52YWxpZCBTT0NLUyBhZGRyZXNzIGZvcm1hdA=='), EA = atob('bm8gYWNjZXB0YWJsZSBtZXRob2Rz'), EB = atob('c29ja3Mgc2VydmVyIG5lZWRzIGF1dGg='), EC = atob('ZmFpbCB0byBhdXRoIHNvY2tzIHNlcnZlcg=='), ED = atob('ZmFpbCB0byBvcGVuIHNvY2tzIGNvbm5lY3Rpb24='), A1 = 1, A2 = 2, A3 = 3;

export default {
    async fetch(r, e, c) {
        try {
            const u = new URL(r.url);
            if (r.headers.get('Upgrade') === 'websocket') return await hWR(r);
            if (r.method === 'GET') {
                if (u.pathname === '/') return new Response(gHTML(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                if (u.pathname === '/api/check-socks') return await hSC();
                if (u.pathname === '/api/check-proxyip') return await hPC(r);
                if (u.pathname.toLowerCase().includes(`/${T}`)) return await hSR(r, T)
            }
            return new Response('Not Found', { status: 404 })
        } catch (err) { return new Response(err.toString(), { status: 500 }) }
    }
};

async function hSR(r, u) {
    const url = new URL(r.url), L = [], w = url.hostname,
        f = { domains: url.searchParams.get('domains')?.split(',') || [], ports: url.searchParams.get('ports')?.split(',') || [] },
        dl = f.domains.length > 0 ? DD.filter(d => f.domains.some(s => d.domain.toLowerCase().includes(s.toLowerCase()))) : DD;
    L.push(...gLFD(dl, u, w, f));
    if (L.length === 0) return new Response('No nodes', { status: 404 });
    const st = L.join('\n'), e = new TextEncoder(), b = e.encode(st), c = btoa(String.fromCharCode(...b));
    return new Response(c, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}

function gLFD(dl, u, w, f = {}) {
    const ap = [443, 80], ps = f.ports && f.ports.length > 0 ? ap.filter(p => f.ports.includes(p.toString())) : ap, L = [], pr = 'vless';
    dl.forEach(it => {
        if (SC.length > 0) SC.forEach((s, si) => {
            const { region: rg } = s; ps.forEach(p => {
                const n = `Sinppets-Socks-${rg}-${it.domain}-${p}`, ws = encodeURIComponent(`/?ed=2048&socks=${si}`),
                    pm = new URLSearchParams({ encryption: 'none', security: p === 443 ? 'tls' : 'none', type: 'ws', host: w, path: ws });
                if (p === 443) { pm.append('sni', w); pm.append('fp', 'randomized') }
                L.push(`${pr}://${u}@${it.domain}:${p}?${pm}#${encodeURIComponent(n)}`)
            })
        });
        if (PI.length > 0) PI.forEach((px, pxi) => {
            const { region: rg, ip } = px;
            ps.forEach(p => {
                // Address: ProxyIP (Entry Node - Client Side)
                // This makes the ENTRY path different for each node.
                const n = `Sinppets-ProxyIP-${rg}-${it.domain}-${p}`, ws = encodeURIComponent(`/?ed=2048&proxyip=${pxi}`),
                    pm = new URLSearchParams({ encryption: 'none', security: p === 443 ? 'tls' : 'none', type: 'ws', host: w, path: ws });
                if (p === 443) { pm.append('sni', w); pm.append('fp', 'randomized') }
                L.push(`${pr}://${u}@${ip}:${p}?${pm}#${encodeURIComponent(n)}`)
            })
        })
    });
    return L
}

async function hWR(r) {
    const u = new URL(r.url), si = u.searchParams.get('socks');
    let six = -1; if (si !== null) six = parseInt(si);
    let psc = {}, ise = !1;
    if (SC.length > 0 && six >= 0 && six < SC.length) { try { psc = pSC(SC[six].config); ise = !0 } catch (e) { console.error('SOCKS parse fail:', e.message) } }

    // Server-Side Bypass: Ignore proxyip param, connect directly.

    const wp = new WebSocketPair(), [cs, ss] = Object.values(wp); ss.accept();
    let rcw = { socket: null }, idq = !1;
    const ed = r.headers.get('sec-websocket-protocol') || '', rd = mRS(ss, ed);
    rd.pipeTo(new WritableStream({
        async write(c) {
            if (idq) return await fUDP(c, ss, null);
            if (rcw.socket) { const w = rcw.socket.writable.getWriter(); await w.write(c); w.releaseLock(); return }
            const { hasError: he, message: m, addressType: at, port: pt, hostname: hn, rawIndex: ri, version: v, isUDP: iu } = pWPH(c, T);
            if (he) throw new Error(m);
            if (iu) { if (pt === 53) idq = !0; else throw new Error(E4) }
            const rh = new Uint8Array([v[0], 0]), raw = c.slice(ri);
            if (idq) return fUDP(raw, ss, rh);
            await fTCP(at, hn, pt, raw, ss, rh, rcw, ise, psc)
        }
    })).catch(e => console.log('WS err:', e));
    return new Response(null, { status: 101, webSocket: cs })
}

async function fTCP(at, h, pn, rd, ws, rh, rcw, ise, psc) {
    async function cAS(a, p) {
        let rs;
        if (ise) rs = await eSC(at, a, p, psc);
        else rs = connect({ hostname: a, port: p });
        const w = rs.writable.getWriter(); await w.write(rd); w.releaseLock(); return rs
    }
    async function rC() {
        const ns = ise ? await cAS(h, pn) : await cAS(FA || h, parseInt(FP, 10) || pn);
        rcw.socket = ns; ns.closed.catch(() => { }).finally(() => cSQ(ws)); cS(ns, ws, rh, null)
    }
    try { const is = await cAS(h, pn); rcw.socket = is; cS(is, ws, rh, rC) } catch (e) { console.log('Init conn fail:', e); rC() }
}

function pWPH(c, t) { if (c.byteLength < 24) return { hasError: !0, message: E1 }; const v = new Uint8Array(c.slice(0, 1)); if (fID(new Uint8Array(c.slice(1, 17))) !== t) return { hasError: !0, message: E2 }; const ol = new Uint8Array(c.slice(17, 18))[0], cmd = new Uint8Array(c.slice(18 + ol, 19 + ol))[0]; let iu = !1; if (cmd === 1) { } else if (cmd === 2) iu = !0; else return { hasError: !0, message: E3 }; const pi = 19 + ol, pt = new DataView(c.slice(pi, pi + 2)).getUint16(0); let ai = pi + 2, al = 0, avi = ai + 1, hn = ''; const at = new Uint8Array(c.slice(ai, avi))[0]; switch (at) { case A1: al = 4; hn = new Uint8Array(c.slice(avi, avi + al)).join('.'); break; case A2: al = new Uint8Array(c.slice(avi, avi + 1))[0]; avi += 1; hn = new TextDecoder().decode(c.slice(avi, avi + al)); break; case A3: al = 16; const ip6 = [], iv = new DataView(c.slice(avi, avi + al)); for (let i = 0; i < 8; i++)ip6.push(iv.getUint16(i * 2).toString(16)); hn = ip6.join(':'); break; default: return { hasError: !0, message: `${E5}: ${at}` } }if (!hn) return { hasError: !0, message: `${E6}: ${at}` }; return { hasError: !1, addressType: at, port: pt, hostname: hn, isUDP: iu, rawIndex: avi + al, version: v } }
function mRS(s, eh) { let ca = !1; return new ReadableStream({ start(c) { s.addEventListener('message', e => { if (!ca) c.enqueue(e.data) }); s.addEventListener('close', () => { if (!ca) { cSQ(s); c.close() } }); s.addEventListener('error', e => c.error(e)); const { earlyData: ed, error: er } = b64A(eh); if (er) c.error(er); else if (ed) c.enqueue(ed) }, cancel() { ca = !0; cSQ(s) } }) }
async function cS(rs, ws, hd, rf) { let h = hd, hd2 = !1; await rs.readable.pipeTo(new WritableStream({ async write(c, ct) { hd2 = !0; if (ws.readyState !== 1) ct.error(E7); if (h) { ws.send(await new Blob([h, c]).arrayBuffer()); h = null } else ws.send(c) }, abort(r) { console.error("Readable aborted:", r) } })).catch(e => { console.error("Stream conn err:", e); cSQ(ws) }); if (!hd2 && rf) rf() }
async function fUDP(uc, ws, rh) { try { const ts = connect({ hostname: '8.8.4.4', port: 53 }); let vh = rh; const w = ts.writable.getWriter(); await w.write(uc); w.releaseLock(); await ts.readable.pipeTo(new WritableStream({ async write(c) { if (ws.readyState === 1) { if (vh) { ws.send(await new Blob([vh, c]).arrayBuffer()); vh = null } else ws.send(c) } } })) } catch (e) { console.error(`DNS fwd err:${e.message}`) } }
async function eSC(at, a, p, psc) { const { username: u, password: pw, hostname: h, socksPort: sp } = psc, s = connect({ hostname: h, port: sp }), w = s.writable.getWriter(); await w.write(new Uint8Array(u ? [5, 2, 0, 2] : [5, 1, 0])); const rdr = s.readable.getReader(); let rs = (await rdr.read()).value; if (rs[0] !== 5 || rs[1] === 255) throw new Error(EA); if (rs[1] === 2) { if (!u || !pw) throw new Error(EB); const enc = new TextEncoder(), ar = new Uint8Array([1, u.length, ...enc.encode(u), pw.length, ...enc.encode(pw)]); await w.write(ar); rs = (await rdr.read()).value; if (rs[0] !== 1 || rs[1] !== 0) throw new Error(EC) } const enc = new TextEncoder(); let DA; switch (at) { case A1: DA = new Uint8Array([1, ...a.split('.').map(Number)]); break; case A2: DA = new Uint8Array([3, a.length, ...enc.encode(a)]); break; case A3: DA = new Uint8Array([4, ...a.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]); break; default: throw new Error(E5) }await w.write(new Uint8Array([5, 1, 0, ...DA, p >> 8, p & 255])); rs = (await rdr.read()).value; if (rs[1] !== 0) throw new Error(ED); w.releaseLock(); rdr.releaseLock(); return s }
function pSC(a) { let [l, f] = a.split("@").reverse(), u, pw, h, sp; if (f) { const fs = f.split(":"); if (fs.length !== 2) throw new Error(E9);[u, pw] = fs } const ls = l.split(":"); sp = Number(ls.pop()); if (isNaN(sp)) throw new Error(E9); h = ls.join(":"); if (h.includes(":") && !/^\[.*\]$/.test(h)) throw new Error(E9); return { username: u, password: pw, hostname: h, socksPort: sp } }
function b64A(b) { if (!b) return { error: null }; try { b = b.replace(/-/g, '+').replace(/_/g, '/'); return { earlyData: Uint8Array.from(atob(b), c => c.charCodeAt(0)).buffer, error: null } } catch (e) { return { error: e } } }
function iVF(u) { return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(u) }
function cSQ(s) { try { if (s.readyState === 1 || s.readyState === 2) s.close() } catch (e) { } }
const hT = Array.from({ length: 256 }, (v, i) => (i + 256).toString(16).slice(1));
function fID(a, o = 0) { const id = (hT[a[o]] + hT[a[o + 1]] + hT[a[o + 2]] + hT[a[o + 3]] + "-" + hT[a[o + 4]] + hT[a[o + 5]] + "-" + hT[a[o + 6]] + hT[a[o + 7]] + "-" + hT[a[o + 8]] + hT[a[o + 9]] + "-" + hT[a[o + 10]] + hT[a[o + 11]] + hT[a[o + 12]] + hT[a[o + 13]] + hT[a[o + 14]] + hT[a[o + 15]]).toLowerCase(); if (!iVF(id)) throw new TypeError(E8); return id }
async function hSC() { const rs = []; for (const s of SC) { const st = Date.now(); try { const p = pSC(s.config), sk = await eSC(A1, '1.1.1.1', 80, p), lt = Date.now() - st; try { sk.close() } catch (e) { } rs.push({ region: s.region, status: 'online', latency: lt }) } catch (e) { rs.push({ region: s.region, status: 'offline', latency: -1, error: e.message }) } } return new Response(JSON.stringify({ results: rs }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }) }

async function hPC(r) {
    const u = new URL(r.url), idx = u.searchParams.get('index');
    const cOne = async (p) => {
        const st = Date.now();
        try {
            const sk = connect({ hostname: p.ip, port: 443 }), w = sk.writable.getWriter(); await w.close();
            const lt = Date.now() - st; try { sk.close() } catch (e) { }
            return { region: p.region, status: 'online', latency: lt }
        } catch (e) {
            return { region: p.region, status: 'offline', latency: -1, error: e.message }
        }
    };
    if (idx !== null) {
        const i = parseInt(idx);
        if (i >= 0 && i < PI.length) {
            const res = await cOne(PI[i]);
            return new Response(JSON.stringify(res), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
        }
    }
    const rs = [];
    for (const p of PI) { rs.push(await cOne(p)) }
    return new Response(JSON.stringify({ results: rs }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
}

function gHTML() { const n = !!(PW && PW.trim()), p = PW || ''; return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sinppets</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px;display:flex;align-items:center;justify-content:center}.c{max-width:600px;width:100%;background:#fff;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.2)}.h{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:30px;text-align:center}.h h2{font-size:24px;margin-bottom:8px}.h p{font-size:14px;opacity:.9}.s{padding:20px;border-bottom:1px solid #eee}.s:last-child{border-bottom:none}.st{font-size:16px;font-weight:600;margin-bottom:15px;color:#333;display:flex;align-items:center}.st::before{content:'';display:inline-block;width:4px;height:16px;background:#667eea;margin-right:8px;border-radius:2px}.bg{display:flex;gap:8px;margin-bottom:12px}.bs{padding:6px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:13px;cursor:pointer;transition:all .3s}.bs:hover{background:#f0f0f0;transform:translateY(-1px)}.dg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.di{display:flex;align-items:center;padding:12px;border:2px solid #e0e0e0;border-radius:8px;background:#fafafa;font-size:13px;cursor:pointer;transition:all .3s}.di:hover{background:#f0f0f0;border-color:#667eea}.di.sel{background:#f0f4ff;border-color:#667eea;box-shadow:0 2px 8px rgba(102,126,234,.2)}.di input{margin-right:8px}.pg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.pi{display:flex;align-items:center;justify-content:center;padding:12px;border:2px solid #e0e0e0;border-radius:8px;background:#fafafa;font-size:14px;font-weight:500;cursor:pointer;transition:all .3s}.pi:hover{background:#f0f0f0;border-color:#667eea}.pi.sel{background:#f0f4ff;border-color:#667eea;box-shadow:0 2px 8px rgba(102,126,234,.2)}.gb{width:100%;padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all .3s;box-shadow:0 4px 15px rgba(102,126,234,.4)}.gb:hover{transform:translateY(-2px)}.r{margin-top:15px;padding:15px;background:#f9f9f9;border-radius:8px;border-left:4px solid #667eea;display:none}.r input{width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:monospace;font-size:12px;margin-bottom:10px;background:#fff}.cb{padding:8px 16px;background:#4CAF50;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;transition:all .3s}.cb:hover{background:#45a049}.sc{display:flex;flex-direction:column;gap:8px}.sk{background:#f8f9fa;border:2px solid #e0e0e0;border-radius:6px;padding:10px 14px;transition:all .3s;display:flex;align-items:center;justify-content:space-between;gap:12px}.sk.on{border-color:#4CAF50;background:#f1f8f4}.sk.off{border-color:#f44336;background:#fef1f0}.sr{font-weight:600;font-size:13px;color:#333;min-width:60px}.sl{font-size:12px;color:#666;flex:1;text-align:center}.si{font-size:11px;padding:3px 10px;border-radius:12px;font-weight:500;white-space:nowrap}.si.on{background:#4CAF50;color:#fff}.si.off{background:#f44336;color:#fff}.si.chk{background:#9e9e9e;color:#fff}.lc{padding:40px}.lf{display:flex;flex-direction:column;gap:20px}.ig{display:flex;flex-direction:column;gap:8px}.ig label{font-size:14px;font-weight:500;color:#333}.ig input{padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px;transition:all .3s}.ig input:focus{outline:none;border-color:#667eea}.lb{padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all .3s}.lb:hover{transform:translateY(-2px)}.em{color:#f44336;font-size:13px;padding:10px;background:#ffebee;border-radius:6px;display:none}.lo{position:absolute;top:20px;right:20px;padding:8px 16px;background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:6px;font-size:12px;cursor:pointer}@media(max-width:480px){.dg,.pg{grid-template-columns:1fr}.lo{position:static;margin-top:10px;width:100%}}</style></head><body><div class="c" id="lc" style="display:${n ? 'block' : 'none'}"><div class="h"><h2>🔐 登录</h2><p>请输入密码</p></div><div class="lc"><form class="lf" id="lf"><div class="ig"><label for="pw">访问密码</label><input type="password" id="pw" required autofocus></div><div class="em" id="em">密码错误</div><button type="submit" class="lb">🔓 登录</button></form></div></div><div class="c" id="mc" style="display:${n ? 'none' : 'block'}"><div class="h" style="position:relative"><h2>🚀 Sinppets</h2><p>选择域名和端口</p>${n ? '<button class="lo" onclick="logout()">🚪 退出</button>' : ''}</div><form id="ff"><div class="s"><div class="st">域名</div><div class="bg"><button type="button" class="bs" onclick="selA('d')">全选</button><button type="button" class="bs" onclick="clrA('d')">清空</button></div><div class="dg" id="dg"></div></div><div class="s"><div class="st">端口</div><div class="bg"><button type="button" class="bs" onclick="selA('p')">全选</button><button type="button" class="bs" onclick="clrA('p')">清空</button></div><div class="pg"><div class="pi" data-port="443" onclick="togP(this)">🔒 443</div><div class="pi" data-port="80" onclick="togP(this)">🌐 80</div></div></div><div class="s"><div class="st">📡 SOCKS<button type="button" class="bs" style="margin-left:auto" onclick="chkS()">刷新</button></div><div id="ssc" class="sc">${SC.map((s, i) => `<div class="sk" data-index="${i}"><span class="sr">${s.region}</span><span class="sl" id="l${i}">---</span><span class="si chk" id="s${i}">⚪</span></div>`).join('')}</div></div><div class="s"><div class="st">🌍 ProxyIP<button type="button" class="bs" style="margin-left:auto" onclick="chkP()">刷新</button></div><div id="psc" class="sc">${PI.map((s, i) => `<div class="sk pc" data-index="${i}"><span class="sr">${s.region}</span><span class="sl" id="pl${i}">---</span><span class="si chk" id="ps${i}">⚪</span></div>`).join('')}</div></div><button type="submit" class="gb">✨ 生成链接</button></form><div id="res" class="r"><input type="text" id="url" readonly><button class="cb" onclick="copy()">📋 复制</button></div></div><script>const PW='${p}',NP=${n},DS=[${DD.map(d => `{name:"${d.name || d.domain}",domain:"${d.domain}"}`).join(',')}];function chkL(){return!NP||sessionStorage.getItem('sp_l')==='1'}function shM(){document.getElementById('lc').style.display='none';document.getElementById('mc').style.display='block'}function shL(){document.getElementById('lc').style.display='block';document.getElementById('mc').style.display='none'}function logout(){sessionStorage.removeItem('sp_l');shL();const p=document.getElementById('pw');if(p)p.value=''}document.getElementById('lf')?.addEventListener('submit',e=>{e.preventDefault();if(document.getElementById('pw').value===PW){sessionStorage.setItem('sp_l','1');shM();initD();selA('p');document.getElementById('em').style.display='none'}else{document.getElementById('em').style.display='block';document.getElementById('pw').value='';document.getElementById('pw').focus()}});function initD(){const g=document.getElementById('dg');g.innerHTML='';DS.forEach(d=>{const v=document.createElement('div');v.className='di';v.innerHTML=\`<input type="checkbox" name="d" value="\${d.domain}" onchange="updI(this)">\${d.name}\`;v.onclick=e=>{if(e.target.type!=='checkbox'){const c=v.querySelector('input');c.checked=!c.checked;updI(c)}};g.appendChild(v)})}function updI(c){c.closest('.di').classList.toggle('sel',c.checked)}function togP(e){e.classList.toggle('sel')}function selA(t){if(t==='d')document.querySelectorAll('[name="d"]').forEach(c=>{c.checked=!0;updI(c)});else document.querySelectorAll('.pi').forEach(e=>e.classList.add('sel'))}function clrA(t){if(t==='d')document.querySelectorAll('[name="d"]').forEach(c=>{c.checked=!1;updI(c)});else document.querySelectorAll('.pi').forEach(e=>e.classList.remove('sel'))}document.getElementById('ff').onsubmit=e=>{e.preventDefault();const ds=Array.from(document.querySelectorAll('input[name="d"]:checked')).map(c=>c.value),ps=Array.from(document.querySelectorAll('.pi.sel')).map(e=>e.dataset.port),pr=new URLSearchParams();if(ds.length>0)pr.append('domains',ds.join(','));if(ps.length>0)pr.append('ports',ps.join(','));document.getElementById('url').value=location.origin+'/${T}'+(pr.toString()?'?'+pr:'');document.getElementById('res').style.display='block'};function copy(){const i=document.getElementById('url');i.select();document.execCommand('copy');const b=event.target,t=b.textContent;b.textContent='✅ 已复制';b.style.background='#66bb6a';setTimeout(()=>{b.textContent=t;b.style.background='#4CAF50'},2e3)}async function chkS(){const cs=document.querySelectorAll('.sk:not(.pc)');cs.forEach(c=>{c.classList.remove('on','off');const i=c.dataset.index;document.getElementById('s'+i).className='si chk';document.getElementById('s'+i).textContent='⚪';document.getElementById('l'+i).textContent='---'});try{const r=await fetch('/api/check-socks'),d=await r.json();d.results.forEach((res,i)=>{const se=document.getElementById('s'+i),le=document.getElementById('l'+i),c=cs[i];if(res.status==='online'){se.className='si on';se.textContent='🟢';le.textContent=res.latency+'ms';c.classList.add('on')}else{se.className='si off';se.textContent='🔴';le.textContent='离线';c.classList.add('off')}})}catch(e){cs.forEach(c=>{const i=c.dataset.index;document.getElementById('s'+i).className='si off';document.getElementById('s'+i).textContent='🔴'})}}async function chkP(){const cs=document.querySelectorAll('.pc');cs.forEach(c=>{c.classList.remove('on','off');const i=c.dataset.index;document.getElementById('ps'+i).className='si chk';document.getElementById('ps'+i).textContent='⚪';document.getElementById('pl'+i).textContent='---'});for(let i=0;i<cs.length;i++){const c=cs[i],idx=c.dataset.index,se=document.getElementById('ps'+idx),le=document.getElementById('pl'+idx);se.textContent='⏳';try{const r=await fetch('/api/check-proxyip?index='+idx),res=await r.json();if(res.status==='online'){se.className='si on';se.textContent='🟢';le.textContent=res.latency+'ms';c.classList.add('on')}else{se.className='si off';se.textContent='🔴';le.textContent='离线';c.classList.add('off')}}catch(e){se.className='si off';se.textContent='🔴';le.textContent='错误';c.classList.add('off')}}}window.onload=()=>{if(chkL()){shM();initD();selA('p');setTimeout(chkS,500);setTimeout(chkP,1e3)}else NP?shL():(initD(),selA('p'),setTimeout(chkS,500),setTimeout(chkP,1e3))}</script></body></html>` }
