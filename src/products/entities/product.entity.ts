import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})         //Cambiando el nombre
export class Product {

    @ApiProperty({
        example: '5be9da45-0025-48cd-9fa0-6b565fc73f02',
        description: 'Product ID',
        uniqueItems: true
    })
    //Estableciendo la llave primaria
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shit Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    //Creando las otras columnas
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price'
    })                      //Las propiedades que se documentaran como respuestas
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Una descripcion',
        description: 'Product description',
    })
    //Otra manera de hacer la configuracion de la columna
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty()
    @Column('text', {
        unique: true
    })
    slug: string

    @ApiProperty()
    @Column('int', {
        default: 0
    })
    sctock: number;

    @ApiProperty({
        example: ['S','M','X'],
        description: 'Product Size'
    })
    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty()
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    //Esto es una relacion
    //hacendo la relacion, clave forania
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        //eager es para cargar las relaciones (cargar la data) con cualquier find
        {cascade:true, eager: true}
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        user => user.product,
        {eager:true}            //para cargar la relacion
    )
    user:User


    //Before insert
    @BeforeInsert() 
    checkSlugInsert() {

        if(!this.slug){
            this.slug = this.title
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }
}
