import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {VoucherProduct, VoucherProductRelations} from '../models';

export class VoucherProductRepository extends DefaultCrudRepository<
  VoucherProduct,
  typeof VoucherProduct.prototype.id,
  VoucherProductRelations
> {
  constructor(
    @inject('datasources.arya') dataSource: AryaDataSource,
  ) {
    super(VoucherProduct, dataSource);
  }
}
