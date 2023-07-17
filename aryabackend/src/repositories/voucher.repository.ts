import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Voucher, VoucherRelations} from '../models';

export class VoucherRepository extends DefaultCrudRepository<
  Voucher,
  typeof Voucher.prototype.id,
  VoucherRelations
> {
  constructor(
    @inject('datasources.arya') dataSource: AryaDataSource,
  ) {
    super(Voucher, dataSource);
  }
}
