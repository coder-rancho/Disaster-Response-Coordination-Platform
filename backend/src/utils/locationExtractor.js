import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract location information from a text description using Google's Gemini AI
 * @param {string} description - The text description to analyze
 * @returns {Promise<string>} The extracted location name
 * @throws {Error} If no location is found or if the API call fails
 */
export const extractLocation = async (description) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Extract the main location from this disaster description. Return ONLY the location name, nothing else.
    If no specific location is found, respond with "Unknown location".
    
    Description: "${description}"`;

    const result = await model.generateContent(prompt);
    const location = result.response.text().trim();
    
    if (location === "Unknown location") {
      throw new Error('No location found in description');
    }

    return location;
  } catch (error) {
    console.error('Location extraction error:', error);
    throw new Error('Failed to extract location from description');
  }
};
