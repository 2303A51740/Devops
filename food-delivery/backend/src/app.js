
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const restaurants = [
  { id: 1, name: 'Spice Garden', cuisine: 'Indian', rating: 4.5 },
  { id: 2, name: 'Pizza Corner', cuisine: 'Italian', rating: 4.3 },
  { id: 3, name: 'Green Bowl', cuisine: 'Healthy Food', rating: 4.6 },
];

const foods = [
  { id: 1, restaurantId: 1, name: 'Chicken Biryani', price: 180 },
  { id: 2, restaurantId: 1, name: 'Paneer Biryani', price: 150 },
  { id: 3, restaurantId: 2, name: 'Margherita Pizza', price: 220 },
  { id: 4, restaurantId: 3, name: 'Veg Salad', price: 120 },
];

let orders = [];
let nextOrderId = 1;

app.get('/', (req, res) => {
  res.send('Food Delivery API is running successfully!');
});

app.get('/api/restaurants', (req, res) => {
  res.json({ restaurants });
});

app.get('/api/foods', (req, res) => {
  res.json({ foods });
});

app.post('/api/orders', (req, res) => {
  const { customer, items } = req.body || {};

  if (typeof customer !== 'string' || !customer.trim()) {
    return res.status(400).json({
      error: 'Customer name is required.',
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Order must contain at least one food item.',
    });
  }

  let total = 0;
  const validatedItems = [];

  for (const item of items) {
    if (
      !item ||
      !Number.isInteger(item.foodId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      return res.status(400).json({
        error: 'Each item must have a valid foodId and quantity from 1 to 100.',
      });
    }

    const food = foods.find((entry) => entry.id === item.foodId);

    if (!food) {
      return res.status(400).json({
        error: `Food with ID ${item.foodId} was not found.`,
      });
    }

    total += food.price * item.quantity;

    validatedItems.push({
      foodId: food.id,
      name: food.name,
      price: food.price,
      quantity: item.quantity,
      subtotal: food.price * item.quantity,
    });
  }

  const order = {
    id: nextOrderId++,
    customer: customer.trim(),
    items: validatedItems,
    total,
    status: 'Placed',
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  return res.status(201).json({
    message: 'Order placed successfully!',
    order,
  });
});

app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

module.exports = app;
