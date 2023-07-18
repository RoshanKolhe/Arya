/* eslint-disable @typescript-eslint/naming-convention */
import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
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
import {Product} from '../models';
import {ProductRepository} from '../repositories';
import {inject} from '@loopback/core';
import {AryaDataSource} from '../datasources';
import {TallyHttpCallService} from '../services/tally-http-call';
import {STOCK_ITEM_XML} from '../helpers/getProductsTallyXml';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';

export class ProductController {
  constructor(
    @inject('datasources.arya')
    public dataSource: AryaDataSource,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @inject('service.tally.service')
    public tallyPostService: TallyHttpCallService,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/products')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async create(
    @requestBody() requestData: {product: Product; variations: any[]},
  ): Promise<any> {
    // const repo = new DefaultTransactionalRepository(Product, this.dataSource);
    // const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    // try {
    //   const {product, variations} = requestData;
    //   const createdProduct = await this.productRepository.create(product, {
    //     transaction: tx,
    //   });
    //   for (const variation of variations) {
    //     let existingVariation = await this.variationRepository.findOne({
    //       where: {name: variation.name},
    //     });
    //     if (!existingVariation) {
    //       const inputVariation = {
    //         name: variation.name,
    //       };
    //       existingVariation = await this.variationRepository.create(
    //         inputVariation,
    //       );
    //     }
    //     const productVariation = new ProductVariation({
    //       productId: createdProduct.id,
    //       variationId: existingVariation.id,
    //       mrp: variation.mrp,
    //       sellingPrice: variation.sellingPrice,
    //       sku: variation.sku,
    //       stock: variation.stock,
    //     });
    //     await this.productVariationRepository.create(productVariation, {
    //       transaction: tx,
    //     });
    //   }
    //   await tx.commit();
    //   return createdProduct;
    // } catch (err) {
    //   await tx.rollback();
    //   throw err;
    // }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/products/count')
  @response(200, {
    description: 'Product model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Product) where?: Where<Product>): Promise<Count> {
    return this.productRepository.count(where);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/products/sync')
  async syncProducts(): Promise<any> {
    try {
      const tallyXml = STOCK_ITEM_XML();
      const res: any = await this.tallyPostService.postTallyXML(tallyXml);
      const parsedXmlData = await this.tallyPostService.parseXmlToObjects(res);
      const repo = new DefaultTransactionalRepository(Product, this.dataSource);
      const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

      try {
        await this.productRepository.deleteAll(undefined, {
          transaction: tx,
        });

        const finalMappedObject: Product[] = parsedXmlData.map(
          (product: any) => {
            const mappedProduct: Product = new Product();
            mappedProduct.guid = product.GUID;
            mappedProduct.alterid = product.ALTERID;
            mappedProduct.name = product.NAME;
            mappedProduct.parent = product.PARENT || ' ';
            mappedProduct._parent = product._PARENT || ' ';
            mappedProduct.alias = product.ALIAS || null;
            mappedProduct.uom = product.UOM;
            mappedProduct._uom = product._UOM || ' ';
            mappedProduct.opening_balance = product.OPENINGBALANCE || 0;
            mappedProduct.opening_rate = product.OPENINGRATE || 0;
            mappedProduct.opening_value = product.OPENINGVALUE || 0;
            mappedProduct.gst_nature_of_goods = product.NATUREOFGOODS || null;
            mappedProduct.gst_hsn_code = product.HSNCODE || null;
            mappedProduct.gst_taxability = product.TAXABILITY || null;

            return mappedProduct;
          },
        );

        await this.productRepository.createAll(finalMappedObject, {
          transaction: tx,
        });

        await tx.commit();

        // Return success response
        return {
          success: true,
          message: 'Sync successful',
        };
      } catch (err) {
        await tx.rollback();
        throw new Error(
          'Error synchronizing products. Transaction rolled back.',
        );
      }
    } catch (error) {
      throw new HttpErrors.PreconditionFailed(error.message);
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/products/list')
  async find(
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.productRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async findById(@param.path.number('id') id: string): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new HttpErrors.NotFound('Product not found');
    }

    // Retrieve variations using the junction table
    // const productVariations = await this.productRepository
    //   .variations(id)
    //   .find();

    // // Map the variations to the product object
    // const updatedVariationsWithJunctionData = await Promise.all(
    //   productVariations.map(async res => {
    //     const variationData = await this.productVariationRepository.findOne({
    //       where: {
    //         productId: id,
    //         variationId: res.id,
    //       },
    //     });
    //     if (variationData) {
    //       return {
    //         name: res.name,
    //         id: res.id,
    //         ...variationData,
    //       };
    //     } else {
    //       return {
    //         name: res.name,
    //         id: res.id,
    //       };
    //     }
    //   }),
    // );

    return product;
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @patch('/api/products/{id}')
  @response(204, {
    description: 'Product PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() requestData: {product: Product; variations: any[]},
  ): Promise<any> {
    // const repo = new DefaultTransactionalRepository(Product, this.dataSource);
    // const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    // try {
    //   const {product, variations} = requestData;
    //   await this.productRepository.updateById(id, product, {transaction: tx});
    //   // Delete previous variations that are not included in the updated variations
    //   await this.productVariationRepository.deleteAll(
    //     {productId: id},
    //     {transaction: tx},
    //   );
    //   for (const variation of variations) {
    //     let existingVariation = await this.variationRepository.findOne({
    //       where: {name: variation.name},
    //     });
    //     if (!existingVariation) {
    //       const inputVariation = {
    //         name: variation.name,
    //       };
    //       existingVariation = await this.variationRepository.create(
    //         inputVariation,
    //         {transaction: tx},
    //       );
    //     }
    //     const productVariation = new ProductVariation({
    //       productId: id,
    //       variationId: existingVariation.id,
    //       mrp: variation.mrp,
    //       sellingPrice: variation.sellingPrice,
    //       sku: variation.sku,
    //       stock: variation.stock,
    //     });
    //     await this.productVariationRepository.create(productVariation, {
    //       transaction: tx,
    //     });
    //   }
    //   await tx.commit();
    //   return await Promise.resolve({
    //     success: true,
    //     message: 'Product updated successfully',
    //   });
    // } catch (err) {
    //   await tx.rollback();
    //   throw err;
    // }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @del('/api/products/{id}')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.number('id') guid: string): Promise<void> {
    await this.productRepository.deleteById(guid);
  }
}
