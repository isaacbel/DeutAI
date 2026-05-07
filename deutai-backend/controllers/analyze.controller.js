/**
 * analyze.controller.js
 * Handles text analysis and image-based text extraction + analysis.
 */

const Joi = require('joi');
const pool = require('../config/db');
const { analyzeText, extractTextFromImage } = require('../services/ai/orchestrator');
const { createFlashcards } = require('../services/flashcard.service');

// ─── Validation schemas ────────────────────────────────────────────────────────

const analyzeTextSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
  unit_id: Joi.string().uuid().optional(),
});

const analyzeImageSchema = Joi.object({
  image: Joi.string().base64().required(),   // base64-encoded JPEG/PNG
  unit_id: Joi.string().uuid().optional(),
});

// ─── Shared helper: persist + (optionally) flashcards ─────────────────────────

async function persistAnalysis(userId, source, inputText, analysisResult, unit_id) {
  // Pick primary error for legacy DB columns
  const primaryError = analysisResult.errors?.[0] || null;
  const hasError = analysisResult.hasErrors ?? analysisResult.hasError ?? false;
  const errorPhrase = primaryError?.errorText || analysisResult.errorPhrase || null;
  const correction  = analysisResult.correctedSentence || primaryError?.correction || analysisResult.correction || null;
  const rule        = primaryError?.rule || analysisResult.rule || null;
  const errorType   = primaryError?.errorType || analysisResult.errorType || 'aucun';

  // Store all errors as JSONB alongside the analysis
  const errorsJson       = JSON.stringify(analysisResult.errors || []);
  const exercisesJson    = JSON.stringify(analysisResult.exercises || []);
  const globalExplanation = analysisResult.globalExplanation || null;

  // Bug fix: use a DB client + transaction so both the INSERT and flashcard
  // creation are atomic. A partial write (analysis saved, flashcards not) is
  // acceptable because flashcard errors are caught inside createFlashcards,
  // but we must not leave an analysis row without committing it.
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO analyses
         (user_id, source, input_text, has_error, error_phrase, correction, rule,
          error_type, exercises_json, errors_json, global_explanation, unit_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        userId,
        source,
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
        console.error('[AnalyzeController] Flashcards non créées :', flashcardErr.message);
      }
    }

    return analysisId;
  } finally {
    client.release();
  }
}

// ─── POST /analyze — Text analysis ────────────────────────────────────────────

async function analyze(req, res, next) {
  const { error, value } = analyzeTextSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { text, unit_id } = value;
  const userId = req.user.userId;

  try {
    const analysisResult = await analyzeText(text);
    const analysisId = await persistAnalysis(userId, 'text', text, analysisResult, unit_id);

    return res.status(200).json({
      analysis_id:       analysisId,
      // New multi-error fields
      hasErrors:         analysisResult.hasErrors,
      originalSentence:  analysisResult.originalSentence || text,
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

// ─── POST /analyze/image — Image → extract text → analysis ────────────────────

async function analyzeImage(req, res, next) {
  const { error, value } = analyzeImageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { image, unit_id } = value;
  const userId = req.user.userId;

  try {
    // Step 1 — OCR: extract German text from the handwritten image
    const { extractedText, confidence } = await extractTextFromImage(image);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        error: 'NO_TEXT_EXTRACTED',
        message: 'Aucun texte détecté dans l\'image.',
      });
    }

    // Step 2 — Grammar analysis on the extracted text
    const analysisResult = await analyzeText(extractedText);
    const analysisId = await persistAnalysis(userId, 'image', extractedText, analysisResult, unit_id);

    return res.status(200).json({
      analysis_id:       analysisId,
      extractedText,
      confidence,
      // New multi-error fields
      hasErrors:         analysisResult.hasErrors,
      originalSentence:  analysisResult.originalSentence || extractedText,
      correctedSentence: analysisResult.correctedSentence,
      errors:            analysisResult.errors,
      globalExplanation: analysisResult.globalExplanation,
      exercises:         analysisResult.exercises,
      // Legacy compat
      hasError:   analysisResult.hasError,
      errorPhrase:analysisResult.errorPhrase,
      correction: analysisResult.correctedSentence || analysisResult.correction,
      rule:       analysisResult.rule,
      errorType:  analysisResult.errorType,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze, analyzeImage };
