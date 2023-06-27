import {Entity, model, property} from '@loopback/repository';

@model()
export class ProductVariation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  productId?: number;

  @property({
    type: 'number',
  })
  variationId?: number;

  @property({
    type: 'number',
    required: true,
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  mrp: number;

  @property({
    type: 'number',
    required: true,
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  sellingPrice: number;

  @property({
    type: 'string',
    default: 0,
  })
  sku?: string;

  @property({
    type: 'number',
    default: 0,
  })
  stock?: number;
  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<ProductVariation>) {
    super(data);
  }
}

export interface ProductVariationRelations {
  // describe navigational properties here
}

export type ProductVariationWithRelations = ProductVariation &
  ProductVariationRelations;
