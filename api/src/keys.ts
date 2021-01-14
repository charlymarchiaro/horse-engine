import { TokenService, UserService } from '@loopback/authentication';
import { BindingKey } from '@loopback/core';
import { User } from './models';
import { Credentials } from './repositories/user.repository';
import { PasswordHasher } from './services/hash-password.service';


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
  const hs = process.env.JWT_TOKEN_EXPIRATION_TIME_HS || '7';
  export const TOKEN_EXPIRES_IN_VALUE = hs + 'h';
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

