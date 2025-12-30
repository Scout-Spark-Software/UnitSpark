import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Hero from './Hero.svelte';

describe('Hero', () => {
  it('renders the hero section', () => {
    render(Hero);
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(Hero);
    const heading = screen.getByText('Empowering Scouting Adventures');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('displays the subtitle text', () => {
    render(Hero);
    const subtitle = screen.getByText(/Complete solutions for hiking, camping, and unit management/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('renders the call-to-action button', () => {
    render(Hero);
    const ctaButton = screen.getByText('Explore Products');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '#adventures');
  });

  it('has proper gradient background classes', () => {
    render(Hero);
    const section = document.querySelector('section');
    expect(section).toHaveClass('bg-gradient-to-br');
  });

  it('renders animated sparks elements', () => {
    render(Hero);
    const sparks = document.querySelectorAll('.spark');
    expect(sparks.length).toBeGreaterThan(0);
  });
});
