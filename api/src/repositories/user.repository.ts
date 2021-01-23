import { DefaultCrudRepository, model, property } from '@loopback/repository';
import { User, UserRelations } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';


@model()
export class Credentials {
  @property() email: string;
  @property() password: string;
}


export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(User, dataSource);
  }
}
