export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const apiKey = process.env.GEMINI_API_KEY;

  // ── Try Gemini first ──
  if (apiKey) {
    try {
      const systemInstruction = `
You are the AI assistant for Chris (Chrisper Mwangi), a Computer Science student and web developer.
Answer questions about Chris's professional background, skills, and projects only.
Always be polite, professional, and concise. Speak as Chris's assistant.

CRITICAL FORMATTING RULES:
- Never use markdown symbols like *, **, #, -, bullet points or asterisks.
- Write in plain, clean sentences only.
- For lists, write naturally e.g. "He knows Python, HTML, CSS, and JavaScript."
- Keep responses short and conversational — 2 to 4 sentences maximum.

Context about Chris:
- Full Name: Chrisper Mwangi Wambui
- Role: Computer Science Student and Web Developer
- Location: Nairobi, Kenya
- Email: chrispermwash@gmail.com
- GitHub: github.com/kris4509
- Portfolio: kris-portfolio-website.vercel.app
- Education: BSc Computer Science at Egerton University, Kenya (2023 – 2027)
- Skills: Python, HTML, CSS, JavaScript, Flask, SQL, Git and GitHub, Microsoft Office, Google Workspace
- Projects:
  1. Portfolio Website — responsive personal portfolio with dark/light mode, AI chat, Formspree contact form, deployed on Vercel.
  2. Bead Artwork Ecommerce Website — frontend ecommerce site for Kenyan handcrafted beadwork with product catalog and WhatsApp ordering.
  3. Lecture Management and Scheduling System — university scheduling concept with venue management and clash detection using Python and database design.
  4. Student Funds Management System — concept for tracking student pocket money tailored to Kenyan schools.
- Experience: Freelance web developer and self-taught programmer since 2022.
- Availability: Open to remote work, internships, freelance, AI training, data annotation, and entry-level tech roles.
- Languages: English and Swahili.

If asked something outside this context, politely say you only know about Chris's professional background and suggest contacting him at chrispermwash@gmail.com.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: { text: systemInstruction } },
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          console.log('✅ Gemini responded successfully');
          return res.status(200).json({ reply, source: 'gemini' });
        }
      }

      // If we reach here, Gemini returned a bad response — fall through to built-in
      console.warn('⚠️ Gemini returned an invalid response, falling back to built-in assistant');

    } catch (err) {
      // Gemini call failed — fall through to built-in
      console.warn('⚠️ Gemini API failed, falling back to built-in assistant:', err.message);
    }
  } else {
    console.warn('⚠️ No GEMINI_API_KEY found, using built-in assistant');
  }

  // ── Fallback: Built-in smart assistant ──
  const reply = builtInReply(message);
  return res.status(200).json({ reply, source: 'builtin' });
}

// ── Built-in assistant ──
function builtInReply(message) {
  const msg = message.toLowerCase().trim();

  const info = {
    name:      "Chrisper Mwangi Wambui",
    role:      "Computer Science student and web developer",
    location:  "Nairobi, Kenya",
    email:     "chrispermwash@gmail.com",
    github:    "github.com/kris4509",
    portfolio: "kris-portfolio-website.vercel.app",
    education: "Bachelor of Science in Computer Science at Egerton University, Kenya (2023 – 2027)",
    skills:    "Python, HTML, CSS, JavaScript, Flask, SQL, Git and GitHub, Microsoft Office, and Google Workspace",
    available: "open to freelance work, internships, remote gigs, AI training, data annotation, and entry-level tech roles",
    strengths: "quick learner, detail-oriented, self-motivated, good communicator, and a strong team collaborator",
    projects: [
      "Portfolio Website — a responsive personal portfolio with dark/light mode, AI chat widget, and a Formspree contact form, deployed on Vercel.",
      "Bead Artwork Ecommerce Website — a frontend ecommerce site showcasing Kenyan handcrafted beadwork with a product catalog and WhatsApp ordering.",
      "Lecture Management and Scheduling System — a university scheduling system concept with venue management and timetable clash detection using Python and database design.",
      "Student Funds Management System — a concept for tracking student pocket money and financial records tailored to Kenyan schools.",
    ],
  };

  if (matches(msg, ["hi", "hello", "hey", "good morning", "good afternoon", "howdy", "greetings"])) {
    return `Hi there! I am Chris's assistant. You can ask me anything about his skills, projects, background, or how to get in touch. What would you like to know?`;

  } else if (matches(msg, ["who is", "about chris", "tell me about", "introduce", "background", "yourself"])) {
    return `Chris is a ${info.role} based in ${info.location}. He is currently pursuing a ${info.education}. He is passionate about building clean, user-focused web applications and is ${info.available}.`;

  } else if (matches(msg, ["skill", "know", "tech", "stack", "tools", "proficient", "expertise", "technologies", "language"])) {
    return `Chris is proficient in ${info.skills}. He enjoys building full-stack web projects and is always picking up new tools quickly.`;

  } else if (matches(msg, ["project", "work", "built", "made", "ecommerce", "lecture", "fund", "portfolio"])) {
    return `Chris has worked on some great projects. He built a ${info.projects[0]} He also created a ${info.projects[1]} Additionally he designed a ${info.projects[2]}`;

  } else if (matches(msg, ["education", "university", "degree", "study", "egerton", "school", "college", "student"])) {
    return `Chris is currently studying for a ${info.education}. His coursework covers Programming, Software Engineering, Database Systems, Data Structures and Algorithms, and Web Development.`;

  } else if (matches(msg, ["contact", "reach", "email", "hire", "get in touch", "message", "connect"])) {
    return `You can reach Chris directly at ${info.email}. You can also use the Contact section on this page to send him a message and he will get back to you as soon as possible.`;

  } else if (matches(msg, ["available", "freelance", "internship", "remote", "job", "opportunity", "open to"])) {
    return `Yes! Chris is currently ${info.available}. If you have an opportunity that matches his skills, feel free to reach out via the contact form or email him at ${info.email}.`;

  } else if (matches(msg, ["github", "code", "repository", "repo"])) {
    return `You can check out Chris's code on GitHub at ${info.github}. He has several projects there including his portfolio and ecommerce website.`;

  } else if (matches(msg, ["location", "where", "country", "kenya", "nairobi", "based"])) {
    return `Chris is based in ${info.location}. He is fully comfortable with remote work and online collaboration.`;

  } else if (matches(msg, ["strength", "soft skill", "personality", "trait", "quality"])) {
    return `Chris's key strengths include being a ${info.strengths}. He adapts quickly to new tools and environments, which makes him effective in fast-moving tech environments.`;

  } else if (matches(msg, ["experience", "work history", "career", "professional"])) {
    return `Chris has been building personal web projects since 2022, working as a freelance developer. He uses modern workflows including Git version control, GitHub hosting, and Vercel deployment.`;

  } else if (matches(msg, ["language", "speak", "english", "swahili"])) {
    return `Chris is fluent in both English and Swahili, which helps him communicate effectively across different audiences.`;

  } else if (matches(msg, ["thank", "thanks", "appreciate", "great", "awesome", "nice", "cool"])) {
    return `You are welcome! Feel free to ask me anything else about Chris. I am happy to help!`;

  } else if (matches(msg, ["bye", "goodbye", "see you", "later"])) {
    return `Goodbye! Feel free to come back anytime if you have more questions about Chris. Have a great day!`;

  } else {
    return `I am only trained on Chris's professional background. You can ask me about his skills, projects, education, availability, or how to contact him. For anything else, feel free to reach out at ${info.email}.`;
  }
}

function matches(msg, keywords) {
  return keywords.some(k => msg.includes(k));
}

  // ── Knowledge base about Chris ──
  const info = {
    name:       "Chrisper Mwangi Wambui",
    role:       "Computer Science student and web developer",
    location:   "Nairobi, Kenya",
    email:      "chrispermwash@gmail.com",
    github:     "github.com/kris4509",
    portfolio:  "kris-portfolio-website.vercel.app",
    education:  "Bachelor of Science in Computer Science at Egerton University, Kenya (2023 – 2027)",
    skills:     "Python, HTML, CSS, JavaScript, Flask, SQL, Git and GitHub, Microsoft Office, and Google Workspace",
    languages:  "English and Swahili",
    available:  "open to freelance work, internships, remote gigs, AI training, data annotation, and entry-level tech roles",
    projects: [
      "Portfolio Website — a responsive personal portfolio with dark/light mode, AI chat widget, and a Formspree contact form, deployed on Vercel.",
      "Bead Artwork Ecommerce Website — a frontend ecommerce site showcasing Kenyan handcrafted beadwork with a product catalog and WhatsApp ordering.",
      "Lecture Management and Scheduling System — a university scheduling system concept with venue management and timetable clash detection using Python and database design.",
      "Student Funds Management System — a concept for tracking student pocket money and financial records tailored to Kenyan schools.",
    ],
    strengths:  "quick learner, detail-oriented, self-motivated, good communicator, and a strong team collaborator",
  };

  // ── Response logic ──
  let reply = "";

  if (matches(msg, ["hi", "hello", "hey", "good morning", "good afternoon", "howdy", "sup", "greetings"])) {
    reply = `Hi there! I am Chris's AI assistant. You can ask me anything about his skills, projects, background, or how to get in touch. What would you like to know?`;

  } else if (matches(msg, ["who is", "about chris", "tell me about", "introduce", "yourself", "background"])) {
    reply = `Chris is ${info.role} based in ${info.location}. He is currently pursuing a ${info.education}. He is passionate about building clean, user-focused web applications and is ${info.available}.`;

  } else if (matches(msg, ["skill", "know", "tech", "stack", "language", "tools", "proficient", "expertise", "technologies"])) {
    reply = `Chris is proficient in ${info.skills}. He enjoys building full-stack web projects and is always picking up new tools quickly.`;

  } else if (matches(msg, ["project", "work", "built", "made", "portfolio", "ecommerce", "booking", "lecture", "fund"])) {
    reply = `Chris has worked on some great projects. ${info.projects[0]} He also built a ${info.projects[1]} Additionally, he designed a ${info.projects[2]}`;

  } else if (matches(msg, ["education", "university", "degree", "study", "egerton", "school", "college", "student"])) {
    reply = `Chris is currently studying for a ${info.education}. His relevant coursework includes Programming, Software Engineering, Database Systems, Data Structures and Algorithms, and Web Development.`;

  } else if (matches(msg, ["contact", "reach", "email", "hire", "get in touch", "message", "connect"])) {
    reply = `You can reach Chris directly at ${info.email}. You can also use the Contact section on this page to send him a message and he will get back to you as soon as possible.`;

  } else if (matches(msg, ["available", "hire", "freelance", "internship", "remote", "job", "opportunity", "open to"])) {
    reply = `Yes! Chris is currently ${info.available}. If you have an opportunity that matches his skills, feel free to reach out via the contact form or email him at ${info.email}.`;

  } else if (matches(msg, ["github", "code", "repository", "repo", "open source"])) {
    reply = `You can check out Chris's code and repositories on GitHub at ${info.github}. He has several projects there including his portfolio and ecommerce website.`;

  } else if (matches(msg, ["location", "where", "country", "kenya", "nairobi", "nakuru", "based"])) {
    reply = `Chris is based in ${info.location}, Kenya. He is fully comfortable with remote work and online collaboration.`;

  } else if (matches(msg, ["strength", "soft skill", "personality", "trait", "quality"])) {
    reply = `Some of Chris's key strengths are that he is a ${info.strengths}. He adapts quickly to new tools and environments, which makes him effective in fast-moving tech environments.`;

  } else if (matches(msg, ["language", "speak", "english", "swahili"])) {
    reply = `Chris is fluent in both ${info.languages}, which helps him communicate effectively across different audiences.`;

  } else if (matches(msg, ["experience", "work history", "career", "professional"])) {
    reply = `Chris has been building and testing personal web projects since 2022, working as a freelance developer. He has adopted modern workflows including Git version control, GitHub hosting, and Vercel deployment. He is actively looking to grow his professional experience.`;

  } else if (matches(msg, ["thank", "thanks", "appreciate", "great", "awesome", "nice", "cool", "good"])) {
    reply = `You are welcome! Feel free to ask me anything else about Chris. I am happy to help!`;

  } else if (matches(msg, ["bye", "goodbye", "see you", "cya", "later"])) {
    reply = `Goodbye! Feel free to come back anytime if you have more questions about Chris. Have a great day!`;

  } else {
    reply = `That is a great question! I am only trained on Chris's professional background. You can ask me about his skills, projects, education, availability, or how to contact him. For anything else, feel free to reach out to him directly at ${info.email}.`;
  }

  return res.status(200).json({ reply });
}

function matches(msg, keywords) {
  return keywords.some(k => msg.includes(k));
}