/**
 * Hook para exportar tablas a CSV desde el frontend
 * Mejora #39 — Exportar tabla a CSV
 */
export const useExportCSV = () => {
  const exportToCSV = (data, filename = 'export', columns = null) => {
    if (!data || data.length === 0) return;

    const keys = columns || Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(row =>
      keys.map(k => {
        const val = row[k] ?? '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
      }).join(',')
    );

    const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM para Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { exportToCSV };
};
