import slugify from 'slugify';

export function DTOTrim({ value }) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

export function DTOBoolean({ value }) {
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return undefined;
}

export function createSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
  });
}
