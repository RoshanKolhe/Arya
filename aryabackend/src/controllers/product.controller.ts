/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {Product, UnitOfMeasure} from '../models';
import {ProductRepository, UnitOfMeasureRepository} from '../repositories';
import {inject} from '@loopback/core';
import {AryaDataSource} from '../datasources';
import {TallyHttpCallService} from '../services/tally-http-call';
import {STOCK_ITEM_XML} from '../helpers/getProductsTallyXml';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {MASTER_UOM_XML} from '../helpers/getMasterUom';
import {STOCK_ITEM_EXTRA_XML} from '../helpers/getProductExtraDetailsXml';

export class ProductController {
  constructor(
    @inject('datasources.arya')
    public dataSource: AryaDataSource,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(UnitOfMeasureRepository)
    public uomRepository: UnitOfMeasureRepository,
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
      const stockItemExtraXml = STOCK_ITEM_EXTRA_XML();
      const uomXml = MASTER_UOM_XML();
      const res: any = await this.tallyPostService.postTallyXML(tallyXml);
      const stockItemExtraData = await this.tallyPostService.postTallyXML(
        stockItemExtraXml,
      );
      const uomRes: any = await this.tallyPostService.postTallyXML(uomXml);

      const parsedXmlData = await this.tallyPostService.parseXmlToObjects(res);
      const parsedUomData =
        await this.tallyPostService.parseXmlUomToObjectArray(uomRes);
      const parsedStockExtraXmlData =
        await this.tallyPostService.parseExtraStockXmlToObjects(
          stockItemExtraData,
        );
      const repo = new DefaultTransactionalRepository(Product, this.dataSource);
      const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

      try {
        await this.productRepository.deleteAll(undefined, {
          transaction: tx,
        });

        await this.uomRepository.deleteAll(undefined, {
          transaction: tx,
        });

        const finalMappedObject: Product[] = parsedXmlData.map(
          (product: any) => {
            const filteredObject = parsedStockExtraXmlData.filter(
              (stockItem: any) => stockItem.guid === product.GUID,
            );
            const mappedProduct: Product = new Product();
            mappedProduct.guid = product.GUID;
            mappedProduct.alterid = product.ALTERID;
            mappedProduct.name = product.NAME;
            mappedProduct.parent = product.PARENT || ' ';
            mappedProduct._parent = product._PARENT || ' ';
            mappedProduct.alias = product.ALIAS || null;
            mappedProduct.uom = product.UOM;
            mappedProduct.unitOfMeasureId = product._UOM || ' ';
            mappedProduct.opening_balance = product.OPENINGBALANCE || 0;
            mappedProduct.opening_rate = product.OPENINGRATE || 0;
            mappedProduct.opening_value = product.OPENINGVALUE || 0;
            mappedProduct.gst_nature_of_goods = product.NATUREOFGOODS || null;
            mappedProduct.gst_hsn_code = product.HSNCODE || null;
            mappedProduct.gst_taxability = product.TAXABILITY || null;
            mappedProduct.cgst = filteredObject[0].cgst;
            mappedProduct.sgstOrUtgst = filteredObject[0].sgstOrUtgst;
            mappedProduct.cess = filteredObject[0].cess;
            mappedProduct.igst = filteredObject[0].igst;
            mappedProduct.stateCess = filteredObject[0].stateCess;
            mappedProduct.retailerMargin = filteredObject[0].retailerMargin;
            mappedProduct.distributorMargin =
              filteredObject[0].distributorMargin;
            mappedProduct.batchName = filteredObject[0].batchName;

            return mappedProduct;
          },
        );

        const finalMappedUomObject: UnitOfMeasure[] = parsedUomData.map(
          (unitOfMeasure: any) => {
            const mappedUom: UnitOfMeasure = new UnitOfMeasure();
            mappedUom.guid = unitOfMeasure.GUID;
            mappedUom.alterid = unitOfMeasure.ALTERID;
            mappedUom.name = unitOfMeasure.NAME;
            mappedUom.formalName = unitOfMeasure.FORMALNAME || ' ';
            mappedUom.isSimpleUnit = unitOfMeasure.ISSIMPLEUNIT;
            mappedUom.baseUnits = unitOfMeasure.BASEUNITS || ' ';
            mappedUom.additionalUnits = unitOfMeasure.ADDITIONALUNITS || ' ';
            mappedUom.conversion = unitOfMeasure.CONVERSION;

            return mappedUom;
          },
        );

        await this.productRepository.createAll(finalMappedObject, {
          transaction: tx,
        });

        await this.uomRepository.createAll(finalMappedUomObject, {
          transaction: tx,
        });

        await tx.commit();

        // Return success response
        return {
          success: true,
          message: 'Sync successful',
        };
      } catch (err) {
        console.log(err);
        await tx.rollback();
        throw new Error(
          'Error synchronizing products. Transaction rolled back.',
        );
      }
    } catch (error) {
      console.log(error);
      throw new HttpErrors.PreconditionFailed(error.message);
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @post('/api/syncProductsExtraDummy')
  async syncProductsExtraDummy(): Promise<any> {
    try {
      const stockItemExtraXml = STOCK_ITEM_EXTRA_XML();
      const stockItemExtraData = await this.tallyPostService.postTallyXML(
        stockItemExtraXml,
      );

      try {
        const parsedXmlData =
          await this.tallyPostService.parseExtraStockXmlToObjects(
            stockItemExtraData,
          );
        return parsedXmlData;

        // Return success response
        return {
          success: true,
          message: 'Sync successful',
        };
      } catch (err) {
        console.log(err);
        throw new Error(
          'Error synchronizing products. Transaction rolled back.',
        );
      }
    } catch (error) {
      console.log(error);
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
    const requiredParents = [
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00006017',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000072f',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00004f24',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000607',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000374c',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000601',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000c96',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000748c',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00004ddd',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000609',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-000061ba',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-000060ce',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000606',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00006236',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-000074d5',
    ];
    return this.productRepository.find({
      include: [
        {
          relation: 'unitOfMeasure',
        },
      ],
      where: {
        _parent: {inq: requiredParents},
      },
      ...filter,
    });
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

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/products/parents')
  async getProductParents(
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<any> {
    const requiredParents = [
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00006017',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000072f',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00004f24',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000607',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000374c',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000601',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000c96',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-0000748c',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00004ddd',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000609',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-000061ba',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-000060ce',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00000606',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-00006236',
      'e5a9b5a7-7f09-4ac0-a2cd-f5aa3ad03acf-000074d5',
    ];
    const products = await this.productRepository.find({
      ...filter,
      where: {
        _parent: {inq: requiredParents},
      },
    });

    // Create a Set to store unique parent values
    const uniqueParents = new Set<string>();

    // Filter out duplicates and store unique parents in the Set
    products.forEach(product => uniqueParents.add(product.parent));

    // Convert the Set back to an array
    const uniqueParentsArray = Array.from(uniqueParents);

    return uniqueParentsArray.map(parent => {
      return {
        parent,
      };
    });
  }
}
