import {inject, Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Product, ProductRelations, UnitOfMeasure} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UnitOfMeasureRepository} from './unit-of-measure.repository';

export class ProductRepository extends TimeStampRepositoryMixin<
  Product,
  typeof Product.prototype.guid,
  Constructor<
    DefaultCrudRepository<
      Product,
      typeof Product.prototype.guid,
      ProductRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly unitOfMeasure: BelongsToAccessor<UnitOfMeasure, typeof Product.prototype.guid>;

  constructor(@inject('datasources.arya') dataSource: AryaDataSource, @repository.getter('UnitOfMeasureRepository') protected unitOfMeasureRepositoryGetter: Getter<UnitOfMeasureRepository>,) {
    super(Product, dataSource);
    this.unitOfMeasure = this.createBelongsToAccessorFor('unitOfMeasure', unitOfMeasureRepositoryGetter,);
    this.registerInclusionResolver('unitOfMeasure', this.unitOfMeasure.inclusionResolver);
  }
}
