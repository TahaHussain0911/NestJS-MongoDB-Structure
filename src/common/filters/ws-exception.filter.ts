import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    let message = 'Internal server error';
    let statusCode = 500;

    if (exception instanceof WsException) {
      const error = exception.getError();
      message = typeof error === 'string' ? error : (error as any)?.message;

      this.logger.warn(`WS Exception: ${message}`);
    } 
    else if (exception instanceof HttpException) {
      const response = exception.getResponse();
      statusCode = exception.getStatus();

      message =
        typeof response === 'string'
          ? response
          : (response as any)?.message || exception.message;

      this.logger.warn(`HTTP Exception: ${statusCode} - ${message}`);
    } 
    else {
      // Unknown/unhandled error
      this.logger.error(
        `Unhandled Exception: ${exception}`,
        (exception as any)?.stack,
      );
    }

    client.emit('error', {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  }
}