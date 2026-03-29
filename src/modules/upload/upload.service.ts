import { Injectable } from '@nestjs/common';
import { ObjectStorage } from './object-storage';
import {
  SignedUrlResponseDto,
  UploadResponseDto,
} from './dto/upload-response.dto';
import { SignedUrlDto } from './dto/upload-file.dto';

@Injectable()
export class UploadService {
  constructor(private readonly objectStorage: ObjectStorage) {}

  async getFileSignedUrl(
    signedUrlDto: SignedUrlDto,
    userId: string,
  ): Promise<SignedUrlResponseDto[]> {
    return this.objectStorage.getFileSignedUrl(
      signedUrlDto.keys,
      signedUrlDto.files,
      userId,
    );
  }

  async uploadFiles(
    keys: string[],
    files: Express.Multer.File[],
    userId: string,
  ): Promise<UploadResponseDto[]> {
    return this.objectStorage.uploadFiles(keys, files, userId);
  }

  async readFile(key: string): Promise<SignedUrlResponseDto> {
    return this.objectStorage.readFile(key);
  }

  async deleteFile(key: string): Promise<void> {
    return this.objectStorage.deleteFile(key);
  }
}
