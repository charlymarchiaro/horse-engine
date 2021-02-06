import { DefaultCrudRepository, EntityCrudRepository, repository, Filter, FilterExcludingWhere, Options } from '@loopback/repository';
import { UserSummary, UserSummaryRelations } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { UserRepository } from './user.repository';

export class UserSummaryRepository extends DefaultCrudRepository<
  UserSummary,
  typeof UserSummary.prototype.id,
  UserSummaryRelations
  > {

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    super(UserSummary, dataSource)
  }


  async find(filter?: Filter<UserSummary>, options?: Options): Promise<(UserSummary & UserSummaryRelations)[]> {
    const users = await this.userRepository.find(filter, options);
    return users.map(u => UserSummary.fromUser(u));
  }

  async findOne(filter?: Filter<UserSummary>, options?: Options): Promise<(UserSummary & UserSummaryRelations) | null> {
    const user = await this.userRepository.findOne(filter, options);
    if (!user) {
      return null;
    }
    return UserSummary.fromUser(user);
  }

  async findById(id: typeof UserSummary.prototype.id, filter?: FilterExcludingWhere<UserSummary>, options?: Options): Promise<UserSummary & UserSummaryRelations> {
    const user = await this.userRepository.findById(id);
    return UserSummary.fromUser(user);
  }

}
