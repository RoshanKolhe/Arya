import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  IsolationLevel,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Product, ProductVariation} from '../models';
import {
  ProductRepository,
  ProductVariationRepository,
  VariationRepository,
} from '../repositories';
import {inject} from '@loopback/core';
import {AryaDataSource} from '../datasources';

export class ProductController {
  constructor(
    @inject('datasources.arya')
    public dataSource: AryaDataSource,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(VariationRepository)
    private variationRepository: VariationRepository,
    @repository(ProductVariationRepository)
    private productVariationRepository: ProductVariationRepository,
  ) {}

  @post('/api/products')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async create(
    @requestBody() requestData: {product: Product; variations: any[]},
  ): Promise<Product> {
    const repo = new DefaultTransactionalRepository(Product, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const {product, variations} = requestData;

      const createdProduct = await this.productRepository.create(product, {
        transaction: tx,
      });

      for (const variation of variations) {
        let existingVariation = await this.variationRepository.findOne({
          where: {name: variation.name},
        });

        if (!existingVariation) {
          const inputVariation = {
            name: variation.name,
          };
          existingVariation = await this.variationRepository.create(
            inputVariation,
          );
        }
        const productVariation = new ProductVariation({
          productId: createdProduct.id,
          variationId: existingVariation.id,
          mrp: variation.mrp,
          sellingPrice: variation.sellingPrice,
          sku: variation.sku,
          stock: variation.stock,
        });

        await this.productVariationRepository.create(productVariation, {
          transaction: tx,
        });
      }
      await tx.commit();
      return createdProduct;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @get('/api/products/count')
  @response(200, {
    description: 'Product model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Product) where?: Where<Product>): Promise<Count> {
    return this.productRepository.count(where);
  }

  @get('/api/products')
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {type: 'array', items: getModelSchemaRef(Product)},
      },
    },
  })
  async find(): Promise<any[]> {
    const products = await this.productRepository.find();

    // Retrieve variations for each product using the junction table
    const productsWithVariations = await Promise.all(
      products.map(async product => {
        const productVariations = await this.productRepository
          .variations(product.id)
          .find();

        const updatedVariationsWithJunctionData = await Promise.all(
          productVariations.map(async res => {
            const variationData = await this.productVariationRepository.findOne(
              {
                where: {
                  productId: product.id,
                  variationId: res.id,
                },
              },
            );

            if (variationData) {
              return {
                name: res.name,
                id: res.id,
                ...variationData,
              };
            } else {
              return {
                name: res.name,
                id: res.id,
              };
            }
          }),
        );

        return {
          ...product,
          productVariations: updatedVariationsWithJunctionData,
        };
      }),
    );

    return productsWithVariations;
  }

  @get('/api/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async findById(@param.path.number('id') id: number): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new HttpErrors.NotFound('Product not found');
    }

    // Retrieve variations using the junction table
    const productVariations = await this.productRepository
      .variations(id)
      .find();

    // Map the variations to the product object
    const updatedVariationsWithJunctionData = await Promise.all(
      productVariations.map(async res => {
        const variationData = await this.productVariationRepository.findOne({
          where: {
            productId: id,
            variationId: res.id,
          },
        });
        if (variationData) {
          return {
            name: res.name,
            id: res.id,
            ...variationData,
          };
        } else {
          return {
            name: res.name,
            id: res.id,
          };
        }
      }),
    );

    return {...product, productVariations: updatedVariationsWithJunctionData};
  }

  @patch('/api/products/{id}')
  @response(204, {
    description: 'Product PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() requestData: {product: Product; variations: any[]},
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(Product, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const {product, variations} = requestData;

      await this.productRepository.updateById(id, product, {transaction: tx});

      // Delete previous variations that are not included in the updated variations
      await this.productVariationRepository.deleteAll(
        {productId: id},
        {transaction: tx},
      );

      for (const variation of variations) {
        let existingVariation = await this.variationRepository.findOne({
          where: {name: variation.name},
        });

        if (!existingVariation) {
          const inputVariation = {
            name: variation.name,
          };
          existingVariation = await this.variationRepository.create(
            inputVariation,
            {transaction: tx},
          );
        }

        const productVariation = new ProductVariation({
          productId: id,
          variationId: existingVariation.id,
          mrp: variation.mrp,
          sellingPrice: variation.sellingPrice,
          sku: variation.sku,
          stock: variation.stock,
        });
        await this.productVariationRepository.create(productVariation, {
          transaction: tx,
        });
      }
      await tx.commit();
      return await Promise.resolve({
        success: true,
        message: 'Product updated successfully',
      });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @del('/api/products/{id}')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.productRepository.deleteById(id);
  }
}
