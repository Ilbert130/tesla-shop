import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';


@Entity({name: 'product_images'})
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    //hacendo la relacion, clave forania y esta es una columna
    @ManyToOne(
        () => Product,
        product => product.images,
        //Cuando se borra un producto se borre en cascada las imagenes
        {onDelete:'CASCADE'}
    )
    product: Product
}