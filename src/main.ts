import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  //rutas /api/v2/controller
  app.setGlobalPrefix('api/v2');

  //Configurando los dtos a nivel global 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              //data que viene en el dto
      forbidNonWhitelisted: true,
      // transform: true,              //Para convertir los parametro a numero si deberian ser numeros para agregarlo en el dto
      // transformOptions: {
      //   enableImplicitConversion: true
      // }
    })
  );

  await app.listen(process.env.PORT);
  logger.log(`app running on port ${process.env.PORT}`);
}
bootstrap();
