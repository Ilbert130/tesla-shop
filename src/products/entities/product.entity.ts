import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    //Estableciendo la llave primaria
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //Creando las otras columnas
    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('numeric', {
        default: 0
    })
    price: number;

    //Otra manera de hacer la configuracion de la columna
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true
    })
    slug: string

    @Column('int', {
        default: 0
    })
    sctock: number;

    @Column('text', {
        array: true
    })
    sizes: string[]

    @Column('text')
    gender: string;
}