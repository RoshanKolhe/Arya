import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Product,
  UnitOfMeasure,
} from '../models';
import {ProductRepository} from '../repositories';

export class ProductUnitOfMeasureController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) { }

  @get('/products/{id}/unit-of-measure', {
    responses: {
      '200': {
        description: 'UnitOfMeasure belonging to Product',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UnitOfMeasure)},
          },
        },
      },
    },
  })
  async getUnitOfMeasure(
    @param.path.string('id') id: typeof Product.prototype.guid,
  ): Promise<UnitOfMeasure> {
    return this.productRepository.unitOfMeasure(id);
  }
}
