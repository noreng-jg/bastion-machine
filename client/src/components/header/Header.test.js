import { render, screen } from '@testing-library/react';
 import Header from './Header';

describe('Counter component', () => {
  it('Verifies expected title', () => {
    render(<Header />);

    const elementTitle = screen.getByText('SSH');
    expect(elementTitle).toHaveClass('header-title');
    expect(elementTitle).toBeInTheDocument();
  });
});
