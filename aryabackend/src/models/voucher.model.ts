/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model()
export class Voucher extends Entity {
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
  date: string;

  @property({
    type: 'string',
  })
  voucher_type?: string;

  @property({
    type: 'string',
    required: true,
  })
  _voucher_type: string;

  @property({
    type: 'string',
    required: true,
  })
  voucher_number: string;

  @property({
    type: 'string',
  })
  reference_number?: string;

  @property({
    type: 'string',
  })
  reference_date?: string;

  @property({
    type: 'string',
  })
  narration: string;

  @property({
    type: 'string',
    required: true,
  })
  party_name: string;

  @property({
    type: 'string',
    required: true,
  })
  _party_name: string;

  @property({
    type: 'string',
    required: true,
  })
  place_of_supply: string;

  @property({
    type: 'boolean',
  })
  is_invoice: boolean;

  @property({
    type: 'boolean',
  })
  is_accounting_voucher: boolean;

  @property({
    type: 'boolean',
  })
  is_inventory_voucher?: boolean;

  @property({
    type: 'boolean',
  })
  is_order_voucher?: boolean;

  constructor(data?: Partial<Voucher>) {
    super(data);
  }
}

export interface VoucherRelations {
  // describe navigational properties here
}

export type VoucherWithRelations = Voucher & VoucherRelations;
