// ملف: api/generate-story.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, age, hobby1, hobby2, lang } = req.body;

  if (!name || !age || !hobby1 || !hobby2) {
    return res.status(400).json({ error: 'بيانات ناقصة' });
  }

  const prompts = {
    ar: `اكتب قصة أطفال قصيرة ودافئة باللغة العربية الفصحى المبسطة (تناسب طفل عمره ${age} سنوات)، بطلها طفل اسمه "${name}"، وتدور أحداثها حول مغامرة تجمع بين "${hobby1}" و "${hobby2}". يجب أن تكون بين 150-220 كلمة، وفيها بداية ووسط ونهاية سعيدة، والطفل شجاع وذكي، وتحمل رسالة إيجابية بسيطة بالنهاية.
أعطني فقط بصيغة JSON بدون أي نص إضافي أو علامات markdown: {"title": "عنوان القصة", "story": "نص القصة كاملاً"}`,
    en: `Write a short, warm children's story in English (suitable for a ${age}-year-old), starring a child named "${name}", about an adventure combining "${hobby1}" and "${hobby2}". It should be 150-220 words, with a beginning, middle, and happy ending, and the child should be brave and clever, with a simple positive message at the end.
Reply ONLY in JSON with no extra text or markdown: {"title": "story title", "story": "the full story text"}`,
    he: `כתבו סיפור ילדים קצר וחם בעברית (מתאים לילד בגיל ${age}), שגיבורו ילד בשם "${name}", על הרפתקה המשלבת "${hobby1}" ו-"${hobby2}". הסיפור צריך להיות בין 150-220 מילים, עם התחלה, אמצע וסוף שמח, והילד אמור להיות אמיץ וחכם, עם מסר חיובי פשוט בסוף.
ענו רק בפורמט JSON ללא טקסט נוסף או markdown: {"title": "כותרת הסיפור", "story": "טקסט הסיפור המלא"}`
  };

  const selectedPrompt = prompts[lang] || prompts.ar;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: selectedPrompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: 'خطأ من الذكاء الاصطناعي: ' + (data.error?.message || JSON.stringify(data)) });
    }

    const raw = data.content.map(block => block.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Story generation error:', error);
    return res.status(500).json({ error: 'خطأ تقني: ' + error.message });
  }
}

