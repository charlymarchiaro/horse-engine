import { Entity, model, property } from '@loopback/repository';

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
      columnName: 'username',
      dataType: 'VARCHAR',
      dataLength: 180,
      nullable: 'NO',
    }
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'username_canonical',
      dataType: 'VARCHAR',
      dataLength: 180,
      nullable: 'NO',
    }
  })
  usernameCanonical: string;

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
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'email_canonical',
      dataType: 'VARCHAR',
      dataLength: 180,
      nullable: 'NO',
    }
  })
  emailCanonical: string;

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
    postgresql: {
      columnName: 'salt',
      dataType: 'VARCHAR',
      dataLength: 255,
      nullable: 'YES',
    }
  })
  salt?: string;

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
    required: true,
    postgresql: {
      columnName: 'roles',
      dataType: 'JSON',
      nullable: 'NO',
    }
  })
  roles: object;

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
