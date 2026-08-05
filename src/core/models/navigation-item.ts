import type { UserRole } from './user-role';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  enabled: boolean;
  roles?: UserRole[];
}
