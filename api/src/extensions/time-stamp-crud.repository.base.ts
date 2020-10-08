import { Count, DataObject, DefaultCrudRepository, Entity, juggler, Options, Where } from '@loopback/repository';

export class TimeStampCrudRepository<E extends Entity & { createdAt?: Date; updatedAt?: Date }, ID>
  extends DefaultCrudRepository<E, ID> {

  constructor(
    public entityClass: typeof Entity & { prototype: E },
    public dataSource: juggler.DataSource,
  ) {
    super(entityClass, dataSource);
    // TODO: check whether the model has updatedAt/createdAt properties?
  }

  async create(entity: DataObject<E>, options?: Options): Promise<E> {
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return super.create(entity, options);
  }

  async updateAll(
    data: DataObject<E>,
    where?: Where<E>,
    options?: Options,
  ): Promise<Count> {
    data.updatedAt = new Date();
    return super.updateAll(data, where, options);
  }

  async replaceById(
    id: ID,
    data: DataObject<E>,
    options?: Options,
  ): Promise<void> {
    data.updatedAt = new Date();
    return super.replaceById(id, data, options);
  }
}