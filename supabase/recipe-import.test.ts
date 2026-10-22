import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
// @ts-expect-error Standalone generator intentionally runs directly in Node.
import { buildImport } from '../scripts/build-recipe-import.mjs';

describe('source product catalogue import', () => {
  it('imports six unspecified preparations as raw materials', () => {
    const { recipes, rawMaterials } = buildImport();
    expect(recipes).toHaveLength(68);
    expect(new Set(recipes.map((r: any) => r.key)).size).toBe(68);
    expect(recipes.filter((r: any) => r.ingredients.length === 0)).toHaveLength(0);
    expect(rawMaterials).toHaveLength(6);
    expect(recipes.find((r: any) => r.name === 'Pizza lista muzzarella').ingredients)
      .toContainEqual({ name: 'salsa de tomate', preparation: null, rawMaterial: 'Salsa de tomate' });
    const tartas = recipes.filter((r: any) => r.name === 'Tarta de jamón y queso');
    expect(tartas).toHaveLength(2);
    expect(tartas[0].ingredients).not.toEqual(tartas[1].ingredients);
  });
  it('links final products and intermediate preparations without cycles', () => {
    const { recipes } = buildImport();
    const byKey = new Map(recipes.map((r: any) => [r.key, r]));
    function visit(key: string, path: string[] = []) {
      expect(path).not.toContain(key);
      const recipe: any = byKey.get(key);
      expect(recipe).toBeDefined();
      for (const ingredient of recipe.ingredients) {
        if (ingredient.preparation) visit(ingredient.preparation, [...path, key]);
      }
    }
    for (const recipe of recipes) visit(recipe.key);
    expect(recipes.find((r: any) => r.name === 'Mayonesa de ave').ingredients)
      .toContainEqual({ name: 'Papa hervida', preparation: 'Cocina:31:final' });
  });
  it('keeps the checked-in SQL reproducible', () => {
    expect(readFileSync('supabase/import-product-recipes.sql', 'utf8')).toBe(buildImport().sql);
  });
});
