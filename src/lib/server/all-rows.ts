/** PostgREST caps each response. Read stable pages instead of silently truncating. */
export async function allRows<T>(readPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  const size = 500;
  for (let offset = 0; ; offset += size) {
    const result = await readPage(offset, offset + size - 1);
    if (result.error) throw new Error('Unable to load data');
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < size) return rows;
  }
}
