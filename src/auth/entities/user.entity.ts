import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique:true
    })
    email:string;

    @Column('text', {
                            //Indicates if column is always selected by QueryBuilder and find operations. Default value is "true".
        select:false        //De no ser asi, no devuelve esta propiedad cuando usamos find y querybuilder
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        default:true
    })
    isActive: boolean;

    @Column('text', {
        array:true,
        default: ['user']
    })
    roles: string[];
}
