import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Voucher,
  Ledger,
} from '../models';
import {VoucherRepository} from '../repositories';

export class VoucherLedgerController {
  constructor(
    @repository(VoucherRepository)
    public voucherRepository: VoucherRepository,
  ) { }

  @get('/vouchers/{id}/ledger', {
    responses: {
      '200': {
        description: 'Ledger belonging to Voucher',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Ledger)},
          },
        },
      },
    },
  })
  async getLedger(
    @param.path.number('id') id: typeof Voucher.prototype.id,
  ): Promise<Ledger> {
    return this.voucherRepository.ledger(id);
  }
}
