import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  RestaurantList,
  FoodMenu,
  OrderForm,
  calculateCartTotal,
} from './App';

describe('Restaurant component', () => {
  it('displays restaurants', () => {
    render(<RestaurantList />);
    expect(screen.getByText('Spice Garden')).toBeInTheDocument();
    expect(screen.getByText('Pizza Corner')).toBeInTheDocument();
  });
});

describe('Food component', () => {
  it('displays food and supports adding it to the cart', () => {
    const onAdd = vi.fn();

    render(<FoodMenu onAdd={onAdd} />);

    expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Add to Cart' })[0]);

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Chicken Biryani', price: 180 }),
    );
  });
});

describe('Cart calculation', () => {
  it('calculates the total correctly', () => {
    const cart = [
      { id: 1, price: 180, quantity: 2 },
      { id: 2, price: 150, quantity: 1 },
    ];

    expect(calculateCartTotal(cart)).toBe(510);
  });

  it('returns zero for an empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
  });
});

describe('Order form', () => {
  it('submits a valid customer name', () => {
    const onOrder = vi.fn();

    render(<OrderForm onOrder={onOrder} />);
    fireEvent.change(screen.getByLabelText('Customer name'), {
      target: { value: 'Rahul' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(onOrder).toHaveBeenCalledWith({ customer: 'Rahul' });
  });

  it('rejects a blank customer name', () => {
    const onOrder = vi.fn();

    render(<OrderForm onOrder={onOrder} />);
    fireEvent.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(onOrder).not.toHaveBeenCalled();
  });
});