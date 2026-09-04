import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    // If roles are required but user is not authenticated, deny access
    if (!user) return false;
    
    // Check if user has one of the required roles
    return requiredRoles.includes(user.role);
  }
}
