import express from 'express';

const router = express.Router();

router.post('/suggestions', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { income, score, loanType } = req.body;

  const modelsToTry = ["gemini-3-flash-preview", "gemini-1.5-flash-latest"];

  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const body = {
        contents: [{
          parts: [{ 
            text: `Act as a financial advisor for LoanHook. User is in North Carolina.
                   Income: $${income}, Credit Score: ${score}, Type: ${loanType}.
                   
                   Provide 3 loan options. For each, include a real lender URL (e.g., nccfcu.org, ncsecu.org, navyfederal.org).
                   Return ONLY a JSON array: [{"title": "Name", "rate": "X%", "term": "Y mo", "reason": "text", "link": "https://..."}]` 
          }]
        }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!data.error && data.candidates) {
        const rawText = data.candidates[0].content.parts[0].text;
        const cleanJson = rawText.replace(/```json|```/g, "").trim();
        return res.json(JSON.parse(cleanJson));
      }
    } catch (err) { continue; }
  }

  // MOCK FALLBACK WITH LINKS (In case API acts up)
  console.log("🛠️ Using link-enabled mock data.");
  return res.json([
    { 
      "title": "NC Community Credit Union", 
      "rate": "5.39%", 
      "term": "60 mo", 
      "reason": "Local NC lender with great rates for students.", 
      "link": "https://www.nccfcu.org/personal-banking/loans/auto-loan/" 
    },
    { 
      "title": "SECU North Carolina", 
      "rate": "5.50%", 
      "term": "72 mo", 
      "reason": "Flexible terms specifically for NC state employees and residents.", 
      "link": "https://www.ncsecu.org/loans/auto-loans" 
    },
    { 
      "title": "Navy Federal Credit Union", 
      "rate": "4.29%", 
      "term": "36 mo", 
      "reason": "Best-in-class rates if you or a family member has a military connection.", 
      "link": "https://www.navyfederal.org/loans-cards/auto-loans.html" 
    }
  ]);
});

export default router;