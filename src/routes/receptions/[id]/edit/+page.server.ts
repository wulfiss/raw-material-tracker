import { error, fail, redirect } from '@sveltejs/kit';
import {
  getReception,
  updateReception,
  getMaterial,
  isDateString,
  isReceptionStatus,
  isUnit,
  listActiveMaterials,
  todayInTimeZone
} from '$lib/server/mock-db';
import { translations } from '$lib/i18n/translations';
import type { PageServerLoad, Actions } from './$types';

const t = translations['es-AR'];
const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
const nullable = (value: string) => (value === '' ? null : value);

type ReceptionFormFields = {
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

const fieldsFrom = (form: FormData): ReceptionFormFields => ({
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

export const load: PageServerLoad = async ({ params }) => {
  const reception = await getReception(params.id);
  if (!reception) throw error(404, 'Reception not found');

  return {
    reception,
    materials: await listActiveMaterials(),
    today: todayInTimeZone(),
    loadError: null
  };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const form = await request.formData();
    const fields = fieldsFrom(form);
    const quantity = Number(fields.quantity);
    const temperature = fields.temperature_c === '' ? null : Number(fields.temperature_c);

    if (!fields.received_on || !fields.material_id || !fields.supplier || !fields.lot_code || !fields.unit || !fields.status || !Number.isFinite(quantity) || quantity <= 0) {
      return fail(400, { message: t.newReception.messages.completeFields, fields });
    }

    if (!isDateString(fields.received_on)) {
      return fail(400, { message: t.newReception.messages.invalidReceptionDate, fields });
    }

    if (fields.manufacture_date && !isDateString(fields.manufacture_date)) {
      return fail(400, { message: t.newReception.messages.invalidManufactureDate, fields });
    }

    if (fields.expiry_date && !isDateString(fields.expiry_date)) {
      return fail(400, { message: t.newReception.messages.invalidExpiryDate, fields });
    }

    if (!isUnit(fields.unit)) {
      return fail(400, { message: t.newReception.messages.invalidUnit, fields });
    }

    if (!isReceptionStatus(fields.status)) {
      return fail(400, { message: t.newReception.messages.invalidStatus, fields });
    }

    const material = await getMaterial(fields.material_id);
    if (!material) {
      return fail(400, { message: t.newReception.messages.selectActiveMaterial, fields });
    }

    if (material.expirationRequired && !fields.expiry_date) {
      return fail(400, { message: t.newReception.messages.expiryRequired, fields });
    }

    if (temperature !== null && !Number.isFinite(temperature)) {
      return fail(400, { message: t.newReception.messages.invalidTemperature, fields });
    }

    const manufactureDate = nullable(fields.manufacture_date);
    const expiryDate = nullable(fields.expiry_date);

    if (manufactureDate && expiryDate && expiryDate < manufactureDate) {
      return fail(400, { message: t.newReception.messages.expiryBeforeManufacture, fields });
    }

    const result = await updateReception(params.id, {
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
    }, locals.user!);

    if ('error' in result) {
      return fail(400, { message: result.error, fields });
    }

    redirect(303, '/receptions');
  }
};
