import { Entity, model, property } from '@loopback/repository';
import { User } from './user.model';

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


  constructor(data?: Partial<UserSummary>) {
    super(data);
  }


  static fromUser(user: User): UserSummary {
    return new UserSummary(user);
  }
}

export interface UserSummaryRelations {
  // describe navigational properties here
}

export type UserSummaryWithRelations = UserSummary & UserSummaryRelations;