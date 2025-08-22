import React, { useMemo, useState } from "react";

// Bayes PPV calculator with three sliders: sensitivity, specificity, prevalence
// P(disease | +) = (sens * prev) / (sens * prev + (1 - spec) * (1 - prev))

export default function App() {
  const [sensitivityPct, setSensitivityPct] = useState(90);
  const [specificityPct, setSpecificityPct] = useState(95);
  const [prevalencePct, setPrevalencePct] = useState(5);

  const sensitivity = sensitivityPct / 100; // as 0..1
  const specificity = specificityPct / 100; // as 0..1
  const prevalence = prevalencePct / 100;   // as 0..1

  const ppv = useMemo(() => {
    const tp = sensitivity * prevalence;
    const fp = (1 - specificity) * (1 - prevalence);
    const denom = tp + fp;
    if (denom === 0) return NaN; // undefined case
    return tp / denom;
  }, [sensitivity, specificity, prevalence]);

  const fmtPct = (x) => (Number.isFinite(x) ? (x * 100).toFixed(2) + "%" : "n/a");

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">P(disease | positive) — PPV Calculator</h1>
          <p className="mt-2 text-sm text-slate-600">Adjust the sliders for <span className="font-medium">Sensitivity</span>, <span className="font-medium">Specificity</span>, and <span className="font-medium">Prevalence</span>. The result shows the <span className="font-medium">Positive Predictive Value</span> (PPV) = P(disease | +).</p>
        </header>

        <div className="grid gap-5">
          <Control
            label="Sensitivity (True Positive Rate)"
            value={sensitivityPct}
            onChange={setSensitivityPct}
          />
          <Control
            label="Specificity (True Negative Rate)"
            value={specificityPct}
            onChange={setSpecificityPct}
          />
          <Control
            label="Prevalence (Percent with disease)"
            value={prevalencePct}
            onChange={setPrevalencePct}
          />
        </div>

        <section className="mt-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Result</h2>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <div>
                <div className="text-sm text-slate-600">PPV = P(disease | +)</div>
                <div className="text-3xl md:text-4xl font-bold">{fmtPct(ppv)}</div>
              </div>
              <div className="grow" />
              <div className="text-xs md:text-sm text-slate-500">
                Formula: <code>(sens × prev) / (sens × prev + (1 − spec) × (1 − prev))</code>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <Info label="Sensitivity" value={`${sensitivityPct.toFixed(1)}%`} />
              <Info label="Specificity" value={`${specificityPct.toFixed(1)}%`} />
              <Info label="Prevalence" value={`${prevalencePct.toFixed(1)}%`} />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3">Example per 10,000 people (approx.)</h3>
            <ConfusionOutline
              sensitivity={sensitivity}
              specificity={specificity}
              prevalence={prevalence}
              population={10000}
            />
          </div>
        </section>

        <section className="mt-6 text-xs text-slate-500 leading-relaxed">
          <p>
            Notes: Sensitivity = P(+ | disease). Specificity = P(− | no disease). Prevalence = P(disease). PPV depends on prevalence: even highly accurate tests can have low PPV when the disease is rare.
          </p>
        </section>
      </div>
    </div>
  );
}

function Control({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm md:text-base font-medium">{label}</label>
        <input
          type="number"
          className="w-24 text-right border rounded-lg px-2 py-1 text-sm"
          min={0}
          max={100}
          step={0.1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-slate-900"
      />
      <div className="mt-1 text-xs text-slate-500">{value.toFixed(1)}%</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border p-3">
      <div className="text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function ConfusionOutline({
  sensitivity,
  specificity,
  prevalence,
  population = 10000,
}: {
  sensitivity: number;
  specificity: number;
  prevalence: number;
  population?: number;
}) {
  const diseased = Math.round(population * prevalence);
  const healthy = population - diseased;

  const TP = Math.round(diseased * sensitivity);
  const FN = diseased - TP;
  const TN = Math.round(healthy * specificity);
  const FP = healthy - TN;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
      <Block title="True Positives" value={TP} subtitle="Have disease & test +" />
      <Block title="False Positives" value={FP} subtitle="No disease but test +" />
      <Block title="True Negatives" value={TN} subtitle="No disease & test −" />
      <Block title="False Negatives" value={FN} subtitle="Have disease but test −" />
    </div>
  );
}

function Block({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="text-slate-500 text-xs">{subtitle}</div>
      <div className="mt-1 text-base font-medium">{title}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
