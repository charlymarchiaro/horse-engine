import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { model, property, repository } from '@loopback/repository';
import { get, post, requestBody, HttpErrors, api } from '@loopback/rest';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { Credentials, UserRepository } from '../repositories';
import { basicAuthorization, validateCredentials } from '../services';
import { BcryptHasher } from '../services/hash-password.service';
import { JWTService } from '../services/jwt.service';
import { MyUserService, UserExtProfile } from '../services/user.service';
import { OPERATION_SECURITY_SPEC } from '../utils/security.spec';
import { securityId, UserProfile } from '@loopback/security';
import { authorize } from '@loopback/authorization';
import { Role } from '../models';
import { TokenObject } from '../types';
import { RefreshtokenService, RefreshTokenServiceBindings } from '@loopback/authentication-jwt';



@model()
export class RegisterUserRequestBody {
  @property() email: string;
  @property() password: string;
  @property() firstName: string;
  @property() lastName: string;
}

@model()
export class RefreshLoginResponse {
  @property() accessToken: string;
  @property() refreshToken: string;
}

@model()
export class RefreshRequestBody {
  @property() refreshToken: string;
}

@model()
export class RefreshResponse {
  @property() accessToken: string;
  @property() refreshToken: string;
}


@api({ basePath: 'auth' })
export class UserController {

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public hasher: BcryptHasher,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
    @inject(RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE) public refreshService: RefreshtokenService,
  ) { }


  @post('/register', {
    responses: {
      '200': {
        description: 'User profile',
        content: {
          'application/json': {
            schema: { 'x-ts-type': UserExtProfile },
          },
        }
      }
    }
  })
  async register(@requestBody() body: RegisterUserRequestBody) {
    validateCredentials({
      email: body.email,
      password: body.password,
    });

    if (await this.userRepository.findOne({ where: { email: body.email } })) {
      throw new HttpErrors.UnprocessableEntity(
        'This email is already used by a registered user'
      );
    };

    const passwordHash = await this.hasher.hashPassword(body.password)
    const savedUser = await this.userRepository.create({
      email: body.email,
      enabled: false,
      password: passwordHash,
      roles: [],
      firstName: body.firstName,
      lastName: body.lastName,
    });
    return this.userService.convertToUserExtProfile(savedUser);
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
                token: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  })
  async login(
    @requestBody() credentials: Credentials,
  ): Promise<{ token: string }> {
    // Make sure user exist, password should be valid
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = await this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);

    this.userRepository.updateById(user.id, {
      lastLogin: (new Date()).toISOString(),
    })
    return Promise.resolve({ token: token })
  }


  @post('/refresh-login', {
    responses: {
      '200': {
        description: 'Tokens',
        content: {
          'application/json': {
            schema: { 'x-ts-type': RefreshLoginResponse },
          },
        }
      }
    }
  })
  async refreshLogin(
    @requestBody() credentials: Credentials,
  ): Promise<TokenObject> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile: UserProfile = this.userService.convertToUserProfile(
      user,
    );
    const accessToken = await this.jwtService.generateToken(userProfile);
    const tokens = await this.refreshService.generateToken(
      userProfile,
      accessToken,
    );
    return tokens;
  }


  @post('/refresh', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: { 'x-ts-type': RefreshResponse },
          },
        },
      },
    },
  })
  async refresh(
    @requestBody() refreshGrant: RefreshRequestBody,
  ): Promise<TokenObject> {
    return this.refreshService.refreshToken(refreshGrant.refreshToken);
  }


  @authenticate('jwt')
  @authorize({ allowedRoles: [], voters: [basicAuthorization] })
  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: { 'x-ts-type': UserExtProfile },
          },
        },
      },
    },
  })
  async me(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ): Promise<UserExtProfile> {
    const savedUser = await this.userRepository.findById(currentUser[securityId]);
    const userExtProfile = this.userService.convertToUserExtProfile(savedUser);
    return Promise.resolve(userExtProfile);
  }
}
