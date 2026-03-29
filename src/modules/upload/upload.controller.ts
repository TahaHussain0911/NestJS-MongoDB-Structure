import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { SignedUrlDto, UploadFilesDto } from './dto/upload-file.dto';
import {
  SignedUrlResponseDto,
  UploadResponseDto,
} from './dto/upload-response.dto';
import { UploadService } from './upload.service';

@ApiTags('Uploads')
@ApiBearerAuth(SwaggerJwtAuth)
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('signed-url')
  @ApiOperation({
    summary: 'Get upload signed url for files',
  })
  @ApiOkResponse({
    type: [SignedUrlResponseDto],
  })
  async getFileSignedUrl(
    @Body() signedUrlDto: SignedUrlDto,
    @GetUser('_id') userId: string,
  ): Promise<SignedUrlResponseDto[]> {
    return this.uploadService.getFileSignedUrl(signedUrlDto, userId);
  }

  @Post('files')
  @ApiOperation({
    summary: 'Upload files',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: [UploadResponseDto],
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Body() body: UploadFilesDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser('_id') userId: string,
  ): Promise<UploadResponseDto[]> {
    const { keys } = body;
    return this.uploadService.uploadFiles(keys || [], files, userId);
  }
}
