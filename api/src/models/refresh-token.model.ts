import { belongsTo, Entity, model, property } from '@loopback/repository';
import { User } from '.';

@model({
  settings: {
    postgresql: { schema: 'security', table: 'refresh_token' },
    foreignKeys: {
      fk__refresh_token__user: {
        name: 'fk__refresh_token__user',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id',
      },
    },
  }
})
export class RefreshToken extends Entity {
  @property({
    type: 'number',
    required: false,
    id: true,
    postgresql: {
      columnName: 'id',
      // 64 bits
      dataType: 'BIGSERIAL',
    },
  })
  id?: number;

  @belongsTo(() => User, {}, {
    postgresql: {
      columnName: 'user_id',
      dataType: 'uuid',
      nullable: 'NO',
    }
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'refresh_token',
      dataType: 'VARCHAR',
      nullable: 'NO',
    }
  })
  refreshToken: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<RefreshToken>) {
    super(data);
  }
}

export interface RefreshTokenRelations {
  // describe navigational properties here
}

export type RefereshTokenWithRelations = RefreshToken & RefreshTokenRelations;