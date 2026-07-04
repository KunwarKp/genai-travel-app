import Groq from 'groq-sdk';

// Initialize Groq client
// Security Note: For this hackathon demo, we allow browser execution.
// In production, this would be routed through a secure backend proxy to protect the key.
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'missing_key',
  dangerouslyAllowBrowser: true 
});

/**
 * Fetches an immersive AI story for the destination.
 * 
 * @param {string} destination - The name of the place
 * @param {string} category - The active filter category
 * @param {string} language - The language/dialect to generate the response in
 * @returns {Promise<string>} - The markdown formatted story
 */
export async function fetchDestinationStory(destination, category = "Hidden Gems", language = "English") {
  if (!destination) return null;

  try {
    let systemPrompt = `You are an elite, highly immersive AI local travel guide. 
Your goal is to deeply engage the user with a vivid, detailed, and completely factual narrative about the destination.

CRITICAL LANGUAGE REQUIREMENT:
You MUST write your ENTIRE response exclusively in the following language/dialect: ${language}. 
Adopt the authentic cultural tone, colloquialisms (if appropriate for the dialect), and phrasing of this language perfectly. Do not use English unless the user's requested language is English.

For every specific place, restaurant, or attraction you mention, you MUST include a live Google Maps link in this exact markdown format: [Place Name](https://www.google.com/maps/search/?api=1&query=Exact+Place+Name+Location). Structure your response with clean bullet points and bold text where appropriate. `;

    if (category === 'Hidden Gems') {
       systemPrompt += 'Recommend 2-3 specific hidden gems in the area. Focus on sensory details and off-the-beaten-path locations.';
    } else if (category === 'Attractions') {
       systemPrompt += 'Recommend 2-3 must-see attractions in the area, briefly explaining their cultural significance.';
    } else if (category === 'Local Culture') {
       systemPrompt += 'Explain the local people, customs, and heritage in a captivating, respectful way. Suggest 1-2 specific neighborhoods or cultural centers to visit.';
    } else if (category === 'Recipes') {
       systemPrompt += 'Share a famous local recipe or popular street food experience, describing the tastes and smells vividly. Suggest 1-2 specific local cafes, markets, or restaurants to try it.';
    } else if (category === 'Events') {
       systemPrompt += 'Detail 2-3 current, upcoming, or typical seasonal local events (like festivals, night markets, live music, or cultural gatherings) happening here. Include the usual venues and provide live Google Maps links for those venues.';
    } else if (category === 'Storytelling') {
       systemPrompt += 'Briefly summarize 2-3 local myths, historical legends, or fascinating lore about this place. For EACH legend, you MUST include a magic link to hear the full story using this EXACT format: [Hear the full story](#deep-dive-Name-of-the-Legend). Link to the specific historical site where it happened using a Google Maps link.';
    } else if (category === 'Connect') {
       systemPrompt += 'Recommend 2-3 specific local cafes, co-working spaces, or social hubs where travelers and locals actually hang out and connect. Provide Google Maps links.';
    } else if (category === 'Deep Dive') {
       systemPrompt += 'Provide an exhaustive, vivid deep dive into this specific topic or legend. Include historical context, sensory details, and why it matters to the local culture. If it is tied to a specific location, provide a Google Maps link.';
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Tell me about ${destination} focusing on ${category}.`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1500,
    });

    return chatCompletion.choices[0]?.message?.content || 'Story unavailable.';
  } catch (error) {
    console.error("Groq API Error:", error);
    if (error.status === 429) {
      throw new Error('Groq rate limit exceeded (Too many searches too fast). Please wait a moment and try again.');
    }
    throw new Error(error.message || 'Failed to generate story. Please check your API key setup.');
  }
}
