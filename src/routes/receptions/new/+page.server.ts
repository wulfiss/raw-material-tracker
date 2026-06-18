import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
  listActiveMaterials,
  todayInTimeZone,
  isDateString,
  createReception
} from '$lib/server/mock-db';
import { units } from '$lib/server/mock-db';
import { translations } from '$lib/i18n/translations';

const t = translations['es-AR'];

interface ReceptionFormFields {
  date: string;
  material_id: string;
  supplier_name: string;
  lot: string;
  manufacture_date: string;
  expiration_date: string;
  quantity: string;
  unit: string;
  temperature: string;
  storage_condition: string;
  observations: string;
}

const fieldsFrom = (form: FormData): ReceptionFormFields => ({
  date: String(form.get('date') ?? '').trim(),
  material_id: String(form.get('material_id') ?? '').trim(),
  supplier_name: String(form.get('supplier_name') ?? '').trim(),
  lot: String(form.get('lot') ?? '').trim(),
  manufacture_date: String(form.get('manufacture_date') ?? '').trim(),
  expiration_date: String(form.get('expiration_date') ?? '').trim(),
  quantity: String(form.get('quantity') ?? '').trim(),
  unit: String(form.get('unit') ?? '').trim(),
  temperature: String(form.get('temperature') ?? '').trim(),
  storage_condition: String(form.get('storage_condition') ?? '').trim(),
  observations: String(form.get('observations') ?? '').trim()
});

export const load: PageServerLoad = async () => {
  return {
    materials: await listActiveMaterials(),
    today: todayInTimeZone(),
    loadError: null
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const fields = fieldsFrom(form);
    const quantity = Number(fields.quantity);
    const temperature = fields.temperature === '' ? null : Number(fields.temperature);

    if (
      !fields.date ||
      !fields.supplier_name ||
      !fields.unit ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return fail(400, {
        message: t.newReception.messages.completeFields,
        fields
      });
    }

    if (!isDateString(fields.date)) {
      return fail(400, {
        message: t.newReception.messages.invalidReceptionDate,
        fields
      });
    }

    if (fields.manufacture_date && !isDateString(fields.manufacture_date)) {
      return fail(400, {
        message: t.newReception.messages.invalidManufactureDate,
        fields
      });
    }

    if (fields.expiration_date && !isDateString(fields.expiration_date)) {
      return fail(400, {
        message: t.newReception.messages.invalidExpiryDate,
        fields
      });
    }

    if (!units.includes(fields.unit as typeof units[number])) {
      return fail(400, {
        message: t.newReception.messages.invalidUnit,
        fields
      });
    }

    if (fields.material_id && fields.material_id !== 'null') {
      const material = (await listActiveMaterials()).find((m) => m.id === fields.material_id);
      if (!material) {
        return fail(400, {
          message: t.newReception.messages.selectActiveMaterial,
          fields
        });
      }
    }

    if (temperature !== null && !Number.isFinite(temperature)) {
      return fail(400, {
        message: t.newReception.messages.invalidTemperature,
        fields
      });
    }

    const manufactureDate = fields.manufacture_date === '' ? null : fields.manufacture_date;
    const expirationDate = fields.expiration_date === '' ? null : fields.expiration_date;

    if (manufactureDate && expirationDate && expirationDate < manufactureDate) {
      return fail(400, {
        message: t.newReception.messages.expiryBeforeManufacture,
        fields
      });
    }

    const result = await createReception(
      {
        received_on: fields.date,
        material_id: fields.material_id || '',
        supplier_name: fields.supplier_name,
        supplier_id: '',
        lot_code: fields.lot,
        manufacture_date: manufactureDate,
        expiry_date: expirationDate,
        quantity,
        unit: fields.unit as typeof units[number],
        temperature_c: temperature,
        storage_condition: fields.storage_condition,
        observations: fields.observations || null
      },
      locals.user!
    );

    if ('error' in result) {
      return fail(400, { message: result.error, fields });
    }

    redirect(303, '/receptions');
  }
};
