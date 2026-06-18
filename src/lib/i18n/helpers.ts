import { translations } from './translations';

export function translateStatus(status: string): string {
  const t = translations['es-AR'];

  if (status === 'accepted') return t.newReception.statusOptions.accepted;
  if (status === 'conditional') return t.newReception.statusOptions.conditional;
  if (status === 'rejected') return t.newReception.statusOptions.rejected;

  return status;
}
