import { writable } from 'svelte/store';
import type { Language } from './translations';

// Initialize with Spanish (Argentina)
export const currentLanguage = writable<Language>('es-AR');

export function getLanguage() {
  let lang: Language = 'es-AR';
  currentLanguage.subscribe(value => (lang = value))();
  return lang;
}
