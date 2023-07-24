/* eslint-disable @typescript-eslint/naming-convention */
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
  patch,
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
import generateOtpTemplate from '../templates/otp.template';
import SITE_SETTINGS from '../utils/config';
import {EmailManagerBindings} from '../keys';
import {EmailManager} from '../services/email.service';
import {ACTIVE_COMPANY_TALLY_XML} from '../helpers/getActiveCompanyTallyXml';
import {TallyHttpCallService} from '../services/tally-http-call';

export class UserController {
  constructor(
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
    @inject('service.tally.service')
    public tallyPostService: TallyHttpCallService,
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
    const userData = _.omit(user, 'password');
    return Promise.resolve({
      ...userData,
      displayName: userData?.name,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @get('/api/users/list')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    filter = {
      ...filter,
      fields: {password: false, otp: false, otpExpireAt: false},
    };
    return this.userRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @get('/api/users/{id}', {
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
      fields: {
        password: false,
        otp: false,
        otpExpireAt: false,
      },
    });
    return Promise.resolve({
      ...user,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @patch('/api/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @post('/sendOtp')
  async sendOtp(
    @requestBody({})
    userData: any,
  ): Promise<object> {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const template = generateOtpTemplate({...userData, otp: otp || '000000'});
    const user = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      const now = new Date();
      await this.userRepository.updateById(user.id, {
        otp: `${otp}`,
        otpExpireAt: `${this.addMinutesToDate(now, 10)}`,
      });
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
    const mailOptions = {
      from: SITE_SETTINGS.fromMail,
      to: userData.email,
      subject: template.subject,
      html: template.html,
    };
    await this.emailManager
      .sendMail(mailOptions)
      .then(function (res: any) {
        return Promise.resolve({
          success: true,
          message: `Successfully sent otp mail to ${userData.email}`,
        });
      })
      .catch(function (err: any) {
        throw new HttpErrors.UnprocessableEntity(err);
      });
    return Promise.resolve({
      success: true,
      message: `Successfully sent otp mail to ${userData.email}`,
    });
  }

  @post('/verifyOtp')
  async verifyOtp(
    @requestBody({})
    otpOptions: any,
  ): Promise<object> {
    const user = await this.userRepository.findOne({
      where: {
        email: otpOptions.email,
      },
    });
    if (user) {
      const now = new Date();
      const expire_date = new Date(user.otpExpireAt);
      if (now <= expire_date && otpOptions.otp === user.otp) {
        await this.userRepository.updateById(user.id, {
          password: otpOptions.password,
        });
        return {
          success: true,
          message: 'otp verification successfull',
        };
      } else {
        return {
          success: false,
          error: 'otp verification failed',
        };
      }
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
  }

  addMinutesToDate(date: any, minutes: any) {
    return new Date(date.getTime() + minutes * 60000);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SALES]},
  })
  @get('/api/getActiveCompany')
  async getActiveCompant(): Promise<any> {
    try {
      const tallyXml = ACTIVE_COMPANY_TALLY_XML();
      const res: any = await this.tallyPostService.postTallyXML(tallyXml);
      const parsedXmlData = await this.tallyPostService.parseActiveCompany(res);
      return parsedXmlData;
    } catch (error) {
      console.log(error);
      if (error.code === 'ECONNREFUSED' || error.code === 'EHOSTUNREACH') {
        // Handle the ECONNREFUSED error
        throw new HttpErrors.PreconditionFailed(
          'Failed to connect to the Tally server.',
        );
      } else {
        // Handle other errors
        console.error('Error occurred while processing the request:', error);
        throw new HttpErrors.InternalServerError(
          'An error occurred while processing the request.',
        );
      }
    }
  }
}
