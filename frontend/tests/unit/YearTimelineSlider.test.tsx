import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { YearTimelineSlider } from '../../src/features/explorer/YearTimelineSlider';

describe('YearTimelineSlider', () => {
  it('displays the current year value formatted as CE', () => {
    render(<YearTimelineSlider value={1889} onChange={vi.fn()} />);

    expect(screen.getByTestId('year-display')).toHaveTextContent('1889 CE');
    expect(screen.getByTestId('year-display')).toHaveTextContent('historical');
  });

  it('formats negative years as BCE', () => {
    render(<YearTimelineSlider value={-500} onChange={vi.fn()} />);

    expect(screen.getByTestId('year-display')).toHaveTextContent('500 BCE');
  });

  it('calls onChange when the slider value changes', () => {
    const handleChange = vi.fn();
    render(<YearTimelineSlider value={2000} onChange={handleChange} />);

    const slider = screen.getByRole('slider', { name: 'Select year' });
    fireEvent.change(slider, { target: { value: '2050' } });

    expect(handleChange).toHaveBeenCalledWith(2050);
  });
});
