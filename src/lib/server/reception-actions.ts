import { fail } from '@sveltejs/kit';
import {
  createReception,
  updateReception,
  getMaterial,
  isDateString,
  isReceptionStatus,
  isUnit
} from './mock-db';
import type { MockUser } from './mock-auth';
import type { Reception } from './mock-db';
import { getT } from '$lib/i18n';

export type ReceptionFormFields = {
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

type ReceptionInput = Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>;

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
const nullable = (value: string) => (value === '' ? null : value);

export function fieldsFrom(form: FormData): ReceptionFormFields {
  return {
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
  };
}

function toReceptionInput(fields: ReceptionFormFields): ReceptionInput {
  const quantity = Number(fields.quantity);
  const temperature = fields.temperature_c === '' ? null : Number(fields.temperature_c);
  return {
    received_on: fields.received_on,
    material_id: fields.material_id,
    supplier: fields.supplier,
    lot_code: fields.lot_code,
    manufacture_date: nullable(fields.manufacture_date),
    expiry_date: nullable(fields.expiry_date),
    quantity,
    unit: fields.unit as ReceptionInput['unit'],
    temperature_c: temperature,
    status: fields.status as ReceptionInput['status'],
    observations: nullable(fields.observations)
  };
}

export async function validateAndCreateReception(form: FormData, user: MockUser) {
  const t = getT();
  const fields = fieldsFrom(form);
  const input = toReceptionInput(fields);

  if (!input.received_on || !input.material_id || !input.supplier || !input.lot_code || !input.unit || !input.status || !Number.isFinite(input.quantity) || input.quantity <= 0) {
    return fail(400, { message: t.newReception.messages.completeFields, fields });
  }

  if (!isDateString(input.received_on)) {
    return fail(400, { message: t.newReception.messages.invalidReceptionDate, fields });
  }

  if (input.manufacture_date && !isDateString(input.manufacture_date)) {
    return fail(400, { message: t.newReception.messages.invalidManufactureDate, fields });
  }

  if (input.expiry_date && !isDateString(input.expiry_date)) {
    return fail(400, { message: t.newReception.messages.invalidExpiryDate, fields });
  }

  if (!isUnit(input.unit)) {
    return fail(400, { message: t.newReception.messages.invalidUnit, fields });
  }

  if (!isReceptionStatus(input.status)) {
    return fail(400, { message: t.newReception.messages.invalidStatus, fields });
  }

  const material = await getMaterial(input.material_id);
  if (!material) {
    return fail(400, { message: t.newReception.messages.selectActiveMaterial, fields });
  }

  if (material.expirationRequired && !input.expiry_date) {
    return fail(400, { message: t.newReception.messages.expiryRequired, fields });
  }

  if (input.temperature_c !== null && !Number.isFinite(input.temperature_c)) {
    return fail(400, { message: t.newReception.messages.invalidTemperature, fields });
  }

  if (input.manufacture_date && input.expiry_date && input.expiry_date < input.manufacture_date) {
    return fail(400, { message: t.newReception.messages.expiryBeforeManufacture, fields });
  }

  const result = await createReception(input, user);

  if ('error' in result) {
    return fail(400, { message: result.error, fields });
  }

  return result;
}

export async function validateAndUpdateReception(id: string, form: FormData, user: MockUser) {
  const t = getT();
  const fields = fieldsFrom(form);
  const input = toReceptionInput(fields);

  if (!input.received_on || !input.material_id || !input.supplier || !input.lot_code || !input.unit || !input.status || !Number.isFinite(input.quantity) || input.quantity <= 0) {
    return fail(400, { message: t.newReception.messages.completeFields, fields });
  }

  if (!isDateString(input.received_on)) {
    return fail(400, { message: t.newReception.messages.invalidReceptionDate, fields });
  }

  if (input.manufacture_date && !isDateString(input.manufacture_date)) {
    return fail(400, { message: t.newReception.messages.invalidManufactureDate, fields });
  }

  if (input.expiry_date && !isDateString(input.expiry_date)) {
    return fail(400, { message: t.newReception.messages.invalidExpiryDate, fields });
  }

  if (!isUnit(input.unit)) {
    return fail(400, { message: t.newReception.messages.invalidUnit, fields });
  }

  if (!isReceptionStatus(input.status)) {
    return fail(400, { message: t.newReception.messages.invalidStatus, fields });
  }

  const material = await getMaterial(input.material_id);
  if (!material) {
    return fail(400, { message: t.newReception.messages.selectActiveMaterial, fields });
  }

  if (material.expirationRequired && !input.expiry_date) {
    return fail(400, { message: t.newReception.messages.expiryRequired, fields });
  }

  if (input.temperature_c !== null && !Number.isFinite(input.temperature_c)) {
    return fail(400, { message: t.newReception.messages.invalidTemperature, fields });
  }

  if (input.manufacture_date && input.expiry_date && input.expiry_date < input.manufacture_date) {
    return fail(400, { message: t.newReception.messages.expiryBeforeManufacture, fields });
  }

  const result = await updateReception(id, input, user);

  if ('error' in result) {
    return fail(400, { message: result.error, fields });
  }

  return result;
}
