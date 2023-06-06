import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";             //Opteniendo todo
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService:JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
    try {

      const {password, ...userData} =createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10) //Le pasamos la password y la salt que sera generada con el numero indicado (10)
      });

      await this.userRepository.save(user);
      delete user.password; //Asi eliminamos una propiedad de un objeto

      //Devolviendo el usuario con el jwt
      return {
        ...user,
        token: this.getJwtToken({id:user.id})
      };

    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async login(loginUserDto:LoginUserDto){
    
    const {password, email} = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {email},                                            //Condicion de busqueda
      select: {id:true, email: true, password: true}             //Indicando los campos que queremos que nos traiga la consulta
    });

    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    //Devolviendo el usuario con el jwt
    return {
      ...user,
      token: this.getJwtToken({id:user.id})
    };
  }

  async checkAuthStatus(user:User){
    
    const {id, email, password, fullName} = user;

    return {
      id,
      email,
      password,
      fullName,
      token: this.getJwtToken({id:user.id})
    };
  }

  //Metodo para generar el jwt
  private getJwtToken(payload: JwtPayload){

    //generando el token
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDbErrors(error:any):never {
    
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs')
  }

}
