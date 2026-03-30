import { Param } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

export function ObjectIdParam(id: string) {
  return Param(id, ParseObjectIdPipe);
}
