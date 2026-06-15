import type { Language } from './translations';
import { translations } from './translations';

export function translateStatus(status: string, language: Language = 'es-AR'): string {
  const t = translations[language];

  if (status === 'accepted') return t.newReceiption.statusOptions.accepted;
  if (status === 'conditional') return t.newReceiption.statusOptions.conditional;
  if (status === 'rejected') return t.newReceiption.statusOptions.rejected;

  return status;
}
