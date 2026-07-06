import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder_key');

export const generateQuestions = async (prompt, count = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const fullPrompt = `Generate EXACTLY ${count} questions based on the following context: "${prompt}". 
    The questions should be a mix of MCQ, Coding, or Subjective. 
    
    CRITICAL INSTRUCTIONS:
    - You MUST output exactly ${count} questions.
    - Format the response strictly as a valid JSON array of objects. 
    - Every object must have the following keys: 
      - "questionText" (string)
      - "type" (string, must be one of 'MCQ', 'Coding', 'Subjective')
      - "options" (array of exactly 4 strings if type is 'MCQ', otherwise an empty array [])
      - "correctAnswer" (string, if type is 'MCQ' this must exactly match one of the 4 options, otherwise empty string "")
    
    Ensure no markdown formatting blocks outside the JSON are returned, just the raw JSON array.`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting if model still adds it
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating questions from Gemini:', error);
    throw new Error('Failed to generate questions via AI. Make sure GEMINI_API_KEY is valid.');
  }
};
