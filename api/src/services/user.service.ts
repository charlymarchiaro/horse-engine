import { UserService } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { model, repository, property } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import { PasswordHasherBindings } from '../keys';
import { User } from '../models';
import { Credentials, UserRepository } from '../repositories/user.repository';
import { BcryptHasher } from './hash-password.service';
import { Role } from '../models/role.model';


@model()
export class UserExtProfile {
  @property() id: string;
  @property() email: string;
  @property() firstName: string;
  @property() lastName: string;
  @property() enabled: boolean;
  @property.array(String) roles: Role[];
  @property() lastLogin?: string;
  @property() passwordRequestedAt?: string;
}


export class MyUserService implements UserService<User, Credentials>{

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public hasher: BcryptHasher
  ) { }


  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email
      }
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('User not found');
    }
    const passwordMatched = await this.hasher.comparePassword(credentials.password, foundUser.password)
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('Password is not valid');
    return foundUser;
  }


  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id!,
      name: user.firstName + ' ' + user.lastName,
      id: user.id,
      email: user.email,
    };
  }


  convertToUserExtProfile(user: User): UserExtProfile {
    return {
      id: user.id || '',
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: user.enabled,
      roles: user.roles || [],
      lastLogin: user.lastLogin,
      passwordRequestedAt: user.passwordRequestedAt,
    }
  }
}
