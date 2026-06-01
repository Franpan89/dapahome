'use client';

interface Row {
  email: string;
  source?: string | null;
  created_at: string;
}

export function ExportCsvButton({ rows }: { rows: Row[] }) {
  function download() {
    const header = ['email', 'source', 'created_at'];
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [r.email, r.source ?? '', r.created_at].map(csvCell).join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dapahome-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={download} className="btn-outline">
      Descargar CSV
    </button>
  );
}

function csvCell(v: string): string {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
