import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import multer, { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService:ConfigService
  ) {}


  @Get('product/:imageName')
  findProductImage(
    @Res() res:Response,                        //Response. Con este decorador se configura manualmente la respuesta de la aplicacion en ese endpoint
    @Param('imageName') imageName:string
  ){

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }




  //Endpoint para subir archivos
  @Post('product')                          //FileInterceptor resive dos parametros, el nombre del archio como se envia y la referencia a la funcion para hacer la validacion               
  @UseInterceptors(FileInterceptor('file', {              //El interseptor nos ayuda a validar si es un archivo del tipo que deseamos
    fileFilter: fileFilter,                               //Mandamos la referencia de la funcion que creamos. Esto para filtrar nuestro archivo
    // limits: {fileSize:1000}
    storage: diskStorage({                                //Con esta propidad guardamos los archivo en una rata especifica con filesystem
      destination: './static/products',    
      filename: fileNamer                                 //Esto hace referencia al nombre del archivo, cual se colocara
    })
  }))                                                     //usamos un interceptor para decirle al endpoint que resivira un archivo llamado file
  uploadProductImage(                                      
    @UploadedFile() file:Express.Multer.File,             //usamos el decorador @UploadedFile para indicar que el parametro es un archivo
  ){

    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('host_api')}/files/product/${file.filename}`;

    return { secureUrl };
  }
}
