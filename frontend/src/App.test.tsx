import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from './components/Hero';

test('renders Start Building button', () => {
  const onStartBuilding = jest.fn();
  render(<Hero onStartBuilding={onStartBuilding} />);
  const button = screen.getByText(/Start Building/i);
  expect(button).toBeInTheDocument();
});
