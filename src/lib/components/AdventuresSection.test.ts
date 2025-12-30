import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AdventuresSection from './AdventuresSection.svelte';

describe('AdventuresSection', () => {
  it('renders the adventures section', () => {
    render(AdventuresSection);
    const section = document.querySelector('#adventures');
    expect(section).toBeInTheDocument();
  });

  it('displays the section heading', () => {
    render(AdventuresSection);
    const heading = screen.getByText('Adventures');
    expect(heading).toBeInTheDocument();
  });

  it('displays the section description', () => {
    render(AdventuresSection);
    const description = screen.getByText(/Your compass to epic adventures/i);
    expect(description).toBeInTheDocument();
  });

  it('renders hiking trails feature card', () => {
    render(AdventuresSection);
    const hikingCard = screen.getByText('Hiking Trails');
    expect(hikingCard).toBeInTheDocument();
    expect(screen.getByText(/Handpicked trails for your next adventure/i)).toBeInTheDocument();
  });

  it('renders camping sites feature card', () => {
    render(AdventuresSection);
    const campingCard = screen.getByText('Camping Sites');
    expect(campingCard).toBeInTheDocument();
    expect(screen.getByText(/Perfect basecamp locations for scouts/i)).toBeInTheDocument();
  });

  it('renders share your trail feature card', () => {
    render(AdventuresSection);
    const shareCard = screen.getByText('Share Your Trail');
    expect(shareCard).toBeInTheDocument();
    expect(screen.getByText(/Submit your adventures and help other scouts/i)).toBeInTheDocument();
  });

  it('has explore adventures button with correct link', () => {
    render(AdventuresSection);
    const exploreButton = screen.getByText('Explore Adventures');
    expect(exploreButton).toBeInTheDocument();
    expect(exploreButton).toHaveAttribute('href', 'https://adventures.unitspark.org/');
    expect(exploreButton).toHaveAttribute('target', '_blank');
  });

  it('renders the adventures logo', () => {
    render(AdventuresSection);
    const logo = screen.getByAltText('Adventures');
    expect(logo).toBeInTheDocument();
  });
});
