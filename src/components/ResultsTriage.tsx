import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  HeartPulse,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LabMarker, AnalysisResult, MarkerAnalysis } from '@/types';
import { inferCategory, CATEGORY_ORDER, MarkerCategory } from '@/utils/markerCategories';

interface Props {
  extractedValues: LabMarker[];
  insights: AnalysisResult;
}

interface MergedMarker {
  name: string;
  value: number;
  unit: string;
  reference_range?: string;
  status: 'high' | 'low' | 'normal';
  category: MarkerCategory;
  analysis?: MarkerAnalysis;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildMerged(raw: LabMarker[], analyses: MarkerAnalysis[]): MergedMarker[] {
  const map = new Map(analyses.map(a => [a.name.toLowerCase().trim(), a]));
  return raw.map(m => {
    const analysis = map.get(m.name.toLowerCase().trim());
    const status = (analysis?.status ?? m.status ?? 'normal') as MergedMarker['status'];
    return {
      name: m.name,
      value: m.value,
      unit: m.unit || m.units || '',
      reference_range: m.reference_range,
      status,
      category: inferCategory(m.name),
      analysis,
    };
  });
}

function groupByCategory(markers: MergedMarker[]): [MarkerCategory, MergedMarker[]][] {
  const map = new Map<MarkerCategory, MergedMarker[]>();
  for (const m of markers) {
    const list = map.get(m.category) ?? [];
    list.push(m);
    map.set(m.category, list);
  }
  return CATEGORY_ORDER.filter(c => map.has(c)).map(c => [c, map.get(c)!]);
}

// ── Tier 1: Urgent Flags ──────────────────────────────────────────────────────

function UrgentFlagsBanner({ flags }: { flags: string[] }) {
  return (
    <div className="border-2 border-red-500 bg-red-50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex-shrink-0 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </span>
        <h2 className="text-xl font-bold text-red-800 tracking-tight">
          Requires Immediate Attention
        </h2>
      </div>
      <ul className="ml-12 space-y-2">
        {flags.map((flag, i) => (
          <li key={i} className="flex items-start gap-2 text-sm font-medium text-red-700">
            <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
            {flag}
          </li>
        ))}
      </ul>
      <p className="ml-12 mt-3 text-xs text-red-500">
        Please discuss these findings with your healthcare provider promptly.
      </p>
    </div>
  );
}

// ── Tier 2: Needs Attention ───────────────────────────────────────────────────

function AttentionMarkerCard({ marker }: { marker: MergedMarker }) {
  const isHigh = marker.status === 'high';
  const containerClass = isHigh
    ? 'bg-red-50 border border-red-200 border-l-[3px] border-l-red-500'
    : 'bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-500';
  const badgeClass = isHigh
    ? 'bg-red-100 text-red-800 border border-red-200'
    : 'bg-amber-100 text-amber-800 border border-amber-200';

  return (
    <div className={`rounded-lg p-4 ${containerClass}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="font-semibold text-gray-900">{marker.name}</span>
        <span className={`ml-3 flex-shrink-0 px-2.5 py-0.5 text-xs font-bold rounded-full ${badgeClass}`}>
          {isHigh ? '↑ High' : '↓ Low'}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-3">
        <span>
          <span className="text-gray-500">Value: </span>
          <span className="font-bold text-gray-900">
            {marker.value}{marker.unit ? ` ${marker.unit}` : ''}
          </span>
        </span>
        {marker.reference_range && (
          <span>
            <span className="text-gray-500">Reference: </span>
            <span className="font-medium text-gray-700">{marker.reference_range}</span>
          </span>
        )}
      </div>

      {marker.analysis?.explanation && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {marker.analysis.explanation}
        </p>
      )}

      {marker.analysis?.conversation_starter && (
        <div className="flex items-start gap-2 bg-white/80 rounded-md border border-gray-100 px-3 py-2.5">
          <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-blue-700 block mb-0.5">Ask your doctor:</span>
            {marker.analysis.conversation_starter}
          </div>
        </div>
      )}
    </div>
  );
}

function NeedsAttentionTier({ markers }: { markers: MergedMarker[] }) {
  const grouped = groupByCategory(markers);
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span className="flex-shrink-0 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-white" />
        </span>
        <h2 className="text-xl font-bold text-gray-900">Needs Attention</h2>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
          {markers.length} marker{markers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-7">
        {grouped.map(([category, catMarkers]) => (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              {category}
            </p>
            <div className="space-y-3">
              {catMarkers.map((m, i) => (
                <AttentionMarkerCard key={i} marker={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Tier 4: All Good ──────────────────────────────────────────────────────────

function AllGoodTier({ markers }: { markers: MergedMarker[] }) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const grouped = groupByCategory(markers);

  const toggle = (cat: string) =>
    setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span className="flex-shrink-0 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </span>
        <h2 className="text-xl font-bold text-gray-900">All Good</h2>
        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
          {markers.length} marker{markers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {grouped.map(([category, catMarkers]) => {
          const isOpen = !!openCats[category];
          return (
            <div key={category} className="border border-green-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(category)}
                className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-green-900">{category}</span>
                  <span className="text-sm text-green-600 truncate">
                    — {catMarkers.length} marker{catMarkers.length !== 1 ? 's' : ''} within normal range
                  </span>
                </div>
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                  : <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                }
              </button>

              {isOpen && (
                <div className="bg-white">
                  {catMarkers.map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm ${i > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <span className="text-gray-700">{m.name}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-medium text-gray-900">
                          {m.value}{m.unit ? ` ${m.unit}` : ''}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded border border-green-200">
                          Normal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Summary + Lifestyle + Disclaimer ─────────────────────────────────────────

function renderList(items: string[]) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export const ResultsTriage: React.FC<Props> = ({ extractedValues, insights }) => {
  const merged = buildMerged(extractedValues, insights.markers);
  const abnormal = merged.filter(m => m.status !== 'normal');
  const normal = merged.filter(m => m.status === 'normal');

  const recs = insights.lifestyle_recommendations;
  const hasRecs =
    recs &&
    (recs.diet?.length || recs.exercise?.length || recs.sleep?.length || recs.stress?.length);

  return (
    <div className="space-y-10">
      {/* Tier 1 — Urgent Flags */}
      {insights.urgent_flags?.length > 0 && (
        <UrgentFlagsBanner flags={insights.urgent_flags} />
      )}

      {/* Tier 2 — Needs Attention */}
      {abnormal.length > 0 && <NeedsAttentionTier markers={abnormal} />}

      {/* Tier 4 — All Good (collapsed by category) */}
      {normal.length > 0 && <AllGoodTier markers={normal} />}

      {/* Overall Summary */}
      {insights.summary && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <HeartPulse className="w-5 h-5 text-green-600" />
              Overall Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Lifestyle Recommendations */}
      {hasRecs && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-green-600" />
              Lifestyle Recommendations
            </h2>
            {recs.diet?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800">Diet</h3>
                {renderList(recs.diet)}
              </div>
            )}
            {recs.exercise?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800">Exercise</h3>
                {renderList(recs.exercise)}
              </div>
            )}
            {recs.sleep?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800">Sleep</h3>
                {renderList(recs.sleep)}
              </div>
            )}
            {recs.stress?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800">Stress Management</h3>
                {renderList(recs.stress)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {insights.disclaimer && (
        <div className="border-l-4 border-orange-400 bg-orange-50 text-orange-800 text-sm p-4 rounded-r-md">
          {insights.disclaimer}
        </div>
      )}
    </div>
  );
};
