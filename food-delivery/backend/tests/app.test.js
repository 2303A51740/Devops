
const request = require('supertest');
const app = require('../src/app');

describe('Food Delivery API', () => {
  test('GET /api/restaurants returns restaurants', async () => {
    const response = await request(app).get('/api/restaurants');

    expect(response.status).toBe(200);
    expect(response.body.restaurants.length).toBeGreaterThan(0);
  });

  test('GET /api/foods returns food items with prices', async () => {
    const response = await request(app).get('/api/foods');

    expect(response.status).toBe(200);
    expect(response.body.foods).toHaveLength(4);
    expect(response.body.foods[0].price).toBe(180);
  });

  test('POST /api/orders creates a valid order', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: 'Rahul',
        items: [{ foodId: 1, quantity: 2 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.order.customer).toBe('Rahul');
    expect(response.body.order.total).toBe(360);
  });

  test('GET /api/orders returns placed orders', async () => {
    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.orders)).toBe(true);
  });

  test('rejects an empty customer name', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: '',
        items: [{ foodId: 1, quantity: 1 }],
      });

    expect(response.status).toBe(400);
  });

  test('rejects an empty order', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: 'Rahul',
        items: [],
      });

    expect(response.status).toBe(400);
  });

  test('rejects an unknown food ID', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: 'Rahul',
        items: [{ foodId: 999, quantity: 1 }],
      });

    expect(response.status).toBe(400);
  });

  test('rejects an invalid quantity', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: 'Rahul',
        items: [{ foodId: 1, quantity: 0 }],
      });

    expect(response.status).toBe(400);
  });
});
