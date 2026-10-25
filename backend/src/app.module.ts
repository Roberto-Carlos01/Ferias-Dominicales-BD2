import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FeriasModule } from './ferias/ferias.module';
import { UbicacionesModule } from './ubicaciones/ubicaciones.module';
import { StandsModule } from './stands/stands.module';
import { ExpositoresModule } from './expositores/expositores.module';
import { ProductosModule } from './productos/productos.module';
import { ExposicionesModule } from './exposiciones/exposiciones.module';
import { InstitucionesModule } from './instituciones/instituciones.module';
import { ParticipantesModule } from './participantes/participantes.module';
import { OrganizadoresModule } from './organizadores/organizadores.module';
import { PatrocinadoresModule } from './patrocinadores/patrocinadores.module';
import { OfertasModule } from './ofertas/ofertas.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        database: config.get('DB_DATABASE', 'bdferias'),
        username: config.get('DB_USERNAME', 'feriauser'),
        password: config.get('DB_PASSWORD', 'feriapass'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        charset: 'utf8mb4',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    FeriasModule,
    UbicacionesModule,
    StandsModule,
    ExpositoresModule,
    ProductosModule,
    ExposicionesModule,
    InstitucionesModule,
    ParticipantesModule,
    OrganizadoresModule,
    PatrocinadoresModule,
    OfertasModule,
    DashboardModule,
  ],
})
export class AppModule {}
