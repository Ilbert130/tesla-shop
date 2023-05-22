import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');          //Propiedad para mostrar los logs como lo hace nest en la consola

  constructor(
    @InjectRepository(Product)                                      //Asi usamos el patron repositorio en nest
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {

    try {

      // if(!createProductDto.slug) {
      //   createProductDto.slug = createProductDto.title
      //     .toLowerCase()
      //     .replaceAll(' ','_')
      //     .replaceAll("'",'')
      // }else{
      //   createProductDto.slug = createProductDto.slug
      //     .toLowerCase()
      //     .replaceAll(' ','_')
      //     .replaceAll("'",'')
      // }

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
      
    } catch (error) {

      //Controladon las excepciones
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {

    try {

      const {limit = 10, offset = 0} = paginationDto;

      const products = await this.productRepository.find({
        take:limit,
        skip:offset,
        //TODO: Relaciones
      });

      return products;
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(term: string) {
    
    let product:Product;

    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id: term});
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder();
      
      //Construyendo un query
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {  //En el where tu construyes la condicion
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne();
    }

    if(!product)
      throw new NotFoundException(`Product not found`);

    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const produtRemove = await this.productRepository.findOneBy({id});
    
    if(!produtRemove)
      throw new NotFoundException(`Product with id ${id} not found`);
    
    await this.productRepository.remove(produtRemove);
    return produtRemove;
  }

  private handleDBExceptions(error:any) {
    //Esto es una mejora manera de manejar los errores
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error); 
    throw new InternalServerErrorException('Unexpected error, check server log!');
  }
}
