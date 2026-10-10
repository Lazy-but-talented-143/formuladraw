import React from 'react';

interface Props {
  onEnterWorkspace: () => void;
}

const Landing: React.FC<Props> = ({ onEnterWorkspace }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      background: '#fafaf9', fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: 'auto'
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', position: 'sticky', top: 0, background: 'rgba(250,250,249,0.92)',
        backdropFilter: 'blur(12px)', zIndex: 100, borderBottom: '1px solid #e8e4e0'
      }}>
        <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.15em', color: '#111' }}>
          FORMULADRAW
        </span>
        <div style={{ display: 'flex', gap: '32px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: '#666' }}>
          <span style={{ cursor: 'pointer' }}>HOW IT WORKS</span>
          <span style={{ cursor: 'pointer' }}>MATHEMATICS</span>
        </div>
        <button
          onClick={onEnterWorkspace}
          style={{
            background: '#111', color: '#fff', border: 'none', padding: '10px 22px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer',
            borderRadius: '2px'
          }}
        >
          OPEN WORKSPACE →
        </button>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 40px 60px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', color: '#0066cc', marginBottom: '20px' }}>
              IMAGE → GEOMETRY → MATHEMATICS
            </p>
            <h1 style={{
              fontSize: '4.2rem', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em',
              color: '#111', margin: '0 0 28px'
            }}>
              TURN<br />IMAGES<br />INTO<br />MATHEMATICS.
            </h1>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.7, marginBottom: '40px', maxWidth: '380px' }}>
              FormulaDraw extracts geometry from any image, classifies every contour into mathematical models, and progressively reconstructs it — formula by formula.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={onEnterWorkspace}
                style={{
                  background: '#111', color: '#fff', border: 'none', padding: '14px 32px',
                  fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                START DRAWING →
              </button>
              <a href="#how-it-works" style={{
                padding: '14px 32px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em',
                color: '#111', textDecoration: 'none', border: '1px solid #ccc', borderRadius: '2px'
              }}>
                SEE HOW IT WORKS
              </a>
            </div>
          </div>

          {/* Mathematical SVG Visualization */}
          <div style={{ position: 'relative' }}>
            <div style={{
              border: '1px solid #e0dcd8', borderRadius: '4px', background: '#fff',
              overflow: 'hidden', aspectRatio: '4/3',
              boxShadow: '0 2px 24px rgba(0,0,0,0.06)'
            }}>
              <svg viewBox="0 0 800 600" style={{ width: '100%', height: '100%' }}>
                {/* Grid */}
                {Array.from({ length: 17 }).map((_, i) => (
                  <line key={`gv${i}`} x1={i * 50} y1={0} x2={i * 50} y2={600}
                    stroke="#f0ece8" strokeWidth={1} />
                ))}
                {Array.from({ length: 13 }).map((_, i) => (
                  <line key={`gh${i}`} x1={0} y1={i * 50} x2={800} y2={i * 50}
                    stroke="#f0ece8" strokeWidth={1} />
                ))}
                {/* Geometric shapes */}
                <circle cx="160" cy="170" r="75" fill="none" stroke="#0066cc" strokeWidth="2" opacity="0.7" />
                <circle cx="420" cy="120" r="45" fill="none" stroke="#0066cc" strokeWidth="2" opacity="0.7" />
                <circle cx="650" cy="200" r="90" fill="none" stroke="#0066cc" strokeWidth="2" opacity="0.7" />
                <line x1="60" y1="320" x2="320" y2="260" stroke="#111" strokeWidth="1.5" opacity="0.6" />
                <line x1="330" y1="265" x2="590" y2="310" stroke="#111" strokeWidth="1.5" opacity="0.6" />
                <path d="M 80,400 C 220,310 380,470 530,370" fill="none" stroke="#111" strokeWidth="1.5" opacity="0.6" />
                <path d="M 540,375 C 620,310 700,440 780,380" fill="none" stroke="#111" strokeWidth="1.5" opacity="0.6" />
                {/* Control points */}
                <circle cx="160" cy="170" r="4" fill="#0066cc" />
                <circle cx="420" cy="120" r="4" fill="#0066cc" />
                <circle cx="650" cy="200" r="4" fill="#0066cc" />
                <circle cx="220" cy="310" r="3.5" fill="#6644cc" />
                <circle cx="380" cy="470" r="3.5" fill="#6644cc" />
                <circle cx="620" cy="310" r="3.5" fill="#6644cc" />
                {/* Formula labels */}
                <text x="170" y="165" fontFamily="monospace" fontSize="10" fill="#0066cc" opacity="0.9">
                  (x-160)²+(y-170)²=75²
                </text>
                <text x="64" y="340" fontFamily="monospace" fontSize="10" fill="#444" opacity="0.9">
                  y = -0.23x + 333.8
                </text>
                <text x="90" y="418" fontFamily="monospace" fontSize="10" fill="#444" opacity="0.9">
                  B(t): Cubic Bézier
                </text>
              </svg>
            </div>
            {/* Floating formula badge */}
            <div style={{
              position: 'absolute', bottom: '-12px', right: '20px',
              background: '#111', color: '#fff', padding: '8px 16px',
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              borderRadius: '2px'
            }}>
              3 FORMULAS EXTRACTED
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{
        padding: '80px 40px', background: '#111', color: '#fff'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', color: '#888', marginBottom: '16px' }}>
            THE PROCESS
          </p>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '60px', lineHeight: 1 }}>
            FROM PIXELS<br />TO EQUATIONS.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            {[
              { n: '01', title: 'IMAGE', desc: 'Upload any image. SVG, PNG, JPG, or WebP.' },
              { n: '02', title: 'GEOMETRY', desc: 'Canny edge detection extracts pixel-perfect contours from the image.' },
              { n: '03', title: 'MATHEMATICS', desc: 'Each contour is classified and fitted to a LINE, CIRCLE, or BÉZIER model.' },
              { n: '04', title: 'RECONSTRUCTION', desc: 'Formulas progressively draw the image, step by step, in real time.' },
            ].map(({ n, title, desc }) => (
              <div key={n}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color: '#555', marginBottom: '16px' }}>
                  {n}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', marginBottom: '12px' }}>
                  {title}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#999', lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mathematical Shapes */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', color: '#0066cc', marginBottom: '16px' }}>
            EVERY SHAPE HAS A LANGUAGE
          </p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '48px', color: '#111' }}>
            MATHEMATICAL<br />MODELS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { name: 'LINE', formula: 'y = mx + b', color: '#111' },
              { name: 'CIRCLE', formula: '(x-h)² + (y-k)² = r²', color: '#0066cc' },
              { name: 'BÉZIER', formula: 'B(t) = Σ Cᵢ·Bᵢ,ₙ(t)', color: '#6644cc' },
              { name: 'ELLIPSE', formula: '(x-h)²/a² + (y-k)²/b² = 1', color: '#0066cc' },
              { name: 'PARAMETRIC', formula: 'x(t), y(t)', color: '#111' },
              { name: 'NUMERICAL', formula: 'Sampled path fallback', color: '#888' },
            ].map(({ name, formula, color }) => (
              <div key={name} style={{
                border: '1px solid #e8e4e0', padding: '24px', borderRadius: '4px', background: '#fff'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color, marginBottom: '12px' }}>
                  {name}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#111' }}>{formula}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', background: '#faf6f0', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#111', lineHeight: 0.95, marginBottom: '32px' }}>
            READY TO<br />SEE THE<br />FORMULA?
          </h2>
          <button
            onClick={onEnterWorkspace}
            style={{
              background: '#111', color: '#fff', border: 'none', padding: '18px 48px',
              fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            OPEN FORMULADRAW →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 40px', borderTop: '1px solid #e8e4e0', background: '#fff'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '0.1em', color: '#111', marginBottom: '8px' }}>
              FORMULADRAW
            </div>
            <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.15em' }}>
              IMAGE → GEOMETRY → MATHEMATICS
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#999' }}>© 2026 FORMULADRAW</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
