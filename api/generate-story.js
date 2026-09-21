// ملف: api/generate-story.js
// هاد الملف لازم يكون بمجلد اسمه "api" بجذر مشروعك على Vercel
// مثال المسار الكامل: my-amiri-site/api/generate-story.js

export const config = {
  maxDuration: 60, // نمهل الطلب لحد ٦٠ ثانية عشان يخلص توليد الـ ١٥ صفحة
};

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
    ar: `أنت كاتب قصص أطفال محترف ومشهور بأسلوبه الآسر. اكتب قصة أطفال باللغة العربية الفصحى السليمة (سهلة ومباشرة، بدون تعقيد لغوي، تناسب طفل عمره ${age} سنوات)، بطلها طفل اسمه "${name}"، وتدور أحداثها حول مغامرة تجمع بين "${hobby1}" و "${hobby2}". ${genderNoteAr}

قواعد الكتابة المهمة:
- استخدم جملًا قصيرة، إيقاعها موسيقي، سهلة القراءة بصوت عالٍ للطفل
- ابدأ كل صفحة بطريقة تخلق فضولًا يدفع الطفل لقلب الصفحة التالية (تشويق بسيط، سؤال ضمني، أو لحظة مفاجئة)
- استخدم تفاصيل حسية حية (ألوان، أصوات، إحساس) بدل الوصف العام
- خلّي ${name} يواجه لحظة خوف أو تردد بسيطة بمنتصف القصة، وبعدين يتغلب عليها بذكائه أو شجاعته — هاد يخلق تعلّق عاطفي حقيقي
- تجنب الكليشيهات والعبارات المكرورة، واكتب بأسلوب طازج ومختلف
- النهاية يجب أن تكون مُرضية عاطفيًا ومحمّلة برسالة إيجابية واضحة بس غير مباشرة (مش وعظ)

قسّم القصة إلى ١٥ صفحة متتالية، كل صفحة فيها جملة أو جملتين بس (قصيرة ومناسبة لعمر الطفل).
لكل صفحة، اكتب أيضًا وصفًا قصيرًا بالإنجليزية للمشهد (scene) يُستخدم لاحقًا لتوليد رسمة كرتونية توضح الصفحة.
أعطني فقط بصيغة JSON بدون أي نص إضافي أو علامات markdown:
{"title": "عنوان القصة", "pages": [{"text": "نص الصفحة الأولى", "scene": "short English scene description"}, ...]}`,
    en: `You are a professional, celebrated children's book author known for captivating young readers. Write a children's story in clear, natural English (suitable for a ${age}-year-old), starring a child named "${name}", about an adventure combining "${hobby1}" and "${hobby2}". ${genderNoteEn}

Writing rules:
- Use short, rhythmic sentences that read beautifully aloud
- Open each page with something that sparks curiosity and makes the child want to turn to the next page (light suspense, an implied question, or a small surprise)
- Use vivid sensory details (color, sound, feeling) instead of generic description
- Give ${name} a small moment of fear or hesitation around the middle of the story, then have them overcome it through cleverness or courage — this builds real emotional connection
- Avoid clichés and repeated phrasing; keep the voice fresh and distinctive
- The ending should feel emotionally satisfying and carry a clear but non-preachy positive message

Split the story into 15 sequential pages, each with just 1-2 short, age-appropriate sentences.
For each page, also write a short scene description used later to generate a matching cartoon illustration.
Reply ONLY in JSON with no extra text or markdown:
{"title": "story title", "pages": [{"text": "page one text", "scene": "short scene description"}, ...]}`,
    he: `אתם סופרי ילדים מקצועיים וידועים בסגנון כתיבה מרתק. כתבו סיפור ילדים בעברית תקנית וברורה (מתאים לילד בגיל ${age}), שגיבורו ילד בשם "${name}", על הרפתקה המשלבת "${hobby1}" ו-"${hobby2}". ${genderNoteHe}

כללי כתיבה חשובים:
- השתמשו במשפטים קצרים וקצביים, נעימים לקריאה בקול
- פתחו כל עמוד באופן שמעורר סקרנות ומניע את הילד להפוך לעמוד הבא (מתח קל, שאלה מרומזת, או הפתעה קטנה)
- השתמשו בפרטים חושיים חיים (צבע, קול, תחושה) במקום תיאור כללי
- תנו ל${name} רגע קטן של פחד או היסוס באמצע הסיפור, ואז שיתגבר עליו בעזרת חוכמה או אומץ — זה יוצר חיבור רגשי אמיתי
- הימנעו מקלישאות וניסוחים חוזרים, וכתבו בקול רענן וייחודי
- הסוף צריך להיות מספק רגשית ולשאת מסר חיובי ברור אך לא מטיף

חלקו את הסיפור ל-15 עמודים רצופים, כל עמוד עם משפט או שניים קצרים בלבד.
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
        max_tokens: 2500,
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
