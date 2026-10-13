
import { useState } from 'react';
import './App.css';

export const restaurants = [
  { id: 1, name: 'Spice Garden', cuisine: 'Indian', rating: 4.5 },
  { id: 2, name: 'Pizza Corner', cuisine: 'Italian', rating: 4.3 },
  { id: 3, name: 'Green Bowl', cuisine: 'Healthy Food', rating: 4.6 },
];

export const foods = [
  { id: 1, restaurantId: 1, name: 'Chicken Biryani', price: 180 },
  { id: 2, restaurantId: 1, name: 'Paneer Biryani', price: 150 },
  { id: 3, restaurantId: 2, name: 'Margherita Pizza', price: 220 },
  { id: 4, restaurantId: 3, name: 'Veg Salad', price: 120 },
];

export function calculateCartTotal(cart) {
  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

export function RestaurantList({ items = restaurants }) {
  return (
    <section>
      <h2>Restaurants</h2>
      <div className="card-grid">
        {items.map((restaurant) => (
          <article className="card" key={restaurant.id}>
            <h3>{restaurant.name}</h3>
            <p>{restaurant.cuisine}</p>
            <p>Rating: ⭐ {restaurant.rating}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FoodMenu({ items = foods, onAdd = () => {} }) {
  return (
    <section>
      <h2>Food Menu</h2>
      <div className="card-grid">
        {items.map((food) => (
          <article className="card" key={food.id}>
            <h3>{food.name}</h3>
            <p>Price: ₹{food.price}</p>
            <button type="button" onClick={() => onAdd(food)}>
              Add to Cart
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OrderForm({
  onOrder = () => {},
  cartCount,
  loading = false,
}) {
  const [customer, setCustomer] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const name = customer.trim();

    if (!name) {
      setError('Please enter your name.');
      return;
    }

    // Validate the cart when the parent supplies its count.
    if (cartCount !== undefined && cartCount < 1) {
      setError('Please add food to your cart first.');
      return;
    }

    setError('');

    try {
      await onOrder({ customer: name });
      setCustomer('');
    } catch (err) {
      setError(err.message || 'Unable to place your order.');
    }
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <label htmlFor="customer">Customer name</label>

      <input
        id="customer"
        name="customer"
        type="text"
        placeholder="Enter your name"
        value={customer}
        onChange={(event) => {
          setCustomer(event.target.value);
          setError('');
        }}
        autoComplete="name"
        required
        disabled={loading}
      />

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  function addToCart(food) {
    if (loading) return;

    setMessage('');
    setMessageType('');
    setLastOrder(null);

    setCart((current) => {
      const existing = current.find((item) => item.id === food.id);

      if (existing) {
        return current.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...food, quantity: 1 }];
    });
  }

  function removeFromCart(foodId) {
    if (loading) return;

    setMessage('');
    setMessageType('');
    setLastOrder(null);

    setCart((current) =>
      current
        .map((item) =>
          item.id === foodId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  async function placeOrder(order) {
    if (loading) {
      throw new Error('Your order is already being processed.');
    }

    if (cart.length === 0) {
      throw new Error('Your cart is empty. Add food before ordering.');
    }

    const orderedCart = cart.map((item) => ({ ...item }));
    const total = calculateCartTotal(orderedCart);

    const orderData = {
      customer: order.customer.trim(),
      items: orderedCart.map((item) => ({
        foodId: item.id,
        quantity: item.quantity,
      })),
    };

    setLoading(true);
    setMessage('');
    setMessageType('');
    setLastOrder(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            `Order failed with status ${response.status}.`
        );
      }

      if (result.success === false) {
        throw new Error(
          result.error || result.message || 'The order was rejected.'
        );
      }

      const savedOrder = result.order || result;
      const orderId = savedOrder.id ?? savedOrder._id ?? null;
      const confirmedTotal = savedOrder.total ?? total;

      setLastOrder({
        id: orderId,
        customer: orderData.customer,
        items: orderedCart,
        total: confirmedTotal,
      });

      setMessage(
        `Order placed successfully!${
          orderId !== null ? ` Order ID: ${orderId}.` : ''
        } Thank you, ${orderData.customer}! Total: ₹${confirmedTotal}`
      );
      setMessageType('success');
      setCart([]);
    } catch (error) {
      const errorMessage =
        error.message === 'Failed to fetch'
          ? 'Cannot connect to the backend. Check the server and Vite API proxy.'
          : error.message || 'Order failed. Please try again.';

      setMessage(errorMessage);
      setMessageType('error');

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = calculateCartTotal(cart);

  return (
    <main className="container">
      <header className="hero">
        <h1>FoodExpress 🍔</h1>
        <p>Discover food, order your favourites, and enjoy!</p>
      </header>

      <RestaurantList />

      <FoodMenu onAdd={addToCart} />

      <section className="cart-section">
        <h2>Shopping Cart ({cartCount})</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty. Add some delicious food!</p>
        ) : (
          <>
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>₹{item.price * item.quantity}</span>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  disabled={loading}
                  aria-label={`Remove one ${item.name}`}
                >
                  −
                </button>

                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  disabled={loading}
                  aria-label={`Add one ${item.name}`}
                >
                  +
                </button>
              </div>
            ))}

            <h3>Total: ₹{cartTotal}</h3>
          </>
        )}
      </section>

      <section className="order-section">
        <h2>Place Your Order</h2>

        <OrderForm
          onOrder={placeOrder}
          cartCount={cartCount}
          loading={loading}
        />

        {message && (
          <p
            className={
              messageType === 'success'
                ? 'success-message'
                : 'error-message'
            }
            role={messageType === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {message}
          </p>
        )}

        {lastOrder && (
          <section className="order-confirmation">
            <h3>Order Confirmation ✅</h3>
            <p>Customer: {lastOrder.customer}</p>

            {lastOrder.id !== null && (
              <p>Order ID: {lastOrder.id}</p>
            )}

            <h4>Ordered Items</h4>
            <ul>
              {lastOrder.items.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity} — ₹
                  {item.price * item.quantity}
                </li>
              ))}
            </ul>

            <h3>Order Total: ₹{lastOrder.total}</h3>
          </section>
        )}
      </section>
    </main>
  );
}
