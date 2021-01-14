import { Role } from "./models";


export interface RequiredRoles {
  required: Role[];
}

export interface MyUserProfile {
  id: string;
  email?: string;
  name: string;
  roles: Role[];
}