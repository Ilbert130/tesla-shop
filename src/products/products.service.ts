import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

  //Se le pasa el nombre de la clase en el controlador
  private readonly logger = new Logger('ProductsService');          //Propiedad para mostrar los logs como lo hace nest en la consola

  constructor(
    @InjectRepository(Product)                                      //Asi usamos el patron repositorio en nest
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //Para usar el queryRunner
    private readonly dataSource: DataSource,

  ){}

  //POST
  async create(createProductDto: CreateProductDto) {

    try {

      const  { images = [], ...productDetails} = createProductDto;

      //Asi creamos las imagenes y los productos 
      const product = this.productRepository.create({
        ...productDetails,
        //No colocamos el id porque typeorm lo infiere aqui
        images: images.map(image => this.productImageRepository.create({url: image}))
      });

      //Este await guarda los productos como las imagenes
      await this.productRepository.save(product);

      return {...product, images};
      
    } catch (error) {

      //Controladon las excepciones
      this.handleDBExceptions(error);
    }
  }

  //GET
  async findAll(paginationDto:PaginationDto) {

    try {

      const {limit = 10, offset = 0} = paginationDto;

      const products = await this.productRepository.find({
        take:limit,
        skip:offset,
        //Indicando al producto que traiga las imagenes con la que esta relacionado
        // relations: {         //si activamos el eager en la entidad no tenemos que hacer esto
        //   images: true
        // }
      });

      //Usando producto como spret y sobreescribiendo la propiedad images
      return products.map(producto => ({
        ...producto,
        images: producto.images.map(img => img.url)
      }));
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //GET BY
  async findOne(term: string) {
    
    let product:Product;

    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id: term});
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      
      //Construyendo un query
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {  //En el where tu construyes la condicion
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        //Cuando usamos queryBulder tenemos que usar este metodo para mostrar las relaciones
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if(!product)
      throw new NotFoundException(`Product not found`);

    return product;
  }


  //Metodo para devolver solo las url de las imagenes con su producto indevidual
  async findOnePlain(term: string) {
    const {images = [], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  //UPDATE
  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    });

    if(!product){
      throw new NotFoundException(`Product with Id ${id} not found`);
    }

    //Create query runner. Este nos permitira hacer multiples ejecuciones de query para 
    //insertar y actualizar en diferentes base de datos. Nos permite hacer rollback.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();             //Conectando a la base de datos 
    await queryRunner.startTransaction();    //Empezando las transacciones

    try {

      if(images){

        await queryRunner.manager.delete(ProductImage, {product: {id}});
        product.images = images.map(img => this.productImageRepository.create({url:img}));

      }

      await queryRunner.manager.save(product);  //Guarda la imagen y el producto
      await queryRunner.commitTransaction();    //Hacemos commit de la transaccion para guardar los cambios
      await queryRunner.release();              //Liberamos el query runner
      // await this.productRepository.save(product);
      return this.findOnePlain(id);

    } catch (error) {

      await queryRunner.rollbackTransaction();  //Desaciendo todo los querys
      await queryRunner.release();              //Liberamos el query runner
      this.handleDBExceptions(error);
    }

  }

  //DELETE
  async remove(id: string) {
    const produtRemove = await this.productRepository.findOneBy({id});
    
    if(!produtRemove)
      throw new NotFoundException(`Product with id ${id} not found`);
    
    await this.productRepository.remove(produtRemove);
    return produtRemove;
  }

  //To handle exceptions
  private handleDBExceptions(error:any) {
    //Esto es una mejora manera de manejar los errores
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error); 
    throw new InternalServerErrorException('Unexpected error, check server log!');
  }

  //to delete all the products in the tablets image and product
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {

      //Para eliminar todo los productos con la imagen sin problema
      return await query
        .delete()
        .where({})
        .execute();
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
