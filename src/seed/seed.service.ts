import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import * as bcrypt from "bcrypt";             //Opteniendo todo

@Injectable()
export class SeedService {
  
  constructor(
    private readonly productsService:ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){

  }

  //Corriendo el seed
  async runSeed() {

    await this.deleteTable();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);

    return 'Seed Executed'
  }

  //Eliminar tablas
  private async deleteTable() {

    await this.productsService.deleteAllProducts();

    //Eliminando todos los usuarios
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

  //Insertar usuarios
  private async insertUsers() {

    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach( user => {
      user.password = bcrypt.hashSync(user.password, 10)
      users.push(this.userRepository.create(user))
    });

    const dbUsers = await this.userRepository.save(users); //Le pasamos el arreglo de usuarios
    return dbUsers[0];
  }


  //Insertar productos
  private async insertNewProducts(user:User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
