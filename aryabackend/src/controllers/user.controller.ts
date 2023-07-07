import {Filter, repository} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {
  post,
  getModelSchemaRef,
  requestBody,
  getJsonSchemaRef,
  HttpErrors,
  get,
  response,
  param,
} from '@loopback/rest';
import {User} from '../models';
import * as _ from 'lodash';
import {Credentials, UserRepository} from '../repositories';
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {validateCredentials} from '../services/validator';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {CredentialsRequestBody} from './specs/user-controller-spec';
import {MyUserService} from '../services/user-service';
import {JWTService} from '../services/jwt-service';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) {}

  @post('/register', {
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
    // userData.permissions = [PermissionKeys.ADMIN];
    userData.password = await this.hasher.hashPassword(userData.password);
    const savedUser = await this.userRepository.create(userData);
    const savedUserData = _.omit(savedUser, 'password');

    return Promise.resolve({
      success: true,
      userData: savedUserData,
      message: `User with mail ${userData.email} is registered successfully`,
    });
  }

  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const userData = _.omit(user, 'password');
    const token = await this.jwtService.generateToken(userProfile);

    return Promise.resolve({
      accessToken: token,
      user: {...userData, displayName: userData.name},
    });
  }

  @get('/me')
  @authenticate('jwt')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<{}> {
    const user = await this.userRepository.findOne({
      where: {
        id: currnetUser.id,
      },
    });

    return Promise.resolve({
      ...user,
      displayName: user?.name,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @get('/users')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User Details',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getSingleUser(@param.path.number('id') id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    return Promise.resolve({
      ...user,
    });
  }
}
