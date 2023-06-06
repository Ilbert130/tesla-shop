import { Controller, Get, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetRawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto:LoginUserDto){
    return this.authService.login(loginUserDto);
  }


  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user);
  }



  @Get('private')
  // Los guard no se le crean instancia
  @UseGuards(AuthGuard(), UserRoleGuard)                       //Con esta configuracion sencilla hacemos que nuestra ruta sea privada
  testingPrivateRoute(                          //Estos valores vienen del guard. Del request y el token
    @GetUser() user:User,
    @GetUser('email') userEmail:string,
    @GetRawHeaders() rawHeaders:string[]
  ) {

    return {
      ok: true,
      messafe: 'Hola mundo Private',
      user,
      userEmail,
      rawHeaders
    }
  }

  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user:User
  ) {

    return {
      ok:true,
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin)     //Asi protegemos las rutas de una mejor manera con nest
  privateRoute3(
    @GetUser() user:User
  ) {

    return {
      ok:true,
      user
    }
  }

}
