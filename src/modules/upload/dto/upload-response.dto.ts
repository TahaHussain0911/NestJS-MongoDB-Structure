import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  fileName: string;
}

export class SignedUrlResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;
}
