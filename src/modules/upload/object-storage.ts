import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TypedConfigService } from 'src/config/typed-config.service';
import {
  MAX_FILE_SIZE,
  MIME_TYPES,
  READ_SIGNED_URL_EXPIRES_IN,
  UPLOAD_SIGNED_URL_EXPIRES_IN,
} from './lib/file.constant';
import { FileMetadataDto } from './dto/upload-file.dto';
import {
  SignedUrlResponseDto,
  UploadResponseDto,
} from './dto/upload-response.dto';
import { getFileSizeInMbs } from 'src/utils/helper';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ObjectStorage {
  private _client: S3Client;
  private _bucketName: string;
  private _allowedFileSize: number;
  private _allowedMimeTypes: string[];
  private _readSignedUrlExpiresIn: number;
  private _uploadSignedUrlExpiresIn: number;

  constructor(private readonly config: TypedConfigService) {
    this._client = new S3Client({
      region: config.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_S3_SECRET_KEY'),
      },
    });
    this._bucketName = config.get('AWS_S3_BUCKET_NAME');
    this._allowedFileSize = MAX_FILE_SIZE;
    this._readSignedUrlExpiresIn = READ_SIGNED_URL_EXPIRES_IN;
    this._uploadSignedUrlExpiresIn = UPLOAD_SIGNED_URL_EXPIRES_IN;
    this._allowedMimeTypes = Object.values(MIME_TYPES).flatMap((type) => {
      return Object.values(type);
    });
  }

  private _validateFileType(fileType: string) {
    return this._allowedMimeTypes.includes(fileType);
  }

  private _validateFileSize(fileSize: number) {
    return this._allowedFileSize < fileSize;
  }

  private _generateFileName(fileName: string) {
    const clean = fileName.replace(/\s+/g, '-').toLowerCase();
    const extIndex = clean.lastIndexOf('.');
    const base = extIndex !== -1 ? clean.slice(0, extIndex) : clean;
    const ext = extIndex !== -1 ? clean.slice(extIndex) : '';
    const date = new Date().toISOString();
    return `${base}-${date}${ext}`;
  }

  private _getKey(keys: string[], fileName: string) {
    const cleanFileName = this._generateFileName(fileName);
    return `${keys.join('/')}/${cleanFileName}`;
  }

  async getFileSignedUrl(
    keys: string[] = [],
    files: FileMetadataDto[],
    userId?: string,
  ): Promise<SignedUrlResponseDto[]> {
    const results: SignedUrlResponseDto[] = [];
    for (const file of files) {
      if (!this._validateFileType(file.fileType)) {
        throw new BadRequestException(
          `Invalid file type for file ${file.fileName}`,
        );
      }
      if (!this._validateFileSize(file.fileSize)) {
        throw new BadRequestException(
          `Invalid file size. Allowed file size is ${getFileSizeInMbs(this._allowedFileSize)}mbs. Requested ${getFileSizeInMbs(file.fileSize)}`,
        );
      }
      const key = this._getKey(keys, file.fileName);
      const command = new PutObjectCommand({
        Bucket: this._bucketName,
        Key: key,
        ContentLength: file.fileSize,
        ContentType: file.fileType,
        Metadata: {
          ...(userId && { userId: String(userId) }),
          originalFileName: file.fileName,
          date: new Date().toISOString(),
        },
      });
      const url = await getSignedUrl(this._client, command, {
        expiresIn: this._uploadSignedUrlExpiresIn,
      });
      results.push({
        key,
        url,
      });
    }
    return results;
  }

  async uploadFiles(
    keys: string[] = [],
    files: Express.Multer.File[],
    userId?: string,
  ): Promise<UploadResponseDto[]> {
    const result: UploadResponseDto[] = [];
    for (const file of files) {
      if (!this._validateFileType(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type for file ${file.filename}`,
        );
      }
      if (!this._validateFileSize(file.size)) {
        throw new BadRequestException(
          `Invalid file size. Allowed file size is ${getFileSizeInMbs(this._allowedFileSize)}mbs. Requested ${getFileSizeInMbs(file.size)}`,
        );
      }
      const key = this._getKey(keys, file.filename);
      const command = new PutObjectCommand({
        Bucket: this._bucketName,
        Key: key,
        ContentLength: file.size,
        ContentType: file.mimetype,
        Body: file.buffer,
        Metadata: {
          ...(userId && { userId: String(userId) }),
          originalFileName: file.filename,
          date: new Date().toISOString(),
        },
      });
      await this._client.send(command);
      result.push({
        fileName: file.filename,
        key,
      });
    }
    return result;
  }

  async readFile(key: string): Promise<SignedUrlResponseDto> {
    try {
      const command = new GetObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      });
      const url = await getSignedUrl(this._client, command, {
        expiresIn: this._readSignedUrlExpiresIn,
      });
      return {
        key,
        url,
      };
    } catch (error) {
      console.log(error, 'error');
      throw new BadRequestException('File not found');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      });
      await this._client.send(command);
    } catch (error) {
      console.log(error, 'error');
      throw new BadRequestException('File not found');
    }
  }
}
