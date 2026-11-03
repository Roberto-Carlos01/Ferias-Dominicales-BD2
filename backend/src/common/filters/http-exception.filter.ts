import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Error interno del servidor';
    let details: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || message;
        if (Array.isArray(res.message)) {
          details = res.message.map((m: string) => ({ message: m }));
          message = 'Los datos enviados no son válidos';
        }
      }

      code = this.getCode(status);
    } else if (exception && typeof exception === 'object') {
      const dbErr = exception as any;
      // Capturar errores provocados por SIGNAL SQLSTATE '45000' en triggers y procedimientos de MySQL
      if (
        dbErr.sqlState === '45000' ||
        dbErr.errno === 1644 ||
        dbErr.code === 'ER_SIGNAL_EXCEPTION'
      ) {
        status = HttpStatus.BAD_REQUEST;
        code = 'TRIGGER_VALIDATION_ERROR';
        let rawMsg = String(dbErr.sqlMessage || dbErr.message || 'Error de validación en base de datos');
        // Limpiar prefijo Error: si existe para mayor claridad
        if (rawMsg.toLowerCase().startsWith('error: ')) {
          rawMsg = rawMsg.substring(7).trim();
        }
        message = rawMsg;
      } else if (dbErr.code === 'ER_DUP_ENTRY' || dbErr.errno === 1062) {
        status = HttpStatus.CONFLICT;
        code = 'DUPLICATE_ENTRY';
        message = 'El registro ya existe en el sistema';
      } else if (dbErr.code === 'ER_NO_REFERENCED_ROW_2' || dbErr.errno === 1452) {
        status = HttpStatus.BAD_REQUEST;
        code = 'FOREIGN_KEY_VIOLATION';
        message = 'El elemento relacionado no existe en la base de datos';
      }
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'ERROR';
  }
}
