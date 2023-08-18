import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {UnitOfMeasure, UnitOfMeasureRelations} from '../models';

export class UnitOfMeasureRepository extends DefaultCrudRepository<
  UnitOfMeasure,
  typeof UnitOfMeasure.prototype.guid,
  UnitOfMeasureRelations
> {
  constructor(
    @inject('datasources.arya') dataSource: AryaDataSource,
  ) {
    super(UnitOfMeasure, dataSource);
  }
}
