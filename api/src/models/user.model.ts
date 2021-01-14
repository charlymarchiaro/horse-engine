import { Entity, model, property } from '@loopback/repository';
import { Role } from './role.model';

@model({
  settings: {
    postgresql: { schema: 'security', table: 'user' },
  },
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    useDefaultIdType: false,
    postgresql: {
      columnName: 'id',
      dataType: 'uuid',
    },
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'email',
      dataType: 'VARCHAR',
      dataLength: 180,
      nullable: 'NO',
    }
  })
  email: string;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'enabled',
      dataType: 'BOOLEAN',
      nullable: 'NO',
    }
  })
  enabled: boolean;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'password',
      dataType: 'VARCHAR',
      dataLength: 255,
      nullable: 'NO',
    }
  })
  password: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'last_login',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'YES',
    }
  })
  lastLogin?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'confirmation_token',
      dataType: 'VARCHAR',
      dataLength: 180,
      nullable: 'YES',
    }
  })
  confirmationToken?: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'password_requested_at',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'YES',
    }
  })
  passwordRequestedAt?: string;

  @property({
    type: 'object',
    required: false,
    postgresql: {
      columnName: 'roles',
      dataType: 'JSON',
      nullable: 'NO',
    }
  })
  roles?: Role[];

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'first_name',
      dataType: 'VARCHAR',
      dataLength: 255,
      nullable: 'NO',
    }
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'last_name',
      dataType: 'VARCHAR',
      dataLength: 255,
      nullable: 'NO',
    }
  })
  lastName: string;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
