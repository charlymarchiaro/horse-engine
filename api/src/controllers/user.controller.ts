import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { model, property, repository } from '@loopback/repository';
import { get, getJsonSchemaRef, post, requestBody } from '@loopback/rest';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { Credentials, UserRepository } from '../repositories';
import { validateCredentials } from '../services';
import { BcryptHasher } from '../services/hash-password.service';
import { JWTService } from '../services/jwt.service';
import { MyUserService, UserExtProfile } from '../services/user.service';
import { OPERATION_SECURITY_SPEC } from '../utils/security.spec';
import { securityId, UserProfile } from '@loopback/security';
import { User } from '../models/user.model';


@model()
export class RegisterUserRequestBody {
  @property() email: string;
  @property() password: string;
  @property() firstName: string;
  @property() lastName: string;
}

export class UserController {

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public hasher: BcryptHasher,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
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


  @authenticate("jwt")
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
