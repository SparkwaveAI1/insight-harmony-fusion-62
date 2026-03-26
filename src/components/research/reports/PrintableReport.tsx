import React from 'react';
import { SurveyReport } from './SurveyReportGenerator';

interface PrintableReportProps {
  report: SurveyReport;
  surveyName: string;
  surveyDescription?: string;
  questions: string[];
}

/**
 * PrintableReport — renders a clean, print-optimized version of a research report.
 * Opened in a new browser window and auto-triggered for print (Save as PDF).
 * No external dependencies — uses browser native print.
 */
export const PrintableReport: React.FC<PrintableReportProps> = ({
  report,
  surveyName,
  surveyDescription,
  questions,
}) => {
  const printDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sentimentLabel = (s: 'positive' | 'neutral' | 'negative') =>
    s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div
      style={{
        fontFamily: 'Georgia, "Times New Roman", Times, serif',
        color: '#111',
        maxWidth: '760px',
        margin: '0 auto',
        padding: '40px 32px',
        lineHeight: '1.6',
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '8px' }}>
          PersonaAI Research Report
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{surveyName}</h1>
        {surveyDescription && (
          <p style={{ fontSize: '14px', color: '#555', margin: '0 0 8px 0' }}>{surveyDescription}</p>
        )}
        <div style={{ fontSize: '12px', color: '#666' }}>Generated: {printDate}</div>
      </div>

      {/* Executive Summary */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '16px' }}>
          Executive Summary
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personas</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.executiveSummary.totalPersonas}</div>
          </div>
          <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.executiveSummary.completionRate}%</div>
          </div>
          <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sentiment</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {sentimentLabel(report.executiveSummary.overallSentiment)}
            </div>
          </div>
        </div>

        {report.executiveSummary.keyInsights.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Key Insights</h3>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              {report.executiveSummary.keyInsights.map((insight, i) => (
                <li key={i} style={{ marginBottom: '6px', fontSize: '14px' }}>
                  {insight}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Question Analyses */}
      {report.questionAnalyses.length > 0 && (
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '16px' }}>
            Question Analysis
          </h2>
          {report.questionAnalyses.map((analysis, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '28px',
                paddingBottom: '24px',
                borderBottom: idx < report.questionAnalyses.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>
                Q{analysis.questionIndex + 1}: {analysis.questionText}
              </h3>

              {analysis.themes.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#444', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Key Themes
                  </div>
                  <ul style={{ paddingLeft: '18px', margin: 0 }}>
                    {analysis.themes.map((theme, ti) => (
                      <li key={ti} style={{ fontSize: '13px', marginBottom: '4px' }}>{theme}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', fontSize: '13px', color: '#555' }}>
                <span>Engagement: <strong>{analysis.responseMetrics.engagementScore}%</strong></span>
                <span>Avg length: <strong>{analysis.responseMetrics.averageLength} chars</strong></span>
                <span>
                  Sentiment: <strong style={{ color: '#4ade80' }}>{analysis.sentimentDistribution.positive}% positive</strong>{' '}
                  / {analysis.sentimentDistribution.neutral}% neutral{' '}
                  / <strong style={{ color: '#f87171' }}>{analysis.sentimentDistribution.negative}% negative</strong>
                </span>
              </div>

              {analysis.notableQuotes.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Notable Responses
                  </div>
                  {analysis.notableQuotes.map((quote, qi) => (
                    <blockquote
                      key={qi}
                      style={{
                        borderLeft: '3px solid #d1d5db',
                        paddingLeft: '14px',
                        marginLeft: 0,
                        marginBottom: '10px',
                        color: '#333',
                        fontSize: '13px',
                        fontStyle: 'italic',
                      }}
                    >
                      "{quote.text}"
                      <footer style={{ fontStyle: 'normal', color: '#666', fontSize: '12px', marginTop: '4px' }}>
                        — {quote.personaName}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Persona Insights */}
      {report.personaInsights.length > 0 && (
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '16px' }}>
            Individual Persona Insights
          </h2>
          {report.personaInsights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '20px',
                padding: '14px 16px',
                background: '#f9f9f9',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{insight.personaName}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background:
                      insight.engagementLevel === 'high'
                        ? '#dcfce7'
                        : insight.engagementLevel === 'medium'
                        ? '#fef9c3'
                        : '#fee2e2',
                    color:
                      insight.engagementLevel === 'high'
                        ? '#166534'
                        : insight.engagementLevel === 'medium'
                        ? '#713f12'
                        : '#991b1b',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {insight.engagementLevel} engagement
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#444', margin: '0 0 8px 0' }}>{insight.responsesSummary}</p>
              {insight.keyCharacteristics.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {insight.keyCharacteristics.map((char, ci) => (
                    <span
                      key={ci}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: '#e5e7eb',
                        borderRadius: '12px',
                        color: '#374151',
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Cross-Persona Analysis */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '16px' }}>
          Cross-Persona Analysis
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Consensus Questions</h3>
            {report.crossPersonaComparison.consensusQuestions.length > 0 ? (
              <p style={{ fontSize: '13px', margin: 0 }}>
                Q{report.crossPersonaComparison.consensusQuestions.map((q) => q + 1).join(', Q')}
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No clear consensus identified</p>
            )}
          </div>
          <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Polarizing Questions</h3>
            {report.crossPersonaComparison.polarizingQuestions.length > 0 ? (
              <p style={{ fontSize: '13px', margin: 0 }}>
                Q{report.crossPersonaComparison.polarizingQuestions.map((q) => q + 1).join(', Q')}
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No significant polarization detected</p>
            )}
          </div>
        </div>

        {report.crossPersonaComparison.uniquePerspectives.length > 0 && (
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Unique Perspectives</h3>
            <ul style={{ paddingLeft: '18px', margin: 0 }}>
              {report.crossPersonaComparison.uniquePerspectives.map((p, pi) => (
                <li key={pi} style={{ fontSize: '13px', marginBottom: '4px' }}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #ddd',
          paddingTop: '16px',
          fontSize: '11px',
          color: '#999',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>PersonaAI — personaresearch.ai</span>
        <span>Confidential Research Report</span>
        <span>{printDate}</span>
      </div>
    </div>
  );
};

/**
 * Opens the report in a new window and triggers print (Save as PDF).
 */
export function printReport(
  report: SurveyReport,
  surveyName: string,
  surveyDescription: string | undefined,
  questions: string[]
): void {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow popups to download the PDF report.');
    return;
  }

  // We need React to render into the new window.
  // Simplest cross-browser approach: build HTML string directly.
  const printDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sentimentLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const questionRows = report.questionAnalyses
    .map(
      (analysis) => `
      <div class="question-block">
        <h3 class="question-title">Q${analysis.questionIndex + 1}: ${escapeHtml(analysis.questionText)}</h3>
        ${
          analysis.themes.length > 0
            ? `<div class="label">Key Themes</div><ul>${analysis.themes.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
            : ''
        }
        <div class="metrics">
          Engagement: <strong>${analysis.responseMetrics.engagementScore}%</strong> &nbsp;|&nbsp;
          Avg length: <strong>${analysis.responseMetrics.averageLength} chars</strong> &nbsp;|&nbsp;
          Sentiment: <strong class="pos">${analysis.sentimentDistribution.positive}% pos</strong> /
          ${analysis.sentimentDistribution.neutral}% neutral /
          <strong class="neg">${analysis.sentimentDistribution.negative}% neg</strong>
        </div>
        ${
          analysis.notableQuotes.length > 0
            ? `<div class="label">Notable Responses</div>${analysis.notableQuotes
                .map(
                  (q) =>
                    `<blockquote>"${escapeHtml(q.text)}"<footer>— ${escapeHtml(q.personaName)}</footer></blockquote>`
                )
                .join('')}`
            : ''
        }
      </div>`
    )
    .join('');

  const personaRows = report.personaInsights
    .map(
      (insight) => `
      <div class="persona-card">
        <div class="persona-header">
          <span class="persona-name">${escapeHtml(insight.personaName)}</span>
          <span class="badge badge-${insight.engagementLevel}">${insight.engagementLevel} engagement</span>
        </div>
        <p>${escapeHtml(insight.responsesSummary)}</p>
        <div class="tags">${insight.keyCharacteristics.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join('')}</div>
      </div>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Research Report: ${escapeHtml(surveyName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #111;
      max-width: 780px;
      margin: 0 auto;
      padding: 40px 32px;
      line-height: 1.65;
      font-size: 14px;
    }
    h1 { font-size: 26px; margin-bottom: 8px; }
    h2 { font-size: 17px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 32px 0 16px; }
    h3 { font-size: 14px; margin-bottom: 8px; }
    p { margin-bottom: 10px; }
    ul, ol { padding-left: 20px; margin-bottom: 10px; }
    li { margin-bottom: 4px; }
    .report-header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 32px; }
    .report-meta { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 8px; }
    .report-desc { font-size: 13px; color: #555; margin-top: 6px; }
    .report-date { font-size: 12px; color: #666; margin-top: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
    .stat-card { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px; }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .stat-value { font-size: 22px; font-weight: bold; }
    .label { font-size: 11px; font-weight: bold; color: #444; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 6px; }
    .question-block { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .question-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
    .metrics { font-size: 12px; color: #555; margin-bottom: 10px; }
    .pos { color: #16a34a; }
    .neg { color: #dc2626; }
    blockquote { border-left: 3px solid #d1d5db; padding-left: 14px; margin: 0 0 10px 0; font-style: italic; color: #333; }
    blockquote footer { font-style: normal; color: #666; font-size: 12px; margin-top: 4px; }
    .persona-card { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 6px; padding: 14px; margin-bottom: 14px; }
    .persona-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .persona-name { font-weight: bold; font-size: 14px; }
    .badge { font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase; }
    .badge-high { background: #dcfce7; color: #166534; }
    .badge-medium { background: #fef9c3; color: #713f12; }
    .badge-low { background: #fee2e2; color: #991b1b; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .tag { font-size: 11px; padding: 2px 8px; background: #e5e7eb; border-radius: 12px; color: #374151; }
    .cross-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
    .cross-card { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px; }
    .cross-card h3 { font-size: 12px; font-weight: bold; margin-bottom: 6px; }
    .report-footer { border-top: 1px solid #ddd; padding-top: 14px; font-size: 11px; color: #999; display: flex; justify-content: space-between; margin-top: 32px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
      @page { margin: 1in; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#1e40af;color:#fff;padding:10px 16px;margin-bottom:24px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-family:sans-serif;font-size:13px;">Ready to save as PDF — press <strong>Ctrl+P</strong> (or Cmd+P on Mac) and select "Save as PDF"</span>
    <button onclick="window.print()" style="background:#fff;color:#1e40af;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:12px;">Print / Save as PDF</button>
  </div>

  <div class="report-header">
    <div class="report-meta">PersonaAI Research Report</div>
    <h1>${escapeHtml(surveyName)}</h1>
    ${surveyDescription ? `<div class="report-desc">${escapeHtml(surveyDescription)}</div>` : ''}
    <div class="report-date">Generated: ${printDate}</div>
  </div>

  <h2>Executive Summary</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Personas</div>
      <div class="stat-value">${report.executiveSummary.totalPersonas}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Completion</div>
      <div class="stat-value">${report.executiveSummary.completionRate}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sentiment</div>
      <div class="stat-value">${sentimentLabel(report.executiveSummary.overallSentiment)}</div>
    </div>
  </div>
  ${
    report.executiveSummary.keyInsights.length > 0
      ? `<div class="label">Key Insights</div><ol>${report.executiveSummary.keyInsights.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ol>`
      : ''
  }

  <h2>Question Analysis</h2>
  ${questionRows || '<p style="color:#888">No question data available.</p>'}

  <h2>Individual Persona Insights</h2>
  ${personaRows || '<p style="color:#888">No persona insight data available.</p>'}

  <h2>Cross-Persona Analysis</h2>
  <div class="cross-grid">
    <div class="cross-card">
      <h3>Consensus Questions</h3>
      ${
        report.crossPersonaComparison.consensusQuestions.length > 0
          ? `<p>Q${report.crossPersonaComparison.consensusQuestions.map((q) => q + 1).join(', Q')}</p>`
          : '<p style="color:#888">No clear consensus identified</p>'
      }
    </div>
    <div class="cross-card">
      <h3>Polarizing Questions</h3>
      ${
        report.crossPersonaComparison.polarizingQuestions.length > 0
          ? `<p>Q${report.crossPersonaComparison.polarizingQuestions.map((q) => q + 1).join(', Q')}</p>`
          : '<p style="color:#888">No significant polarization detected</p>'
      }
    </div>
  </div>
  ${
    report.crossPersonaComparison.uniquePerspectives.length > 0
      ? `<div class="label">Unique Perspectives</div><ul>${report.crossPersonaComparison.uniquePerspectives.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
      : ''
  }

  <div class="report-footer">
    <span>PersonaAI — personaresearch.ai</span>
    <span>Confidential Research Report</span>
    <span>${printDate}</span>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
