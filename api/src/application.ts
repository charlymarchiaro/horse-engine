import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import { SECURITY_SCHEME_SPEC } from '@loopback/authentication-jwt';
import { AuthorizationComponent, AuthorizationTags } from '@loopback/authorization';


import path from 'path';

import { MySequence } from './sequence';

import {
  BcryptHasher,
  MyUserService,
  JWTService,
  RefreshTokenService,
} from './services';

import {
  PasswordHasherBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
  RefreshTokenConstants,
  RefreshTokenServiceBindings,
  CustomAuthorizationBindings,
} from './keys';

import { JWTStrategy } from './authentication-strategies/jwt.strategies';

import { RefreshTokenRepository } from './repositories';
import { EditionAuthorizationProvider } from './services/edition-authorizer.service';

export { ApplicationConfig };

export class ApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Setup binding
    this.setupBinding();

    // Add security spec
    this.addSecuritySpec();

    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTStrategy);
    this.component(AuthorizationComponent);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }


  private setupBinding(): void {
    // Security
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(PasswordHasherBindings.ROUNDS).to(10)
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE)
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);

    // Authorizers
    this.bind(CustomAuthorizationBindings.EDITION)
      .toProvider(EditionAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);

    /// Refresh bindings
    this.bind(RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE).toClass(RefreshTokenService);

    //  Refresh token bindings
    this.bind(RefreshTokenServiceBindings.REFRESH_SECRET).to(RefreshTokenConstants.REFRESH_SECRET_VALUE);
    this.bind(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN).to(RefreshTokenConstants.REFRESH_EXPIRES_IN_VALUE);
    this.bind(RefreshTokenServiceBindings.REFRESH_ISSUER).to(RefreshTokenConstants.REFRESH_ISSUER_VALUE);
    // Refresh token repository binding
    this.bind(RefreshTokenServiceBindings.REFRESH_REPOSITORY).toClass(RefreshTokenRepository);
  }


  private addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'HORSE engine API',
        version: '1.0.0',
      },
      paths: {},
      components: { securitySchemes: SECURITY_SCHEME_SPEC },
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{ url: '/api' }],
    });
  }
}
