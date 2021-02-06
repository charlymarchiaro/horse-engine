import { User } from "./user.model";
import { uniq } from '../utils';


export enum Role {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_POWER_USER = 'ROLE_POWER_USER',
  ROLE_USER = 'ROLE_USER',
}


export const ROLE_HIERARCHY: { [role in Role]: Role[] } = {
  ROLE_ADMIN: [Role.ROLE_POWER_USER, Role.ROLE_USER],
  ROLE_POWER_USER: [Role.ROLE_USER],
  ROLE_USER: [],
}


export function getReachableRoles(user: { roles?: Role[] }): Role[] {

  const reachableRoles: Role[] = [];

  const reachableRolesRecursive = (role: Role): Role[] => {
    const roles: Role[] = [role];
    const subRoles = ROLE_HIERARCHY[role];

    if (subRoles.length === 0) {
      return roles;
    }
    for (const subRole of subRoles) {
      roles.push(...reachableRolesRecursive(subRole));
    }
    return uniq(roles);
  }

  for (const role of user.roles || []) {
    reachableRoles.push(...reachableRolesRecursive(role));
  }
  return uniq(reachableRoles);
}
