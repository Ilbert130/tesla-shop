import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    //Esta es la data que viene SetMetadata
    const validRole:string[] = this.reflector.get(META_ROLES, context.getHandler())

    if(!validRole) return true;
    if(validRole.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if(!user)
      throw new BadRequestException('User not found');
    
    //Verificando los roles
    for(const role of user.roles) {
      if(validRole.includes(role)){
        return true;
      }
    }

    throw new ForbiddenException(`User ${user.fullName} need a valid role: ${validRole}`);
  }
}
