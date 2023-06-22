import {
  repository,
} from '@loopback/repository';
import {
  post,
  getModelSchemaRef,
  requestBody,
  getJsonSchemaRef,
  HttpErrors,
} from '@loopback/rest';
import {User} from '../models';
import * as _ from 'lodash';
import {UserRepository} from '../repositories';
import { validateCredentials } from '../services/validator';
import { PermissionKeys } from '../authorization/permission-keys';
import { inject } from '@loopback/core';
import { BcryptHasher } from '../services/hash.password.bcrypt';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  @post('/users/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User),
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            exclude: ['id'],
          }),
        },
      },
    })
    userData: Omit<User, 'id'>,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      throw new HttpErrors.BadRequest('Email Already Exists');
    }
    validateCredentials(_.pick(userData, ['email', 'password']));
    userData.permissions = [PermissionKeys.EMPLOYEE];
    userData.password = await this.hasher.hashPassword(userData.password);

    return Promise.resolve({
      success: true,
      message: `Credentials created and Successfully sent  mail to ${userData.email}`,
    });

  }
}
