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
  User,
} from '../models';
import {VoucherRepository} from '../repositories';

export class VoucherUserController {
  constructor(
    @repository(VoucherRepository)
    public voucherRepository: VoucherRepository,
  ) { }

  @get('/vouchers/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Voucher',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Voucher.prototype.id,
  ): Promise<User> {
    return this.voucherRepository.user(id);
  }
}
