import {inject, Getter, Constructor} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {AryaDataSource} from '../datasources';
import {Voucher, VoucherRelations, User, Ledger} from '../models';
import {VoucherProductRepository} from './voucher-product.repository';
import {ProductRepository} from './product.repository';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserRepository} from './user.repository';
import {LedgerRepository} from './ledger.repository';

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

  public readonly user: BelongsToAccessor<User, typeof Voucher.prototype.id>;

  public readonly ledger: BelongsToAccessor<Ledger, typeof Voucher.prototype.id>;

  constructor(
    @inject('datasources.arya') dataSource: AryaDataSource,
    @repository.getter('VoucherProductRepository')
    protected voucherProductRepositoryGetter: Getter<VoucherProductRepository>,
    @repository.getter('ProductRepository')
    protected productRepositoryGetter: Getter<ProductRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('LedgerRepository') protected ledgerRepositoryGetter: Getter<LedgerRepository>,
  ) {
    super(Voucher, dataSource);
    this.ledger = this.createBelongsToAccessorFor('ledger', ledgerRepositoryGetter,);
    this.registerInclusionResolver('ledger', this.ledger.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
