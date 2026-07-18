import { ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    const queryToken = request.query?.token;

    if (!authorization && !queryToken) {
      return true;
    }

    return super.canActivate(context);
  }
}
