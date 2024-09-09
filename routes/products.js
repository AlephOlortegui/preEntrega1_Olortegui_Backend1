const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/products.json');

// Helper function to read the products file
const readProductsFile = () => {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
};

// Helper function to write to the products file
const writeProductsFile = (data) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));
};

// GET /api/products - List all products
router.get('/', (req, res) => {
    const products = readProductsFile();
    const { limit } = req.query;

    if (limit) {
        return res.json(products.slice(0, limit));
    }

    res.json(products);
});

// GET /api/products/:pid - Get product by ID
router.get('/:pid', (req, res) => {
    const products = readProductsFile();
    const product = products.find(p => p.id === req.params.pid);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

// POST /api/products - Add a new product
router.post('/', (req, res) => {
    const products = readProductsFile();
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'All fields except thumbnails are required' });
    }

    const newProduct = {
        id: (products.length + 1).toString(),
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    writeProductsFile(products);

    res.status(201).json(newProduct);
});

// PUT /api/products/:pid - Update a product
router.put('/:pid', (req, res) => {
    const products = readProductsFile();
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = { ...products[productIndex], ...req.body };
    products[productIndex] = updatedProduct;
    writeProductsFile(products);

    res.json(updatedProduct);
});

// DELETE /api/products/:pid - Delete a product
router.delete('/:pid', (req, res) => {
    let products = readProductsFile();
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    products = products.filter(p => p.id !== req.params.pid);
    writeProductsFile(products);

    res.status(204).end();
});

module.exports = router;
