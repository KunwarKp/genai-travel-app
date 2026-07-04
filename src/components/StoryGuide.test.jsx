import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StoryGuide from './StoryGuide';
import * as speechApi from '../utils/speechApi';

// Mock the speech API to prevent actual browser audio calls during testing
vi.mock('../utils/speechApi', () => ({
  playAudio: vi.fn(),
  stopAudio: vi.fn()
}));

describe('StoryGuide Component', () => {
  it('renders loading state correctly', () => {
    render(<StoryGuide destination="Haridwar" isLoading={true} />);
    expect(screen.getByLabelText('Loading story')).toBeInTheDocument();
  });

  it('renders the story and destination when loaded', () => {
    const mockStory = "The ancient temples of Haridwar...";
    render(<StoryGuide destination="Haridwar" isLoading={false} story={mockStory} />);
    
    expect(screen.getByText(mockStory)).toBeInTheDocument();
    expect(screen.getByText('Discover Haridwar')).toBeInTheDocument();
  });

  it('toggles audio playback on button click', () => {
    render(<StoryGuide destination="Haridwar" isLoading={false} story="A hidden gem." />);
    
    const playButton = screen.getByRole('button', { name: /Listen to audio guide/i });
    fireEvent.click(playButton);
    
    // Assert that the playAudio mock was called with the correct story and default TTS code
    expect(speechApi.playAudio).toHaveBeenCalledWith("A hidden gem.", "en-US", expect.any(Function));
  });

  it('displays error message when provided', () => {
    render(<StoryGuide destination="Haridwar" isLoading={false} error="Failed to load" />);
    
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load');
  });
});
