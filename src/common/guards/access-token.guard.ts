import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request?.headers?.authorization as string;

    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      return token === process.env.ACCESS_TOKEN;
    }

    return false;
  }
}