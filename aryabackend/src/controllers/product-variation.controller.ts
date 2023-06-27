import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
  import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
Product,
ProductVariation,
Variation,
} from '../models';
import {ProductRepository} from '../repositories';

export class ProductVariationController {
  constructor(
    @repository(ProductRepository) protected productRepository: ProductRepository,
  ) { }

  @get('/products/{id}/variations', {
    responses: {
      '200': {
        description: 'Array of Product has many Variation through ProductVariation',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Variation)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Variation>,
  ): Promise<Variation[]> {
    return this.productRepository.variations(id).find(filter);
  }

  @post('/products/{id}/variations', {
    responses: {
      '200': {
        description: 'create a Variation model instance',
        content: {'application/json': {schema: getModelSchemaRef(Variation)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Product.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Variation, {
            title: 'NewVariationInProduct',
            exclude: ['id'],
          }),
        },
      },
    }) variation: Omit<Variation, 'id'>,
  ): Promise<Variation> {
    return this.productRepository.variations(id).create(variation);
  }

  @patch('/products/{id}/variations', {
    responses: {
      '200': {
        description: 'Product.Variation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Variation, {partial: true}),
        },
      },
    })
    variation: Partial<Variation>,
    @param.query.object('where', getWhereSchemaFor(Variation)) where?: Where<Variation>,
  ): Promise<Count> {
    return this.productRepository.variations(id).patch(variation, where);
  }

  @del('/products/{id}/variations', {
    responses: {
      '200': {
        description: 'Product.Variation DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Variation)) where?: Where<Variation>,
  ): Promise<Count> {
    return this.productRepository.variations(id).delete(where);
  }
}
