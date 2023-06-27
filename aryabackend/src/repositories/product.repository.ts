import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyThroughRepositoryFactory,
} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {
  Product,
  ProductRelations,
  Variation,
  ProductVariation,
} from '../models';
import {ProductVariationRepository} from './product-variation.repository';
import {VariationRepository} from './variation.repository';
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
  public readonly variations: HasManyThroughRepositoryFactory<
    Variation,
    typeof Variation.prototype.id,
    ProductVariation,
    typeof Product.prototype.id
  >;

  constructor(
    @inject('datasources.arya') dataSource: AryaDataSource,
    @repository.getter('ProductVariationRepository')
    protected productVariationRepositoryGetter: Getter<ProductVariationRepository>,
    @repository.getter('VariationRepository')
    protected variationRepositoryGetter: Getter<VariationRepository>,
  ) {
    super(Product, dataSource);
    this.variations = this.createHasManyThroughRepositoryFactoryFor(
      'variations',
      variationRepositoryGetter,
      productVariationRepositoryGetter,
    );
    this.registerInclusionResolver(
      'variations',
      this.variations.inclusionResolver,
    );
  }
}
