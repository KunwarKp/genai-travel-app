import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders search input field', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('Where to? (e.g., Haridwar)')).toBeInTheDocument();
  });

  it('triggers search debounced after typing 3+ characters', async () => {
    const onSearchMock = vi.fn();
    render(<SearchBar onSearch={onSearchMock} />);

    const input = screen.getByLabelText('Search for a destination');
    fireEvent.change(input, { target: { value: 'Kyoto' } });

    // Fast-forward timers to run debounce handler
    vi.advanceTimersByTime(1500);

    expect(onSearchMock).toHaveBeenCalledWith('Kyoto');
  });

  it('triggers instant search on form submit', () => {
    const onSearchMock = vi.fn();
    render(<SearchBar onSearch={onSearchMock} />);

    const input = screen.getByLabelText('Search for a destination');
    fireEvent.change(input, { target: { value: 'Rome' } });

    const form = screen.getByLabelText('Search destination form');
    fireEvent.submit(form);

    expect(onSearchMock).toHaveBeenCalledWith('Rome');
  });

  it('handles Geolocation correctly on button click', async () => {
    // Switch to real timers for this async geolocation test to avoid timeout
    vi.useRealTimers();

    const onSearchMock = vi.fn();
    
    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => 
        success({
          coords: {
            latitude: 35.6762,
            longitude: 139.6503
          }
        })
      )
    };
    global.navigator.geolocation = mockGeolocation;

    // Mock global fetch for Nominatim reverse lookup
    const mockResponse = {
      name: 'Shinjuku',
      address: { city: 'Tokyo' }
    };
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    });

    render(<SearchBar onSearch={onSearchMock} />);
    
    const gpsButton = screen.getByLabelText('Use my current GPS location');
    fireEvent.click(gpsButton);

    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledWith('Shinjuku, Tokyo');
    });
  });
});
