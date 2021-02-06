import { Entity, model, property } from '@loopback/repository';
import { Role, User } from '../models';
import { getReachableRoles } from './role.model';

@model()
export class UserSummary extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'object',
    required: true,
  })
  roles: Role[];


  constructor(data?: Partial<UserSummary>) {
    if (data) {
      data.roles = getReachableRoles(data);
    }
    super(data);
  }


  static fromUser(user: User): UserSummary {
    user.roles = getReachableRoles(user);
    return new UserSummary(user);
  }
}

export interface UserSummaryRelations {
  // describe navigational properties here
}

export type UserSummaryWithRelations = UserSummary & UserSummaryRelations;