import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Ferias Dominicales API')
    .setDescription('API REST para la gestión de ferias dominicales en La Paz, Bolivia.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('Auth', 'Autenticación y registro de usuarios')
    .addTag('Usuarios', 'Gestión de usuarios (solo ADMIN)')
    .addTag('Me', 'Perfil y datos del usuario autenticado')
    .addTag('Ferias', 'Gestión de ferias')
    .addTag('Ubicaciones', 'Gestión de ubicaciones')
    .addTag('Stands', 'Gestión de stands por feria')
    .addTag('Expositores', 'Gestión de expositores')
    .addTag('Productos', 'Gestión de productos')
    .addTag('Exposiciones', 'Gestión de exposiciones')
    .addTag('Instituciones', 'Gestión de instituciones')
    .addTag('Participantes', 'Participantes de ferias (CONFORMAN)')
    .addTag('Organizadores', 'Organizadores de ferias (ORGANIZA)')
    .addTag('Patrocinadores', 'Patrocinadores de ferias (PATROCINA)')
    .addTag('Ofertas', 'Productos ofrecidos en stands (OFRECE)')
    .addTag('Dashboard', 'Estadísticas del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API corriendo en: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs en:  http://localhost:${port}/api/docs`);
}
bootstrap();
