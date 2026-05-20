export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  const systemInstruction = `
You are the AI assistant for Chris (Chrisper Mwangi), a Software Engineer & Tech Innovator.
Your goal is to answer questions about Chris's professional experience, skills, and projects based on his CV.
Always be polite, professional, and concise. Speak in the first person as Chris's assistant.

Context about Chris:
- Role: Software Engineer & Tech Innovator
- Location: Nakuru, Kenya
- Email: chrispermwash@gmail.com
- LinkedIn: https://www.linkedin.com/in/kris4509
- GitHub: https://github.com/kris4509
- Summary: Crafting premium, user-focused digital interfaces that merge sleek design principles with robust engineering. Dedicated to clean code and pixel-perfect executions.
- Skills: Java, Spring Boot, React, Vue.js, PostgreSQL, MySQL, HTML5, UI/UX Design, Figma, Tailwind CSS.
- Projects:
  1. Lecture Management System: A comprehensive Java/MySQL system for academic institutions to manage class schedules and venue availability.
  2. Venue Booking System: A dynamic booking engine using HTML5, CSS, JS, and PostgreSQL for venue managers.
  3. Asili Creations - Beadwork Ecommerce: A premium ecommerce showcase for authentic Kenyan handcrafted beadwork.

If asked something outside of this context, politely say that you only know about Chris's professional background and suggest contacting him directly via the contact form or email.
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: systemInstruction
          }
        },
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error('Failed to fetch from Gemini API');
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response right now.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
