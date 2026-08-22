// ملف: api/generate-story.js
// هاد الملف لازم يكون بمجلد اسمه "api" بجذر مشروعك على Vercel
// مثال المسار الكامل: my-amiri-site/api/generate-story.js

export default async function handler(req, res) {
  // نسمح فقط بطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, age, gender, hobby1, hobby2, lang } = req.body;

  // تحقق بسيط إنو البيانات المطلوبة موجودة
  if (!name || !age || !hobby1 || !hobby2) {
    return res.status(400).json({ error: 'بيانات ناقصة' });
  }

  const isFemale = gender === 'female';
  const genderNoteAr = isFemale
    ? 'الطفلة أنثى — استخدم صيغة المؤنث في كل الأفعال والصفات المتعلقة بها (مثلاً: ذهبت، كانت شجاعة، وجدَت).'
    : 'الطفل ذكر — استخدم صيغة المذكر في كل الأفعال والصفات المتعلقة به (مثلاً: ذهب، كان شجاعًا، وجدَ).';
  const genderNoteHe = isFemale
    ? 'הילדה היא בת — השתמשו בלשון נקבה בכל הפעלים והתארים הקשורים אליה.'
    : 'הילד הוא בן — השתמשו בלשון זכר בכל הפעלים והתארים הקשורים אליו.';
  const genderNoteEn = isFemale ? 'Use "she/her" pronouns throughout.' : 'Use "he/him" pronouns throughout.';

  const prompts = {
    ar: `اكتب قصة أطفال قصيرة ودافئة باللغة العربية الفصحى المبسطة (تناسب طفل عمره ${age} سنوات)، بطلها طفل اسمه "${name}"، وتدور أحداثها حول مغامرة تجمع بين "${hobby1}" و "${hobby2}". ${genderNoteAr}
قسّم القصة إلى ١٥ صفحة متتالية، كل صفحة فيها جملة أو جملتين بس (قصيرة ومناسبة لعمر الطفل)، بحيث تكون هناك بداية ووسط ونهاية سعيدة، والطفل شجاع وذكي، وتحمل القصة رسالة إيجابية بسيطة بالنهاية.
لكل صفحة، اكتب أيضًا وصفًا قصيرًا بالإنجليزية للمشهد (scene) يُستخدم لاحقًا لتوليد رسمة كرتونية توضح الصفحة.
أعطني فقط بصيغة JSON بدون أي نص إضافي أو علامات markdown:
{"title": "عنوان القصة", "pages": [{"text": "نص الصفحة الأولى", "scene": "short English scene description"}, ...]}`,
    en: `Write a short, warm children's story in English (suitable for a ${age}-year-old), starring a child named "${name}", about an adventure combining "${hobby1}" and "${hobby2}". ${genderNoteEn}
Split the story into 15 sequential pages, each with just 1-2 short, age-appropriate sentences, with a clear beginning, middle, and happy ending, where the child is brave and clever, and the story carries a simple positive message at the end.
For each page, also write a short scene description used later to generate a matching cartoon illustration.
Reply ONLY in JSON with no extra text or markdown:
{"title": "story title", "pages": [{"text": "page one text", "scene": "short scene description"}, ...]}`,
    he: `כתבו סיפור ילדים קצר וחם בעברית (מתאים לילד בגיל ${age}), שגיבורו ילד בשם "${name}", על הרפתקה המשלבת "${hobby1}" ו-"${hobby2}". ${genderNoteHe}
חלקו את הסיפור ל-15 עמודים רצופים, כל עמוד עם משפט או שניים קצרים בלבד, עם התחלה, אמצע וסוף שמח ברור, כשהילד אמיץ וחכם, והסיפור נושא מסר חיובי פשוט בסוף.
לכל עמוד, כתבו גם תיאור קצר באנגלית של הסצנה לשימוש עתידי ביצירת איור מתאים.
ענו רק בפורמט JSON ללא טקסט נוסף או markdown:
{"title": "כותרת הסיפור", "pages": [{"text": "טקסט העמוד הראשון", "scene": "תיאור סצנה קצר"}, ...]}`
  };

  const selectedPrompt = prompts[lang] || prompts.ar;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // المفتاح مخبّى هون، آمن، ما حدا شايفه
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
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
