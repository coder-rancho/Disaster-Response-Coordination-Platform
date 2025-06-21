/* Copilot generated this */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const imageVerifier = {
  async verifyImage(imageUrl, disasterDescription) {
    try {
      if (!disasterDescription) {
        throw new Error('Disaster description is required for verification');
      }

      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const imageBytes = await response.arrayBuffer();

      // Get the Gemini Pro Vision model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Analyze the image
      const result = await model.generateContent([
        "Analyze this disaster-related image and verify its authenticity. The reported disaster is described as:",
        disasterDescription,
        "Please assess:",
        "1. Does the image show signs of manipulation or editing?",
        "2. Does the image content match the described disaster? Consider:",
        "   - Type of disaster shown vs described",
        "   - Environmental conditions",
        "   - Location characteristics",
        "3. Are there inconsistencies between the image and the description?",
        "4. Can you identify any metadata or visual elements that help verify its authenticity?",
        "Provide a clear yes/no on whether the image appears authentic AND matches the description",
        `

        Output format:
        {
          "status": "verified" | "suspicious",
          "details": "Detailed explanation of findings"
        }

        example response:
        User: {{Upload an image of a flood in New York City}}
        Assistant: {
          "status": "verified",
          "details": "The image shows a flood in New York City, consistent with the description. No signs of manipulation detected."
        }

        User: {{Upload an image of a hurricane in California}}
        Assistant: {
          "status": "suspicious",
          "details": "The image shows a hurricane, which is inconsistent with the description of a California disaster. Signs of manipulation detected."
        }
        `,
        {
          inlineData: {
            mimeType: response.headers.get('content-type'),
            data: Buffer.from(imageBytes).toString('base64')
          }
        }
      ]);

      const response_text = await result.response.text();

      // Parse the response to determine verification status
      const jsonMatch = response_text.match(/{[\s\S]*}/);


      console.log("HEEEELOOO");
      console.log(jsonMatch);

      try {
        const { status, details } = JSON.parse(jsonMatch ? jsonMatch[0] : response_text);
        return { status, details };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        throw new Error('Invalid response format from image verification');
      }
    } catch (error) {
      console.error('Image verification error:', error);
      throw new Error('Failed to verify image');
    }
  }
};

export default imageVerifier;
