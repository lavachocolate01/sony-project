const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Data Source: 載入 JSON 資料庫並使用解構賦值
const { data: lensData } = require('./data/lens.json');

// 2. 根目錄定位
const rootDir = __dirname;

// 3. 日誌紀錄 (檢測維度 4)
app.use((req, res, next) => {
    const log = `[${new Date().toLocaleString()}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(path.join(rootDir, 'access.log'), log);
    next();
});

// 4. 靜態資源 (檢測維度 2)
app.use(express.static(path.join(rootDir, 'public')));

// 5. 管理員驗證 (修正後的區域)
app.get('/admin', (req, res) => {
    const isAuth = req.query.code === '521';
    
    // 先決定要顯示什麼字，避免在模板字串裡寫太複雜的邏輯
    const message = isAuth ? 'Welcome to Admin' : 'Access Denied (暗號錯誤)';
    const status = isAuth ? 200 : 403;

    res.status(status).send(`
        <h1 style="text-align:center; margin-top:50px;">${message}</h1>
        <br>
        <div style="text-align:center;"><a href="/">回首頁</a></div>
    `);
});

// 6. 動態產品頁 (檢測維度 3)
app.get('/product/:model.html', (req, res) => {
    const { model } = req.params;
    const product = lensData.find(item => item.model === model);
    
    if (!product) return res.status(404).send('<h1>404 型號不存在</h1>');

    res.send(`
        <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1>Sony 展示中心</h1>
            <hr>
            <h2>${product.name}</h2>
            <img src="${product.imageUrl}" style="width:400px; border-radius:10px;">
            <p>型號：${product.model}</p>
            <a href="/">回首頁</a>
        </div>
    `);
});

// 7. 404 萬用路徑 (檢測維度 6)
app.all(/.*$/, (req, res) => {
    res.status(404)
       .set('Content-Type', 'text/html; charset=utf-8')
       .send('<h1 style="text-align:center; padding-top:50px;">404 Not Found (抱歉，路徑不存在)</h1>');
});

app.listen(PORT, () => {
    console.log(`🚀 伺服器已啟動！`);
    console.log(`🔗 測試網址: http://localhost:${PORT}`);
});