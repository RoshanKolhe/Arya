/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

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
  guid: string;

  @property({
    type: 'string',
    required: true,
    default: '',
  })
  alterid: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  parent: string;

  @property({
    type: 'string',
    required: true,
  })
  _parent: string;

  @property({
    type: 'string',
  })
  alias?: string;

  @property({
    type: 'string',
    required: true,
  })
  uom: string;

  @property({
    type: 'string',
    required: true,
  })
  _uom: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  opening_balance?: number;
  
  @property({
    type: 'number',
    required: true,
    default: 0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  opening_rate?: number;
  
  @property({
    type: 'number',
    required: true,
    default: 0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  opening_value?: number;
  
  @property({
    type: 'string',
  })
  gst_nature_of_goods?: string;

  @property({
    type: 'string',
  })
  gst_hsn_code?: string;

  @property({
    type: 'string',
  })
  gst_taxability?: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
