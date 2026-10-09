// Netlify Function: 名句库
// 返回结构与原站一致：{ success: true, contents: "<JSON 字符串>" }
// js/quote.js 里会 JSON.parse(data.contents)，所以 contents 必须是字符串而非数组。
//
// 纯静态托管（GitHub Pages）下没有这个函数，前端会自动回退到
// functions/jinju.json —— 该文件内容与此处数据同源。

const fs = require('fs');
const path = require('path');

function loadQuotes() {
    // 直接读取仓库内已发布的静态替身文件。
    // 这样 Netlify 函数与纯静态托管两条路径的数据源是同一个文件，
    // 不可能出现内容漂移；也避免依赖一个不会被发布的 .raw.json。
    const p = path.join(__dirname, '..', '..', 'functions', 'jinju.json');
    try {
        const stub = JSON.parse(fs.readFileSync(p, 'utf8'));
        // 静态替身形状：{ success, originalData: { contents: "<JSON 字符串>" } }
        const inner = stub.contents
            || (stub.originalData && stub.originalData.contents);
        if (typeof inner === 'string') {
            const arr = JSON.parse(inner);
            if (Array.isArray(arr) && arr.length) return arr;
        }
        // 兼容直接就是数组的情况
        if (Array.isArray(stub) && stub.length) return stub;
    } catch (e) { /* 落到下面返回 null */ }
    return null;
}

exports.handler = async () => {
    const arr = loadQuotes();
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
    };

    if (!arr) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                contents: '[]',
                message: '本地名句数据不可用'
            })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            count: arr.length,
            contents: JSON.stringify(arr)
        })
    };
};
