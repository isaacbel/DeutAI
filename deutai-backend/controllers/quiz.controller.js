const OpenAI = require('openai');

const ALLOWED_CATEGORIES = new Set([
  'vocabulaire',
  'grammaire',
  'conjugaison',
  'orthographe',
  'comprehension',
  'traduction',
]);

const DIFFICULTY_POINTS = { easy: 1, medium: 2, hard: 3 };

// Bug fix: instantiate the client once at module load (lazy singleton) rather
// than creating a new HTTPS agent on every request, which leaks sockets.
let _openaiClient = null;
function getOpenRouterClient(apiKey) {
  if (!_openaiClient) {
    _openaiClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    });
  }
  return _openaiClient;
}

function buildSystemPrompt(lang) {
  const isAr = lang === 'ar';
  const isDe = lang === 'de';
  const uiLanguage = isAr ? 'arabe' : isDe ? 'allemand' : 'français';

  return `Tu es un expert en didactique de l'allemand (langue cible : allemand). Tu génères des questions de quiz au format JSON strict.

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT avec un tableau JSON valide. Aucun texte avant ou après. Aucun markdown. Aucun \`\`\`.
- L'interface de l'utilisateur est en ${uiLanguage}. L'énoncé de la question ("question") et l'explication ("explanation") DOIVENT être en ${uiLanguage} ! Le contenu à tester (les options ou la réponse attendue) reste en allemand si pertinent.
- Chaque élément du tableau est un objet avec exactement ces clés :
  - "id" : chaîne unique (ex: "q1", "q2", …)
  - "type" : l'un de "multiple_choice" | "true_false" | "fill_blank" | "translation"
  - "question" : énoncé en ${uiLanguage} ou bilingue court ; l'allemand demandé doit être correct pédagogiquement
  - "options" : tableau de 4 chaînes UNIQUEMENT si type === "multiple_choice", sinon omets la clé ou mets null
  - "correctAnswer" : chaîne — la bonne réponse exacte attendue. (Pour true_false, utilise exactement "true" ou "false").
  - "explanation" : brève explication en ${uiLanguage} (1–3 phrases)
  - "points" : nombre entier (sera validé côté serveur selon la difficulté)

TYPES DE QUESTIONS :
- multiple_choice : exactement 4 options, une seule correcte. Les options peuvent être en allemand.
- true_false : correctAnswer doit être exactement "true" ou "false" (l'énoncé est une affirmation sur l'allemand).
- fill_blank : question avec un trou (___) ou consigne claire ; correctAnswer est la forme allemande attendue (un mot ou courte phrase)
- translation : consigne pour traduire une phrase ou un segment vers l'allemand (ou depuis l'allemand) ; correctAnswer est la traduction modèle attendue

RÉPARTITION SELON LA CATÉGORIE (approximatif, mélange intelligent) :
- vocabulaire : surtout multiple_choice, quelques true_false
- grammaire : mélange multiple_choice, true_false, fill_blank
- conjugaison : surtout fill_blank, quelques multiple_choice
- orthographe : fill_blank et multiple_choice
- comprehension : multiple_choice et true_false (texte court dans l'énoncé si besoin)
- traduction : surtout translation, quelques fill_blank

NIVEAU DE DIFFICULTÉ :
- easy : A1–A2, formulations simples
- medium : B1, nuances modérées
- hard : B2+, pièges fréquents, structures complexes

Les explications doivent être pédagogiques et en ${uiLanguage}.`;
}

function buildUserPrompt(category, difficulty, count, pointsPerQuestion) {
  return `Génère exactement ${count} questions pour le quiz suivant :
- catégorie (slug) : "${category}"
- difficulté : "${difficulty}"
- chaque question doit avoir "points" égal à ${pointsPerQuestion}

Vérifie que le JSON est parsable et que tous les types demandés apparaissent au moins une fois si ${count} >= 4 (mélange varié).`;
}

function extractJsonArray(text) {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON array found in model output');
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function normalizeQuestions(arr, pointsPerQuestion) {
  if (!Array.isArray(arr)) throw new Error('Response is not an array');

  return arr.map((q, i) => {
    const id = typeof q.id === 'string' && q.id ? q.id : `q${i + 1}`;
    const type = q.type;
    if (!['multiple_choice', 'true_false', 'fill_blank', 'translation'].includes(type)) {
      throw new Error(`Invalid question type: ${type}`);
    }
    const question = String(q.question ?? '');
    const correctAnswer = String(q.correctAnswer ?? '');
    const explanation = String(q.explanation ?? '');
    let options = q.options;
    if (type === 'multiple_choice') {
      if (!Array.isArray(options) || options.length !== 4) {
        throw new Error('multiple_choice must have exactly 4 options');
      }
      options = options.map((o) => String(o));
    } else {
      options = undefined;
    }
    return {
      id,
      type,
      question,
      options,
      correctAnswer,
      explanation,
      points: pointsPerQuestion,
    };
  });
}

exports.generateQuiz = async (req, res) => {
  // NOTE: this route must be protected by auth middleware in quiz.routes.js
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'CONFIG', message: 'Clé API OpenRouter non configurée dans le backend.' });
    }

    const { category: rawCategory = '', difficulty: rawDifficulty = 'medium', count: rawCount = 10, lang = 'fr' } = req.body;
    const category = String(rawCategory).toLowerCase().trim();
    const difficulty = String(rawDifficulty).toLowerCase().trim();
    const count = Math.min(20, Math.max(1, parseInt(rawCount, 10) || 10));

    if (!ALLOWED_CATEGORIES.has(category)) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Catégorie invalide.' });
    }
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Difficulté invalide.' });
    }

    const pointsPerQuestion = DIFFICULTY_POINTS[difficulty];

    // Bug fix: use singleton client instead of creating a new one per request
    const openai = getOpenRouterClient(apiKey);

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(lang) },
        { role: 'user', content: buildUserPrompt(category, difficulty, count, pointsPerQuestion) },
      ],
      temperature: 0.2,
    });

    const textContent = completion.choices?.[0]?.message?.content;

    if (!textContent) {
      return res.status(502).json({ error: 'MODEL', message: 'Réponse modèle vide.' });
    }

    const parsed = extractJsonArray(textContent);

    // Bug fix: under-generation is common with LLMs — warn and proceed
    // rather than refusing the whole response.
    if (parsed.length < count) {
      console.warn(`[quiz/generate] Model returned ${parsed.length}/${count} questions.`);
    }
    if (parsed.length > count) {
      parsed.splice(count);
    }

    const questions = normalizeQuestions(parsed, pointsPerQuestion);

    return res.json({ questions, category, difficulty, count: questions.length });
  } catch (err) {
    console.error('[quiz/generate]', err);
    return res.status(502).json({
      error: 'GENERATION_FAILED',
      message: err.message || 'Échec de la génération du quiz.',
    });
  }
};
