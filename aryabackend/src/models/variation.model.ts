import {Entity, model, property} from '@loopback/repository';

@model()
export class Variation extends Entity {
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
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<Variation>) {
    super(data);
  }
}

export interface VariationRelations {
  // describe navigational properties here
}

export type VariationWithRelations = Variation & VariationRelations;
