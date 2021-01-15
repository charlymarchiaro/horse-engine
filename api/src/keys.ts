import { TokenService, UserService } from '@loopback/authentication';
import { BindingKey } from '@loopback/core';
import { User } from './models';
import { Credentials } from './repositories/user.repository';
import { PasswordHasher, RefreshTokenService } from './services';


let configFile = require('../config/config.json');

export namespace AppConstants {
  export const RESPONSE_TIMEOUT_SECS = 180;
}

// Security
export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = process.env.JWT_SECRET || '';
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  const s = process.env.JWT_TOKEN_EXPIRATION_TIME_S || '900';
  export const TOKEN_EXPIRES_IN_VALUE = s + 's';
}
export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expiresIn',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.jwt.service',
  );
}
export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.rounds');
}
export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<Credentials, User>>(
    'services.user.service',
  );
}

/**
 * Constant values used when generating refresh token.
 */
export namespace RefreshTokenConstants {
  /**
   * The default secret used when generating refresh token.
   */
  export const REFRESH_SECRET_VALUE = process.env.JWT_SECRET || '';
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  /**
   * The default expiration time for refresh token.
   */
  export const REFRESH_EXPIRES_IN_VALUE =
    process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME_S || '216000';
  /**
   * The default issuer used when generating refresh token.
   */
  export const REFRESH_ISSUER_VALUE = 'horse_engine';
}

/**
 * Bindings related to token refresh service. The omitted explanation can be
 * found in namespace `RefreshTokenConstants`.
 */
export namespace RefreshTokenServiceBindings {
  export const REFRESH_TOKEN_SERVICE = BindingKey.create<RefreshTokenService>(
    'services.authentication.jwt.refresh.tokenservice',
  );
  export const REFRESH_SECRET = BindingKey.create<string>(
    'authentication.jwt.refresh.secret',
  );
  export const REFRESH_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.refresh.expires.in.seconds',
  );
  export const REFRESH_ISSUER = BindingKey.create<string>(
    'authentication.jwt.refresh.issuer',
  );
  /**
   * The backend datasource for refresh token's persistency.
   */
  export const DATASOURCE_NAME = 'db';
  /**
   * Key for the repository that stores the refresh token and its bound user
   * information
   */
  export const REFRESH_REPOSITORY = 'repositories.RefreshTokenRepository';
}


export namespace PostgresConstants {
  export const PG_HOST = process.env.PG_HOST;
  export const PG_PORT = process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432;
  export const PG_USER = process.env.PG_USER;
  export const PG_PASSWORD = process.env.PG_PASSWORD;
  export const PG_DATABASE = process.env.PG_DATABASE;
}

export namespace ScrapydConstants {
  interface NodeInfo {
    id: string;
    host: string;
    port: number;
  };

  export const SCRAPYD_NODES: NodeInfo[] = configFile.scrapydNodes;
}

