// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';

import _ from 'lodash';
import { getReachableRoles, Role } from '../models';
import { MyUserProfile } from '../types';
import { repository, RepositoryBindings, Where } from '@loopback/repository';
import { ArticleSearchSchemeRepository } from '../repositories';
import { inject, Provider } from '@loopback/core';
import { ArticleSearchSchemeController } from '../controllers/article-search-scheme.controller';
import { ArticleSearchScheme } from '../models/article-search-scheme.model';

export class EditionAuthorizationProvider implements Provider<Authorizer> {

  constructor(
    @repository(ArticleSearchSchemeRepository)
    protected articleSearchSchemeRepository: ArticleSearchSchemeRepository,
  ) { }


  value(): Authorizer {
    return this.authorize.bind(this);
  }

  /**
   * Called to authorize search scheme edition operations
   */
  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {

    const target = authorizationCtx.invocationContext.target;
    const methodName = authorizationCtx.invocationContext.methodName;

    // No access if authorization details are missing
    let currentUser: MyUserProfile;

    if (authorizationCtx.principals.length > 0) {
      const user = _.pick(authorizationCtx.principals[0], [
        'id',
        'email',
        'name',
        'roles',
      ]);

      currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: getReachableRoles(user),
      };

    } else {
      return AuthorizationDecision.DENY;
    }

    if (target instanceof ArticleSearchSchemeController) {
      return this.articleSearchSchemeAuth(
        currentUser,
        authorizationCtx,
        metadata,
        methodName,
      );
    }

    return AuthorizationDecision.ALLOW;
  }


  async articleSearchSchemeAuth(
    user: MyUserProfile,
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
    methodName: string,
  ): Promise<AuthorizationDecision> {

    // Admin and power users can edit all
    if (
      user.roles.includes(Role.ROLE_ADMIN)
      || user.roles.includes(Role.ROLE_POWER_USER)
    ) {
      return AuthorizationDecision.ALLOW;
    }

    // Verify edition methods only
    if (
      [
        'updateAll',
        'updateById',
        'replaceById',
        'deleteById'
      ]
        .includes(methodName) === false
    ) {
      return AuthorizationDecision.ALLOW;
    }

    // Single entity id
    if (
      [
        'updateById',
        'replaceById',
        'deleteById'
      ]
        .includes(methodName)
    ) {
      const id = authorizationCtx.invocationContext.args[0];
      const scheme = await this.articleSearchSchemeRepository.findById(id);

      if (!scheme || scheme.userId !== user.id) {
        return AuthorizationDecision.DENY;
      }
    }

    // Multiple entities
    if (
      [
        'updateAll',
      ]
        .includes(methodName)
    ) {
      const where = authorizationCtx.invocationContext.args[1] as Where<ArticleSearchScheme>;

      const schemes = await this.articleSearchSchemeRepository.find({ where });

      if (
        schemes.length === 0
        // At least one of the entities isn't owned by the user --> deny
        || schemes.map(s => s.userId === user.id).includes(false)
      ) {
        return AuthorizationDecision.DENY;
      }
    }

    return AuthorizationDecision.ALLOW;
  }
}