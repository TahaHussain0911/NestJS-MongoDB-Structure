import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ObjectStorage } from './object-storage';

@Module({
  controllers: [UploadController],
  providers: [UploadService, ObjectStorage],
})
export class UploadModule {}
