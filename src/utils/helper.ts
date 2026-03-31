import { Types } from 'mongoose';
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

export function convertStringToMongoIds(value: string[]): Types.ObjectId[];
export function convertStringToMongoIds(
  value: string,
): Types.ObjectId | undefined;

export function convertStringToMongoIds(
  value: string[] | string,
): Types.ObjectId | Types.ObjectId[] | undefined {
  if (Array.isArray(value)) {
    return value.flatMap((id) => {
      try {
        return [new Types.ObjectId(id)];
      } catch (error) {
        return [];
      }
    });
  } else {
    try {
      return new Types.ObjectId(value);
    } catch (error) {
      return undefined;
    }
  }
}
export function getFileSizeInMbs(size: number) {
  return Math.round(size / 1024 / 1024);
}

export function generateOrderNumber(): string {
  const prefix = 'ORD';
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join('');
  const today = new Date();
  const date = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${letters}-${date}-${randomCode}`;
}
