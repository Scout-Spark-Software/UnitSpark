import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import UnitManagementSection from './UnitManagementSection.svelte';

describe('UnitManagementSection', () => {
  it('renders the unit management section', () => {
    render(UnitManagementSection);
    const section = document.querySelector('#unit-management');
    expect(section).toBeInTheDocument();
  });

  it('displays the section heading', () => {
    render(UnitManagementSection);
    const heading = screen.getByText('Unit Management');
    expect(heading).toBeInTheDocument();
  });

  it('displays coming soon badge', () => {
    render(UnitManagementSection);
    const comingSoon = screen.getByText('Coming Soon');
    expect(comingSoon).toBeInTheDocument();
  });

  it('displays coming soon message', () => {
    render(UnitManagementSection);
    const message = screen.getByText(/Comprehensive tools for managing your scout unit are on the way/i);
    expect(message).toBeInTheDocument();
  });

  it('has proper gradient background', () => {
    render(UnitManagementSection);
    const section = document.querySelector('#unit-management');
    expect(section).toHaveClass('bg-gradient-to-b');
  });

  it('displays people emoji icon', () => {
    render(UnitManagementSection);
    const icon = screen.getByText('👥');
    expect(icon).toBeInTheDocument();
  });
});
