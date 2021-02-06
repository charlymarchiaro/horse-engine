import { DefaultCrudRepository, BelongsToAccessor, repository, DataObject, Options } from '@loopback/repository';
import { ArticleSearchScheme, ArticleSearchSchemeRelations, UserSummary } from '../models';
import { DbDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { TimeStampCrudRepository } from '../extensions/time-stamp-crud.repository.base';
import { UserSummaryRepository } from './user-summary.repository';
import { AuthenticationBindings } from '@loopback/authentication';
import { securityId, UserProfile } from '@loopback/security';

export class ArticleSearchSchemeRepository extends TimeStampCrudRepository<
  ArticleSearchScheme,
  typeof ArticleSearchScheme.prototype.id
  > {

  public readonly user: BelongsToAccessor<UserSummary, typeof UserSummary.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UserSummaryRepository') protected userSummaryRepositoryGetter: Getter<UserSummaryRepository>,
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true }) protected currentUser: UserProfile,
  ) {
    super(ArticleSearchScheme, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userSummaryRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }

  async create(entity: DataObject<ArticleSearchScheme>, options?: Options): Promise<ArticleSearchScheme> {
    entity.userId = this.currentUser[securityId];
    return super.create(entity, options);
  }
}
