'use client';
import ErrorCard from './ErrorCard';
import CorrectionCard from './CorrectionCard';
import RuleCard from './RuleCard';

export default function ResultCards({ result }) {
  if (!result) return null;

  const hasAnyError = result.hasErrors ?? result.hasError ?? false;
  const errors = result.errors || [];

  return (
    <div className="flex flex-col gap-5 mt-6">
      <div className="card-animate card-animate-1">
        <ErrorCard result={result} />
      </div>

      {hasAnyError && (result.correctedSentence || result.correction) && (
        <div className="card-animate card-animate-2">
          <CorrectionCard
            correction={result.correction}
            correctedSentence={result.correctedSentence}
            errors={errors}
            originalSentence={result.originalSentence || result.input || ''}
          />
        </div>
      )}

      {hasAnyError && (errors.length > 0 || result.rule) && (
        <div className="card-animate card-animate-3">
          <RuleCard
            rule={result.rule}
            exercises={result.exercises || []}
            errors={errors}
            globalExplanation={result.globalExplanation}
          />
        </div>
      )}
    </div>
  );
}
