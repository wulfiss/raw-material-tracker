import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('seed.sql safety', () => {
  const sql = readFileSync('supabase/seed.sql', 'utf8');

  it('has a clearly visible LOCAL DEV ONLY warning', () => {
    expect(sql).toMatch(/LOCAL DEV ONLY|DO NOT RUN IN PRODUCTION/i);
  });

  it('has a WARNING or DANGER label before the DISABLE RLS block', () => {
    const disablePos = sql.indexOf('DISABLE ROW LEVEL SECURITY');
    const before = sql.slice(0, disablePos);
    expect(before).toMatch(/WARNING|DANGER|LOCAL DEV/i);
  });
});
