
import { AppRole, Profile } from './user-types';

export interface UserWithRole extends Profile {
  roles: AppRole[];
}
