const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

const readCartsFile = () => {
    const data = fs.readFileSync(cartsFilePath, 'utf8');
    return JSON.parse(data);
};

const writeCartsFile = (data) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(data, null, 2));
};

const readProductsFile = () => {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
};

// POST /api/carts - Create a new cart
router.post('/', (req, res) => {
    const carts = readCartsFile();
    const newCart = {
        id: (carts.length + 1).toString(),
        products: []
    };

    carts.push(newCart);
    writeCartsFile(carts);

    res.status(201).json(newCart);
});

// GET /api/carts/:cid - Get cart by ID
router.get('/:cid', (req, res) => {
    const carts = readCartsFile();
    const cart = carts.find(c => c.id === req.params.cid);

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cart);
});

// POST /api/carts/:cid/product/:pid - Add product to cart
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCartsFile();
    const products = readProductsFile();

    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    const product = products.find(p => p.id === req.params.pid);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const existingProduct = cart.products.find(p => p.product === req.params.pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    writeCartsFile(carts);
    res.json(cart);
});

module.exports = router;
