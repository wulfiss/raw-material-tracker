import { fail, redirect } from '@sveltejs/kit';
import {
  createReceipt,
  getMaterial,
  isDateString,
  isReceiptStatus,
  isUnit,
  listActiveMaterials,
  todayInTimeZone
} from '$lib/server/mock-db';
import { getMockUser } from '$lib/server/mock-auth';
import { translations } from '$lib/i18n/translations';
import type { Actions, PageServerLoad } from './$types';

const t = translations['es-AR'];
const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
const nullable = (value: string) => (value === '' ? null : value);

type ReceiptFormFields = {
  received_on: string;
  material_id: string;
  supplier: string;
  lot_code: string;
  manufacture_date: string;
  expiry_date: string;
  quantity: string;
  unit: string;
  temperature_c: string;
  status: string;
  observations: string;
};

const fieldsFrom = (form: FormData): ReceiptFormFields => ({
  received_on: text(form, 'received_on'),
  material_id: text(form, 'material_id'),
  supplier: text(form, 'supplier'),
  lot_code: text(form, 'lot_code'),
  manufacture_date: text(form, 'manufacture_date'),
  expiry_date: text(form, 'expiry_date'),
  quantity: text(form, 'quantity'),
  unit: text(form, 'unit'),
  temperature_c: text(form, 'temperature_c'),
  status: text(form, 'status'),
  observations: text(form, 'observations')
});

export const load: PageServerLoad = async () => {
  return {
    materials: await listActiveMaterials(),
    today: todayInTimeZone(),
    loadError: null
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const fields = fieldsFrom(form);
    const quantity = Number(fields.quantity);
    const temperature = fields.temperature_c === '' ? null : Number(fields.temperature_c);

    if (!fields.received_on || !fields.material_id || !fields.supplier || !fields.lot_code || !fields.unit || !fields.status || !Number.isFinite(quantity) || quantity <= 0) {
      return fail(400, { message: t.newReceiption.messages.completeFields, fields });
    }

    if (!isDateString(fields.received_on)) {
      return fail(400, { message: t.newReceiption.messages.invalidReceptionDate, fields });
    }

    if (fields.manufacture_date && !isDateString(fields.manufacture_date)) {
      return fail(400, { message: t.newReceiption.messages.invalidManufactureDate, fields });
    }

    if (fields.expiry_date && !isDateString(fields.expiry_date)) {
      return fail(400, { message: t.newReceiption.messages.invalidExpiryDate, fields });
    }

    if (!isUnit(fields.unit)) {
      return fail(400, { message: t.newReceiption.messages.invalidUnit, fields });
    }

    if (!isReceiptStatus(fields.status)) {
      return fail(400, { message: t.newReceiption.messages.invalidStatus, fields });
    }

    if (!(await getMaterial(fields.material_id))) {
      return fail(400, { message: t.newReceiption.messages.selectActiveMaterial, fields });
    }

    if (temperature !== null && !Number.isFinite(temperature)) {
      return fail(400, { message: t.newReceiption.messages.invalidTemperature, fields });
    }

    const manufactureDate = nullable(fields.manufacture_date);
    const expiryDate = nullable(fields.expiry_date);

    if (manufactureDate && expiryDate && expiryDate < manufactureDate) {
      return fail(400, { message: t.newReceiption.messages.expiryBeforeManufacture, fields });
    }

    const result = await createReceipt(
      {
        received_on: fields.received_on,
        material_id: fields.material_id,
        supplier: fields.supplier,
        lot_code: fields.lot_code,
        manufacture_date: manufactureDate,
        expiry_date: expiryDate,
        quantity,
        unit: fields.unit,
        temperature_c: temperature,
        status: fields.status,
        observations: nullable(fields.observations)
      },
      getMockUser()
    );

    if ('error' in result) {
      return fail(400, { message: result.error, fields });
    }

    redirect(303, '/receipts');
  }
};
