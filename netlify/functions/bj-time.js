// Netlify Function: 北京时间校时
// 依次尝试多个时间源，任一成功即返回。返回结构保持与原站一致，
// 因为 js/time.js 里读的是 data.originalData.code / data.originalData.time。
//
// 原站上游 api.xiaole.work 早已失效（连接超时），这里换用可用源。

const https = require('https');

// 时间源按优先级排列：国内源在前（对国内访客更快），国际源兜底
const SOURCES = [
    {
        name: 'suning',
        url: 'https://f.m.suning.com/api/ct.do',
        parse: (body) => {
            const j = JSON.parse(body);
            if (j.code !== '1' || !j.currentTime) return null;
            // currentTime 是毫秒时间戳，但用的是服务器本地时区。
            // 苏宁接口返回的是 UTC 毫秒数，直接构造 Date 即可。
            return new Date(Number(j.currentTime)).toISOString();
        }
    },
    {
        name: 'timeapi.io',
        url: 'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Shanghai',
        parse: (body) => {
            const j = JSON.parse(body);
            if (!j.dateTime) return null;
            // timeapi.io 对 Asia/Shanghai 返回的是该时区的墙上时间，
            // 没有时区后缀，必须手动补 +08:00，否则会被当成 UTC 解析。
            return j.dateTime.replace(/\.\d+$/, '') + '+08:00';
        }
    }
];

function fetchSource(src, timeoutMs = 6000) {
    return new Promise((resolve) => {
        const req = https.get(src.url, {
            timeout: timeoutMs,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bj-time/1.0)' }
        }, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                return resolve(null);
            }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                try {
                    const iso = src.parse(data);
                    if (!iso) return resolve(null);
                    const d = new Date(iso);
                    if (isNaN(d.getTime())) return resolve(null);
                    resolve({ name: src.name, iso, ms: d.getTime() });
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.on('error', () => resolve(null));
    });
}

exports.handler = async () => {
    const errors = [];

    for (const src of SOURCES) {
        const r = await fetchSource(src);
        if (r) {
            // 校验：与本地时间偏差超过 24h 视为异常源，避免把访客时钟带跑偏
            const drift = Math.abs(Date.now() - r.ms);
            if (drift > 24 * 3600 * 1000) {
                errors.push(`${src.name}: drift too large (${Math.round(drift / 1000)}s)`);
                continue;
            }
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Cache-Control': 'no-store',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    source: r.name,
                    originalData: {
                        code: 200,
                        time: r.iso
                    }
                })
            };
        }
        errors.push(`${src.name}: unavailable`);
    }

    // 全部失败时如实返回失败，由前端回退到访客本机时间
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            success: false,
            originalData: { code: 500, time: null },
            errors
        })
    };
};
