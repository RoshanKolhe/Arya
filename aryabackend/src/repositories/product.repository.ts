import {inject, Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Product, ProductRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class ProductRepository extends TimeStampRepositoryMixin<
  Product,
  typeof Product.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Product,
      typeof Product.prototype.id,
      ProductRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.arya') dataSource: AryaDataSource) {
    super(Product, dataSource);
  }
}
