import {inject, Getter, Constructor} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Voucher, VoucherRelations} from '../models';
import {VoucherProductRepository} from './voucher-product.repository';
import {ProductRepository} from './product.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class VoucherRepository extends TimeStampRepositoryMixin<
  Voucher,
  typeof Voucher.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Voucher,
      typeof Voucher.prototype.id,
      VoucherRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.arya') dataSource: AryaDataSource,
    @repository.getter('VoucherProductRepository')
    protected voucherProductRepositoryGetter: Getter<VoucherProductRepository>,
    @repository.getter('ProductRepository')
    protected productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Voucher, dataSource);
  }
}
