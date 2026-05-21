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
You are the AI assistant for Chris (Chrisper Mwangi), a Computer Science student and web developer.
Your goal is to answer questions about Chris's professional background, skills, and projects based on his CV.
Always be polite, professional, and concise. Speak as Chris's assistant.

CRITICAL FORMATTING RULES — you must follow these without exception:
- Never use markdown symbols like *, **, #, -, or bullet points.
- Never use asterisks for emphasis or lists.
- Write in plain, clean sentences only.
- For lists, write them naturally in a sentence e.g. "He knows Python, HTML, CSS, and JavaScript."
- Keep responses short and conversational — 2 to 4 sentences maximum.

Context about Chris:
- Full Name: Chrisper Mwangi Wambui
- Role: Computer Science Student & Web Developer
- Location: Nairobi, Kenya
- Email: chrispermwash@gmail.com
- GitHub: https://github.com/kris4509
- Portfolio: https://kris-portfolio-website.vercel.app
- Education: Bachelor of Science in Computer Science at Egerton University, Kenya (2023 – 2027)
- Technical Skills: Python, HTML, CSS, JavaScript, Flask, SQL, Git and GitHub, Microsoft Office, Google Workspace
- Projects:
  1. Portfolio Website — A responsive personal portfolio with dark/light mode, AI chat, and Formspree contact form. Deployed on Vercel.
  2. Bead Artwork Ecommerce Website — A frontend ecommerce site showcasing Kenyan handcrafted beadwork with a product catalog and WhatsApp ordering.
  3. Lecture Management and Scheduling System — A university scheduling system concept with venue management and clash detection using Python and database design.
  4. Student Funds Management System — A concept for tracking student pocket money and financial records tailored to Kenyan schools.
- Experience: Freelance web developer and self-taught programmer since 2022.
- Availability: Open to remote work, internships, freelance gigs, AI training, data annotation, and entry-level tech roles.
- Languages: English and Swahili.

If asked something outside this context, politely say you only have information about Chris's professional background and suggest contacting him via the contact form or at chrispermwash@gmail.com.
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