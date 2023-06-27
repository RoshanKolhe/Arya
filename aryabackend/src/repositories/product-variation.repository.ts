import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {ProductVariation, ProductVariationRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class ProductVariationRepository extends TimeStampRepositoryMixin<
  ProductVariation,
  typeof ProductVariation.prototype.id,
  Constructor<
    DefaultCrudRepository<
      ProductVariation,
      typeof ProductVariation.prototype.id,
      ProductVariationRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.arya') dataSource: AryaDataSource) {
    super(ProductVariation, dataSource);
  }
}
