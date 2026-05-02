import { CaseStudyData } from '../../case-studies/case-studies';

export default function CaseStudyBrief({ study }: { study: CaseStudyData }) {
  if (!study.brief) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
      <div className="bg-surface border border-border p-6 rounded-xl">
        <h3 className="font-outfit font-medium text-lg text-accent1-dark mb-4">
          The Challenge
        </h3>
        <p className="text-c-text leading-relaxed">{study.brief.challenge}</p>
      </div>
      <div className="bg-surface border border-border p-6 rounded-xl">
        <h3 className="font-outfit font-medium text-lg text-accent1-dark mb-4">
          The Solution
        </h3>
        <p className="text-c-text leading-relaxed">{study.brief.solution}</p>
      </div>
      <div className="bg-surface border border-border p-6 rounded-xl">
        <h3 className="font-outfit font-medium text-lg text-accent1-dark mb-4">
          The Impact
        </h3>
        <p className="text-c-text leading-relaxed">{study.brief.impact}</p>
      </div>
    </div>
  );
}
