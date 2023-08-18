import {Entity, model, property} from '@loopback/repository';

@model()
export class UnitOfMeasure extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true,
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
  formalName: string;

  @property({
    type: 'boolean',
    default: 0,
  })
  isSimpleUnit: boolean;

  @property({
    type: 'string',
    required: true,
  })
  baseUnits: string;

  @property({
    type: 'string',
    required: true,
  })
  additionalUnits: string;

  @property({
    type: 'string',
    required: false,
  })
  conversion: string;

  constructor(data?: Partial<UnitOfMeasure>) {
    super(data);
  }
}

export interface UnitOfMeasureRelations {
  // describe navigational properties here
}

export type UnitOfMeasureWithRelations = UnitOfMeasure & UnitOfMeasureRelations;
