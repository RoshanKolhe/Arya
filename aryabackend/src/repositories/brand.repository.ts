import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Brand, BrandRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class BrandRepository extends TimeStampRepositoryMixin<
  Brand,
  typeof Brand.prototype.id,
  Constructor<
    DefaultCrudRepository<Brand, typeof Brand.prototype.id, BrandRelations>
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.arya') dataSource: AryaDataSource) {
    super(Brand, dataSource);
  }
}
