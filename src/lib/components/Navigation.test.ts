import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Navigation from './Navigation.svelte';

describe('Navigation', () => {
  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
  });

  it('renders the navigation bar', () => {
    render(Navigation);
    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('renders the company logo', () => {
    render(Navigation);
    const logo = screen.getByAltText('Adventures by Unit Spark');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(Navigation);
    const adventuresLink = screen.getByText('Adventures');
    const unitMgmtLink = screen.getByText('Unit Management');

    expect(adventuresLink).toBeInTheDocument();
    expect(unitMgmtLink).toBeInTheDocument();
  });

  it('has correct href attributes for navigation links', () => {
    render(Navigation);
    const adventuresLink = screen.getByText('Adventures');
    const unitMgmtLink = screen.getByText('Unit Management');

    expect(adventuresLink).toHaveAttribute('href', '#adventures');
    expect(unitMgmtLink).toHaveAttribute('href', '#unit-management');
  });

  it('applies transparent background when not scrolled', () => {
    render(Navigation);
    const nav = document.querySelector('nav');
    expect(nav).toHaveClass('bg-transparent');
  });
});
