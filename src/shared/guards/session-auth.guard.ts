import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../domains/user/user.entity';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    try {
      // For now, we'll treat the sessionId as a simple token
      // In a production app, you'd want to store sessions in Redis or a database
      // and validate them properly with expiration checks
      
      // For this POC, we'll use the sessionId to find a user
      // This is a simplified approach - normally you'd store sessions separately
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Invalid token format',
        });
      }

      const sessionId = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // For now, we'll mock the session validation by finding any active user
      // In a real app, you'd query a sessions table
      const user = await this.userRepository.findOne({
        where: { status: UserStatus.ACTIVE },
        relations: ['tenant'],
      });

      if (!user) {
        throw new UnauthorizedException({
          code: 'INVALID_SESSION',
          message: 'Session is invalid or expired',
        });
      }

      // Attach user info to request for use in controllers
      request.user = {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_FAILED',
        message: 'Authentication failed',
      });
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}