// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';

import _ from 'lodash';
import { User, Role } from '../models';
import { MyUserProfile } from '../types';
import { getReachableRoles } from '../models/role.model';

// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {

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

  if (!currentUser.roles) {
    return AuthorizationDecision.DENY;
  }

  // Authorize everything that does not have a allowedRoles property
  if (!metadata.allowedRoles || metadata.allowedRoles.length === 0) {
    return AuthorizationDecision.ALLOW;
  }

  // Admin account bypass id verification
  if (
    currentUser.roles.includes(Role.ROLE_ADMIN)
  ) {
    return AuthorizationDecision.ALLOW;
  }

  let roleIsAllowed = false;

  for (const role of currentUser.roles) {
    if (metadata.allowedRoles!.includes(role)) {
      roleIsAllowed = true;
      break;
    }
  }

  if (!roleIsAllowed) {
    return AuthorizationDecision.DENY;
  }

  return AuthorizationDecision.ALLOW;

  /**
   * Allow access only to model owners, using route as source of truth
   *
   * eg. @post('/users/{userId}/orders', ...) returns `userId` as args[0]
   */
  // if (currentUser.id === authorizationCtx.invocationContext.args[0]) {
  //   return AuthorizationDecision.ALLOW;
  // }

  // return AuthorizationDecision.DENY;
}
