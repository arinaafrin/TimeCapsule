import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

describe('router isolation', () => {
  it('matches /explorer in isolation', async () => {
    window.history.pushState({}, '', '/explorer');

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/explorer" element={<div>Explorer Found</div>} />
        </Routes>
      </BrowserRouter>,
    );

    const el = await screen.findByText('Explorer Found');
    expect(el).toBeInTheDocument();
  });
});