import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

function bootstrap() {
  (async () => {
    try {
      let httpsOptions = null;
      if (process.env.NODE_ENV === 'production') {
        httpsOptions = {
          key: fs.readFileSync('/etc/letsencrypt/live/zeriong.com/privkey.pem'),
          cert: fs.readFileSync('/etc/letsencrypt/live/zeriong.com/cert.pem'),
          ca: fs.readFileSync('/etc/letsencrypt/live/zeriong.com/chain.pem'),
        };
      }

      const app = await NestFactory.create(AppModule, { httpsOptions });

      app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
      });

      app.use(cookieParser());

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
          forbidUnknownValues: false,
        }),
      );

      /** Swagger */
      const config = new DocumentBuilder().setTitle('Zete').setDescription('메모 서비스').setVersion('v1').build();
      const document = SwaggerModule.createDocument(app, config, {
        // 프론트의 코드젠 전략을 위한 operationId 커스텀
        operationIdFactory: (controllerKey, methodKey) => `${methodKey}`,
      });

      if (process.env.NODE_ENV !== 'production') {
        SwaggerModule.setup('api-docs', app, document, { yamlDocumentUrl: 'api-yaml' });
      }

      await app.listen(process.env.PORT);

      console.log('***************************************');
      console.log('web start ', process.env.NODE_ENV, process.env.PORT);
      console.log('***************************************');
    } catch (e) {
      console.log(e);
    }
  })();
}
bootstrap();
