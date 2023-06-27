import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Variation, VariationRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class VariationRepository extends TimeStampRepositoryMixin<
  Variation,
  typeof Variation.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Variation,
      typeof Variation.prototype.id,
      VariationRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.arya') dataSource: AryaDataSource) {
    super(Variation, dataSource);
  }
}
