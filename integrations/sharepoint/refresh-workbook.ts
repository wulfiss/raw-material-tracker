/** Paste into Excel for the web > Automate > New Script. */
interface ExportRow { [key: string]: string | number | boolean | null | object; }
interface Snapshot {
  version: number;
  exported_at: string;
  tables: { [key: string]: ExportRow[] };
  missing_tables: string[];
}
function main(workbook: ExcelScript.Workbook, snapshotJson: string): string {
  const snapshot = JSON.parse(snapshotJson) as Snapshot;
  if (snapshot.version !== 1 || !snapshot.tables || !snapshot.exported_at || !Array.isArray(snapshot.missing_tables)) {
    throw new Error('Invalid Supabase export; workbook unchanged.');
  }
  // Conservative bounds below Office Scripts request/cell limits. Fail before writes.
  if (snapshotJson.length > 1000000) throw new Error('Export too large for this flow; use a paged export.');
  const allowed: string[] = ['materials', 'receptions', 'recipes', 'recipe_ingredients', 'reception_views',
    'daily_material_uses', 'daily_material_use_products', 'production_batches',
    'production_batch_ingredients', 'production_batch_lot_usages', 'traceability'];
  const datasets: { name: string; values: (string | number | boolean)[][] }[] = [];
  for (const name of allowed) {
    const rows: ExportRow[] = snapshot.tables[name] || [];
    if (!Array.isArray(rows)) throw new Error(`Invalid dataset: ${name}`);
    const headers: string[] = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row: ExportRow = rows[rowIndex];
      const keys: string[] = Object.keys(row);
      for (const key of keys) {
        if (headers.indexOf(key) === -1) headers.push(key);
      }
    }
    if (!headers.length) headers.push('No records');
    if (rows.length > 50000 || headers.length > 200) throw new Error(`Dataset too large: ${name}`);
    const values: (string | number | boolean)[][] = [headers];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row: ExportRow = rows[rowIndex];
      const cells: (string | number | boolean)[] = [];
      for (const key of headers) {
        const value: string | number | boolean | null | object | undefined = row[key];
        if (value === null || value === undefined) {
          cells.push('');
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          cells.push(value);
        } else {
          const text: string = typeof value === 'string' ? value : JSON.stringify(value);
          if (text.length > 32000) throw new Error(`Cell too long in ${name}.${key}`);
          // Keep database text from becoming an Excel formula.
          cells.push(/^[\s]*[=+\-@]/.test(text) ? "'" + text : text);
        }
      }
      values.push(cells);
    }
    datasets.push({ name, values });
  }
  datasets.push({ name: 'sync_status', values: [
    ['Property', 'Value'], ['Supabase snapshot UTC', snapshot.exported_at],
    ['Workbook refresh UTC', new Date().toISOString()],
    ['Missing tables', snapshot.missing_tables.join(', ') || 'None'],
    ['Traceability', snapshot.missing_tables.includes('traceability') ? 'Daily-use module unavailable' : 'Recorded material uses only']
  ] });
  const marker = 'Supabase daily export v1';
  // Existing workbook content is preserved. Only sheets owned by this script change.
  for (const dataset of datasets) {
    const name = 'SB_' + dataset.name;
    const existing = workbook.getWorksheet(name);
    if (existing && existing.getRange('A1').getText() !== marker) throw new Error(`Sheet ${name} already exists and is not an export sheet.`);
  }
  for (const dataset of datasets) {
    const name = 'SB_' + dataset.name;
    const sheet = workbook.getWorksheet(name) || workbook.addWorksheet(name);
    for (const table of sheet.getTables()) table.delete();
    const used = sheet.getUsedRange();
    if (used) used.clear(ExcelScript.ClearApplyTo.contents);
    sheet.getRange('A1').setValue(marker);
    const range = sheet.getRangeByIndexes(1, 0, dataset.values.length, dataset.values[0].length);
    range.setValues(dataset.values);
    sheet.addTable(range, true);
    sheet.getFreezePanes().freezeRows(2);
  }
  return JSON.stringify({ exported_at: snapshot.exported_at, sheets: datasets.length, missing_tables: snapshot.missing_tables });
}
