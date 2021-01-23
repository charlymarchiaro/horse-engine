import { BindingScope, inject, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import {
  RefreshTokenServiceBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import { User, RefreshToken, RefreshTokenRelations } from '../models';
import { RefreshTokenRepository } from '../repositories';
import { TokenObject } from '../types';
import { JWTService } from './jwt.service';
import { MyUserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

@injectable({ scope: BindingScope.TRANSIENT })
export class RefreshTokenService {
  constructor(
    @inject(RefreshTokenServiceBindings.REFRESH_SECRET) private refreshSecret: string,
    @inject(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN) private refreshExpiresIn: string,
    @inject(RefreshTokenServiceBindings.REFRESH_ISSUER) private refreshIssure: string,
    @repository(RefreshTokenRepository) public refreshTokenRepository: RefreshTokenRepository,
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
  ) { }
  /**
   * Generate a refresh token, bind it with the given user profile + access
   * token, then store them in backend.
   */
  async generateToken(
    userProfile: UserProfile,
    token: string,
  ): Promise<TokenObject> {
    const data = {
      token: uuidv4(),
    };

    const user = await this.userRepository.findById(userProfile[securityId]);
    await this.revokeUserTokens(user);

    const refreshToken = await signAsync(data, this.refreshSecret, {
      expiresIn: Number(this.refreshExpiresIn),
      issuer: this.refreshIssure,
    });
    const result = {
      accessToken: token,
      refreshToken: refreshToken,
    };
    await this.refreshTokenRepository.create({
      userId: userProfile[securityId],
      refreshToken: result.refreshToken,
    });
    return result;
  }

  /**
   * Refresh the access token bound with the given refresh token.
   */
  async refreshToken(refreshToken: string): Promise<TokenObject> {
    try {
      if (!refreshToken) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : 'refresh token' is null`,
        );
      }

      const userRefreshData = await this.verifyToken(refreshToken);
      const user = await this.userService.findUserById(
        userRefreshData.userId.toString(),
      );
      const userProfile: UserProfile = this.userService.convertToUserProfile(
        user,
      );

      // create a JSON Web Token based on the user profile
      const token = await this.jwtService.generateToken(userProfile);

      return {
        accessToken: token,
      };
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }

  /**
   * [TODO] test and endpoint
   */
  async revokeToken(refreshToken: string) {
    try {
      await this.refreshTokenRepository.delete(
        new RefreshToken({ refreshToken: refreshToken }),
      );
    } catch (e) {
      // ignore
    }
  }

  /**
   * Delete all stored tokens of the user 
   */
  async revokeUserTokens(user: User) {
    await this.refreshTokenRepository.deleteAll({
      userId: user.id
    });
  }

  /**
   * Verify the validity of a refresh token, and make sure it exists in backend.
   * @param refreshToken
   */
  async verifyToken(
    refreshToken: string,
  ): Promise<RefreshToken & RefreshTokenRelations> {
    try {
      await verifyAsync(refreshToken, this.refreshSecret);
      const userRefreshData = await this.refreshTokenRepository.findOne({
        where: { refreshToken: refreshToken },
      });

      if (!userRefreshData) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : Invalid Token`,
        );
      }
      return userRefreshData;
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }
}
