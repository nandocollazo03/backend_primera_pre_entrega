const express = require('express');
const ProductManager = require('./ProductManager');
const CartManager = require('./cartManager');
const path = require('path');

const app = express();
const port = 8080;

const productManager = new ProductManager('./products.json');
const cartManager = new CartManager('./carts.json');

app.use(express.json());

// Rutas para los productos
const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = productManager.getProducts();

    if (limit !== undefined) {
      res.json(products.slice(0, limit));
    } else {
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error Interno del Servidor' });
  }
});

productRouter.get('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = productManager.getProductById(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error Interno del Servidor' });
  }
});

productRouter.post('/', (req, res) => {
  const product = req.body;
  productManager.addProduct(product);
  res.status(201).json({ message: 'Producto agregado exitosamente' });
});

productRouter.put('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const updatedFields = req.body;
  productManager.updateProduct(productId, updatedFields);
  res.json({ message: 'Producto actualizado exitosamente' });
});

productRouter.delete('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  productManager.deleteProduct(productId);
  res.json({ message: 'Producto eliminado exitosamente' });
});

app.use('/api/products', productRouter);

// Rutas para los carritos
const cartRouter = express.Router();

cartRouter.post('/', (req, res) => {
  const cart = cartManager.createCart();
  res.status(201).json(cart);
});

cartRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  const cart = cartManager.getCartById(cartId);
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

cartRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = parseInt(req.params.pid);
  const quantity = req.body.quantity || 1;
  cartManager.addProductToCart(cartId, productId, quantity);
  res.json({ message: 'Producto agregado al carrito exitosamente' });
});

app.use('/api/carts', cartRouter);

app.listen(port, () => {
  console.log(`El servidor se está ejecutando en el puerto ${port}`);
});