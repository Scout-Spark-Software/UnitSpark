import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Footer from './Footer.svelte';

describe('Footer', () => {
  it('renders the footer element', () => {
    render(Footer);
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('displays the company name and description', () => {
    render(Footer);
    const companyName = screen.getByText('Unit Spark');
    const description = screen.getByText(/Empowering scouting organizations with modern tools/i);

    expect(companyName).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  it('renders the Products section heading', () => {
    render(Footer);
    const productsHeading = screen.getByText('Products');
    expect(productsHeading).toBeInTheDocument();
  });

  it('renders products links', () => {
    render(Footer);
    const adventuresLink = screen.getByText('Adventures');
    const unitMgmtLink = screen.getByText('Unit Management');

    expect(adventuresLink).toBeInTheDocument();
    expect(unitMgmtLink).toBeInTheDocument();
  });

  it('adventures link has correct href', () => {
    render(Footer);
    const adventuresLink = screen.getByText('Adventures');
    expect(adventuresLink).toHaveAttribute('href', 'https://adventures.unitspark.org');
  });

  it('renders the Company section heading', () => {
    render(Footer);
    const companyHeading = screen.getByText('Company');
    expect(companyHeading).toBeInTheDocument();
  });

  it('renders company links', () => {
    render(Footer);
    const aboutLink = screen.getByText('About Us');
    const contactLink = screen.getByText('Contact');
    const supportLink = screen.getByText('Support');

    expect(aboutLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
    expect(supportLink).toBeInTheDocument();
  });

  it('displays copyright text', () => {
    render(Footer);
    const copyright = screen.getByText(/© 2025 Unit Spark. All rights reserved./i);
    expect(copyright).toBeInTheDocument();
  });

  it('has dark background styling', () => {
    render(Footer);
    const footer = document.querySelector('footer');
    expect(footer).toHaveClass('bg-gray-900');
    expect(footer).toHaveClass('text-white');
  });
});
