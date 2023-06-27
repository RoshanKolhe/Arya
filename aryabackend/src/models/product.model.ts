import {Entity, model, property, hasMany} from '@loopback/repository';
import {Variation} from './variation.model';
import {ProductVariation} from './product-variation.model';

@model()
export class Product extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  shortDescription?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;
  
  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @hasMany(() => Variation, {through: {model: () => ProductVariation}})
  variations: Variation[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
