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
