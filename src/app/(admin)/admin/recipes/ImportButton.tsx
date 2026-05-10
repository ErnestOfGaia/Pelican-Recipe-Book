'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ImportSummary {
  inserted: number;
  updated: number;
  failed: number;
  errors: string[];
}

export default function ImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSummary(null);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/admin/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Import failed (${res.status})`);
      } else {
        setSummary(data as ImportSummary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function close() {
    setSummary(null);
    setError(null);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1 px-4 py-2 bg-white text-[#001b3c] border-2 border-[#001b3c] font-grotesk font-bold uppercase tracking-wide text-xs hover:bg-[#f0f3ff] transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        <span className="material-symbols-outlined text-base">upload_file</span>
        {loading ? 'IMPORTING…' : 'IMPORT CSV'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={onFile}
        className="hidden"
      />

      {(summary || error) && (
        <div className="fixed inset-0 z-[60] bg-[#001b3c]/40 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#001b3c] max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="px-5 py-3 border-b-2 border-[#001b3c] bg-[#e7eeff] flex items-center justify-between">
              <h2 className="font-grotesk font-black uppercase text-[#001b3c] tracking-tight">
                Import Result
              </h2>
              <button
                type="button"
                onClick={close}
                className="text-[#526a8d] hover:text-[#001b3c]"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-5 py-4 overflow-auto">
              {error ? (
                <p className="font-sans text-[#b7102a]">{error}</p>
              ) : summary ? (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Stat label="Inserted" value={summary.inserted} tone="ok" />
                    <Stat label="Updated" value={summary.updated} tone="info" />
                    <Stat label="Failed" value={summary.failed} tone={summary.failed > 0 ? 'err' : 'mute'} />
                  </div>
                  {summary.errors.length > 0 && (
                    <div>
                      <h3 className="font-grotesk font-bold uppercase text-xs tracking-wide text-[#001b3c] mb-2">
                        Errors
                      </h3>
                      <ul className="font-sans text-sm text-[#43474e] space-y-1 max-h-60 overflow-auto border border-[#e7eeff] p-3 bg-[#f9f9ff]">
                        {summary.errors.map((e, i) => (
                          <li key={i} className="border-b border-[#e7eeff] pb-1 last:border-0">{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <div className="px-5 py-3 border-t-2 border-[#001b3c] flex justify-end">
              <button
                type="button"
                onClick={close}
                className="px-5 py-2 bg-[#526a8d] text-white border-2 border-[#001b3c] font-grotesk font-bold uppercase tracking-wide text-xs hover:bg-[#3a5273] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'ok' | 'info' | 'err' | 'mute' }) {
  const toneClass = {
    ok: 'border-[#1a7a45] text-[#1a7a45] bg-[#d6f5e3]',
    info: 'border-[#526a8d] text-[#526a8d] bg-[#e7eeff]',
    err: 'border-[#b7102a] text-[#b7102a] bg-[#fde0e4]',
    mute: 'border-[#74777f] text-[#74777f] bg-[#f5f5f5]',
  }[tone];
  return (
    <div className={`border-2 px-3 py-2 ${toneClass}`}>
      <div className="font-grotesk font-black text-2xl leading-none">{value}</div>
      <div className="font-grotesk font-bold uppercase text-[10px] tracking-wide mt-1">{label}</div>
    </div>
  );
}
