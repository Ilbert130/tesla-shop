import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, Injectable } from '@nestjs/common';


//Creando la estrategia de implementacion para obtener el payload
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        configService:ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload:JwtPayload):Promise<User> {

        const {id} = payload;
        const user = await this.userRepository.findOneBy({id, isActive:true});

        if(!user)
            throw new UnauthorizedException('Token not valid');

        //Esto se agregara al request
        return user;
    }

}