const Joi = require('joi');
const pool = require('../config/db');
const { extractTextFromImage, analyzeText } = require('../services/ai/orchestrator');
const { createFlashcards } = require('../services/flashcard.service');

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ocrSchema = Joi.object({
  image: Joi.string().min(1).required(),
});

const notebookAnalyzeSchema = Joi.object({
  confirmedText: Joi.string().min(1).max(1000).required(),
  unit_id: Joi.string().uuid().optional(),
});

// ─── Shared helper — identical to analyze.controller.js persistAnalysis ────────

async function persistNotebookAnalysis(userId, inputText, analysisResult, unit_id) {
  const primaryError = analysisResult.errors?.[0] || null;
  const hasError     = analysisResult.hasErrors ?? analysisResult.hasError ?? false;
  const errorPhrase  = primaryError?.errorText || analysisResult.errorPhrase || null;
  const correction   = analysisResult.correctedSentence || primaryError?.correction || analysisResult.correction || null;
  const rule         = primaryError?.rule || analysisResult.rule || null;
  // Clamp errorType to values accepted by the DB CHECK constraint
  const ALL_ERROR_TYPES = [
    'auxiliaire', 'déclinaison', 'conjugaison', 'genre', 'ordre', 'autre', 'aucun',
  ];
  const rawType  = primaryError?.errorType || analysisResult.errorType || 'aucun';
  const errorType = ALL_ERROR_TYPES.includes(rawType) ? rawType : 'autre';

  const errorsJson        = JSON.stringify(analysisResult.errors || []);
  const exercisesJson     = JSON.stringify(analysisResult.exercises || []);
  const globalExplanation = analysisResult.globalExplanation || null;

  const { rows } = await pool.query(
    `INSERT INTO analyses
       (user_id, source, input_text, has_error, error_phrase, correction, rule,
        error_type, exercises_json, errors_json, global_explanation, unit_id)
     VALUES ($1, 'notebook', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      userId,
      inputText,
      hasError,
      errorPhrase,
      correction,
      rule,
      errorType,
      exercisesJson,
      errorsJson,
      globalExplanation,
      unit_id || null,
    ]
  );

  const analysisId = rows[0].id;

  if (hasError) {
    try {
      await createFlashcards(userId, analysisId, analysisResult, unit_id || null);
    } catch (flashcardErr) {
      console.error('[NotebookController] Flashcards non créées pour analysis_id=%s : %s', analysisId, flashcardErr.message);
    }
  }

  return analysisId;
}

// ─── POST /notebook/ocr ────────────────────────────────────────────────────────

async function ocr(req, res, next) {
  const { error, value } = ocrSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { image } = value;

  let sizeInBytes;
  try {
    sizeInBytes = Buffer.byteLength(image, 'base64');
  } catch {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: ["L'image fournie n'est pas un base64 valide"],
    });
  }

  if (sizeInBytes > MAX_IMAGE_SIZE_BYTES) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: ["L'image ne doit pas dépasser 5 Mo"],
    });
  }

  try {
    const ocrResult = await extractTextFromImage(image);

    if (!ocrResult || typeof ocrResult.extractedText !== 'string') {
      return res.status(502).json({
        error: 'SERVICE_ERROR',
        message: "Le service OCR a retourné une réponse invalide",
      });
    }

    const response = {
      extractedText: ocrResult.extractedText,
      confidence: ocrResult.confidence || 'medium',
    };

    if (ocrResult.confidence === 'low') {
      response.warning = 'Texte peu lisible — vérifie bien le texte avant de valider';
    }

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

// ─── POST /notebook/analyze ────────────────────────────────────────────────────

async function notebookAnalyze(req, res, next) {
  const { error, value } = notebookAnalyzeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { confirmedText, unit_id } = value;
  const userId = req.user.userId;

  try {
    const analysisResult = await analyzeText(confirmedText);

    if (!analysisResult || typeof analysisResult.hasErrors === 'undefined' && typeof analysisResult.hasError === 'undefined') {
      return res.status(502).json({
        error: 'SERVICE_ERROR',
        message: "Le service d'analyse a retourné une réponse invalide",
      });
    }

    const analysisId = await persistNotebookAnalysis(userId, confirmedText, analysisResult, unit_id);

    // Return the exact same shape as analyze.controller.js so ResultCards works identically
    return res.status(200).json({
      analysis_id:       analysisId,
      // Multi-error fields (used by ResultCards)
      hasErrors:         analysisResult.hasErrors,
      originalSentence:  analysisResult.originalSentence || confirmedText,
      correctedSentence: analysisResult.correctedSentence,
      errors:            analysisResult.errors,
      globalExplanation: analysisResult.globalExplanation,
      exercises:         analysisResult.exercises,
      // Legacy compat
      hasError:    analysisResult.hasError,
      errorPhrase: analysisResult.errorPhrase,
      correction:  analysisResult.correctedSentence || analysisResult.correction,
      rule:        analysisResult.rule,
      errorType:   analysisResult.errorType,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { ocr, notebookAnalyze };
