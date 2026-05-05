import { CaseStudyData } from '../../case-studies/case-studies';
import CaseStudyChartBlock from './CaseStudyChartBlock';

export default function CaseStudyStory({ study }: { study: CaseStudyData }) {
  if (!study.story) return null;

  return (
    <>
      {study.story.map((block, idx) => {
        switch (block.type) {
          case 'text':
            return (
              <div key={idx}>
                {block.heading && <h2>{block.heading}</h2>}
                <p className="whitespace-pre-wrap">{block.content}</p>
              </div>
            );
          case 'stats':
            return (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10 not-prose"
              >
                {block.stats.map((stat, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-bg-alt border border-border p-6 rounded-xl text-center shadow-sm hover:border-accent1-dark transition-colors"
                  >
                    <div className="text-4xl font-bold text-accent1-dark mb-2 font-editorial">
                      {stat.value}
                    </div>
                    <div className="text-sm text-c-muted uppercase tracking-widest font-semibold">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            );
          case 'chart':
            return (
              <CaseStudyChartBlock
                key={idx}
                title={block.title}
                data={block.data}
                unit={block.unit}
                lowerIsBetter={block.lowerIsBetter}
              />
            );
          case 'quote':
            return (
              <blockquote key={idx}>
                <p>
                  {'"'}
                  {block.text}
                  {'"'}
                </p>
                {block.author && <cite>&mdash; {block.author}</cite>}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
