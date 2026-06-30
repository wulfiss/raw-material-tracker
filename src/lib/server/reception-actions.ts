import { fail } from '@sveltejs/kit';
import { receptions } from './repository';
import { materials } from './repository';
import { isDateString, isReceptionStatus, isUnit } from './repository/types';
import type { MockUser } from './mock-auth';
import type { Reception } from './repository/types';
import { getT } from '$lib/i18n';
import { formText } from './form-utils';

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
const nullable = (value: string) => (value === '' ? null : value);

export function fieldsFrom(form: FormData): ReceptionFormFields {
  return {
    received_on: formText(form, 'received_on'),
    material_id: formText(form, 'material_id'),
    supplier: formText(form, 'supplier'),
    lot_code: formText(form, 'lot_code'),
    manufacture_date: formText(form, 'manufacture_date'),
    expiry_date: formText(form, 'expiry_date'),
    quantity: formText(form, 'quantity'),
    unit: formText(form, 'unit'),
    temperature_c: formText(form, 'temperature_c'),
    status: formText(form, 'status'),
    observations: formText(form, 'observations')
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

type ValidationResult = { valid: false; fields: ReceptionFormFields; message: string } | { valid: true; input: ReceptionInput };

async function validateReception(fields: ReceptionFormFields): Promise<ValidationResult> {
  const t = getT();
  const input = toReceptionInput(fields);

  const required = [input.received_on, input.material_id, input.supplier, input.unit, input.status];
  if (required.some(v => !v) || !Number.isFinite(input.quantity) || input.quantity <= 0) {
    return { valid: false, fields, message: t.newReception.messages.completeFields };
  }

  if (!isDateString(input.received_on)) return { valid: false, fields, message: t.newReception.messages.invalidReceptionDate };
  if (input.manufacture_date && !isDateString(input.manufacture_date)) return { valid: false, fields, message: t.newReception.messages.invalidManufactureDate };
  if (input.expiry_date && !isDateString(input.expiry_date)) return { valid: false, fields, message: t.newReception.messages.invalidExpiryDate };
  if (!isUnit(input.unit)) return { valid: false, fields, message: t.newReception.messages.invalidUnit };
  if (!isReceptionStatus(input.status)) return { valid: false, fields, message: t.newReception.messages.invalidStatus };

  if (input.temperature_c !== null && !Number.isFinite(input.temperature_c)) {
    return { valid: false, fields, message: t.newReception.messages.invalidTemperature };
  }

  if (input.manufacture_date && input.expiry_date && input.expiry_date < input.manufacture_date) {
    return { valid: false, fields, message: t.newReception.messages.expiryBeforeManufacture };
  }

  const material = await materials.get(input.material_id);
  if (!material || !material.active) return { valid: false, fields, message: t.newReception.messages.selectActiveMaterial };
  if (material.expirationRequired && !input.expiry_date) return { valid: false, fields, message: t.newReception.messages.expiryRequired };

  return { valid: true, input };
}

export async function validateAndCreateReception(form: FormData, user: MockUser) {
  const t = getT();
  const fields = fieldsFrom(form);
  const validation = await validateReception(fields);
  if (!validation.valid) return fail(400, { message: validation.message, fields });

  try {
    const result = await receptions.create(validation.input, user);
    if ('error' in result) return fail(400, { message: result.error, fields });
    return { reception: result.ok };
  } catch {
    return fail(500, { message: t.errors.unexpected, fields });
  }
}

export async function validateAndUpdateReception(id: string, form: FormData, user: MockUser) {
  const t = getT();
  const fields = fieldsFrom(form);
  const validation = await validateReception(fields);
  if (!validation.valid) return fail(400, { message: validation.message, fields });

  try {
    const result = await receptions.update(id, validation.input, user);
    if ('error' in result) return fail(400, { message: result.error, fields });
    return { reception: result.ok };
  } catch {
    return fail(500, { message: t.errors.unexpected, fields });
  }
}
