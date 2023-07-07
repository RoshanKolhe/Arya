/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model()
export class Ledger extends Entity {
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
    required: true,
  })
  guid: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  opening_balance?: number;


  constructor(data?: Partial<Ledger>) {
    super(data);
  }
}

export interface LedgerRelations {
  // describe navigational properties here
}

export type LedgerWithRelations = Ledger & LedgerRelations;
