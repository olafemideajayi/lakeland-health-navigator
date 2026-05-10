'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ClinicWithWaitTime } from '@lhn/shared';
import { ReportWaitModal } from './report-wait-modal';

function getWaitColor(minutes: number | undefined) {
  if (!minutes) return { bg: 'bg-gray-100', text: 'text-gray-500', bar: 'bg-gray-300' };
  if (minutes <= 20) return { bg: 'bg-accent-light', text: 'text-accent', bar: 'bg-accent' };
  if (minutes <= 45) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  if (minutes <= 90) return { bg: 'bg-warning-light', text: 'text-warning', bar: 'bg-warning' };
  return { bg: 'bg-danger-light', text: 'text-danger', bar: 'bg-danger' };
}

function formatWait(minutes: number | undefined) {
  if (!minutes) return 'N/A';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h+`;
}

export function ClinicCard({ clinic }: { clinic: ClinicWithWaitTime }) {
  const [expanded, setExpanded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const wait = clinic.currentWait;
  const colors = getWaitColor(wait?.minutes);
  const capacityPct = wait ? (wait.patientsWaiting / wait.capacity) * 100 : 0;

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start p-4">
          <div>
            <h3 className="text-[15px] font-bold text-gray-800">{clinic.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              📍 {clinic.address}, {clinic.city}
            </p>
            {(wait as any)?.reportCount > 0 && (
              <p className="text-[10px] text-accent font-medium mt-1">
                Based on {(wait as any).reportCount} patient report{(wait as any).reportCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <span className={`px-3.5 py-1.5 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
            {formatWait(wait?.minutes)}
          </span>
        </div>

        {/* Capacity bar */}
        <div className="mx-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${colors.bar} transition-all`} style={{ width: `${capacityPct}%` }} />
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="px-4 pt-3 pb-4 border-t border-gray-50 mt-3">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <span>📞 {clinic.phone}</span>
              <span>📊 {Math.round(capacityPct)}% capacity</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {clinic.services.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-primary-light text-primary rounded-full text-[11px] font-semibold">
                  {s}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <a href={`tel:${clinic.phone}`} className="flex-1 py-2.5 bg-primary text-white text-center rounded-lg text-xs font-semibold">
                📞 Call
              </a>
              <Link href={`/clinic/${clinic.slug}`} className="flex-1 py-2.5 border border-primary text-primary text-center rounded-lg text-xs font-semibold">
                View Details →
              </Link>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowReport(true); }}
              className="w-full mt-2 py-2.5 bg-accent/10 text-accent text-center rounded-lg text-xs font-semibold border border-accent/20"
            >
              ⏱️ Report Your Wait Time
            </button>
          </div>
        )}
      </div>

      {showReport && (
        <ReportWaitModal
          clinicId={clinic.id}
          clinicName={clinic.name}
          onClose={() => setShowReport(false)}
          onSubmitted={() => {}}
        />
      )}
    </>
  );
}
