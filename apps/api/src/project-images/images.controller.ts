import {
  Body,
  Controller,
  Delete,
  Module,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_UPLOAD_BYTES, imagePatchSchema, imageOrderSchema } from '@buhariy/contracts';
import { Roles } from '../auth/security';
import { Validate } from '../common/http';
import { ImagesService } from './images.service';
@Controller('admin/projects/:projectId/images')
@Roles('ADMIN', 'EDITOR')
export class ImagesController {
  constructor(private service: ImagesService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  upload(@Param('projectId') p: string, @UploadedFile() f: Express.Multer.File) {
    return this.service.upload(p, f);
  }
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  replace(
    @Param('projectId') p: string,
    @Param('id') id: string,
    @UploadedFile() f: Express.Multer.File,
  ) {
    return this.service.upload(p, f, id);
  }
  @Patch('reorder') reorder(
    @Param('projectId') p: string,
    @Body(new Validate(imageOrderSchema)) b: { ids: string[] },
  ) {
    return this.service.reorder(p, b.ids);
  }
  @Patch(':id') update(
    @Param('projectId') p: string,
    @Param('id') id: string,
    @Body(new Validate(imagePatchSchema)) b: { alt?: string; isCover?: true },
  ) {
    return this.service.update(p, id, b);
  }
  @Delete(':id') remove(@Param('projectId') p: string, @Param('id') id: string) {
    return this.service.remove(p, id);
  }
}
@Module({ controllers: [ImagesController], providers: [ImagesService] })
export class ImagesModule {}
