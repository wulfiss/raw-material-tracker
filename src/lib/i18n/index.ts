import { derived, get } from 'svelte/store';
import { currentLanguage } from './store';
import { translations } from './translations';

export { currentLanguage } from './store';

export const t = derived(currentLanguage, $lang => translations[$lang]);

export function getT() {
  return translations[get(currentLanguage)];
}
