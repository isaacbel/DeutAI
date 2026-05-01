const Joi = require('joi');
const pool = require('../config/db');
const { extractTextFromImage, analyzeText } = require('../services/claude.service');
const { createFlashcard } = require('../services/flashcard.service');

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ocrSchema = Joi.object({
  image: Joi.string().min(1).required(),
});

const notebookAnalyzeSchema = Joi.object({
  confirmedText: Joi.string().min(1).max(500).required(),
  unit_id: Joi.string().uuid().optional(),
});

async function ocr(req, res, next) {
  const { error, value } = ocrSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { image } = value;

  const sizeInBytes = Buffer.byteLength(image, 'base64');
  if (sizeInBytes > MAX_IMAGE_SIZE_BYTES) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: ["L'image ne doit pas dépasser 5 Mo"],
    });
  }

  try {
    const ocrResult = await extractTextFromImage(image);

    const response = {
      extractedText: ocrResult.extractedText,
      confidence: ocrResult.confidence,
    };

    if (ocrResult.confidence === 'low') {
      response.warning = 'Texte peu lisible — vérifie bien le texte avant de valider';
    }

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

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

    const insertResult = await pool.query(
      `INSERT INTO analyses
         (user_id, source, input_text, has_error, error_phrase, correction, rule, error_type, exercises_json, unit_id)
       VALUES ($1, 'notebook', $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        userId,
        confirmedText,
        analysisResult.hasError,
        analysisResult.errorPhrase || null,
        analysisResult.correction || null,
        analysisResult.rule || null,
        analysisResult.errorType,
        JSON.stringify(analysisResult.exercises),
        unit_id || null,
      ]
    );

    const analysisId = insertResult.rows[0].id;

    if (analysisResult.hasError && analysisResult.errorPhrase) {
      try {
        await createFlashcard(userId, analysisId, analysisResult, unit_id || null);
      } catch (flashcardErr) {
        console.error('[NotebookController] Flashcard non créée :', flashcardErr.message);
      }
    }

    return res.status(200).json({
      analysis_id: analysisId,
      hasError: analysisResult.hasError,
      errorPhrase: analysisResult.errorPhrase,
      correction: analysisResult.correction,
      rule: analysisResult.rule,
      errorType: analysisResult.errorType,
      exercises: analysisResult.exercises,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { ocr, notebookAnalyze };
