import { describe, it, expect, vi } from 'vitest';
import { fetchDestinationStory } from './groqApi';

// Mock the Groq SDK
vi.mock('groq-sdk', () => {
  return {
    default: class MockGroq {
      constructor() {
        this.chat = {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'Mocked story content.' } }]
            })
          }
        };
      }
    }
  };
});

describe('fetchDestinationStory', () => {
  it('should return null if destination is empty', async () => {
    const result = await fetchDestinationStory('');
    expect(result).toBeNull();
  });

  it('should return a story for a valid destination', async () => {
    const result = await fetchDestinationStory('Paris');
    expect(result).toBe('Mocked story content.');
  });
});
