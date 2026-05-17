export const USER_ROLES = ["customer", "traveler", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ONBOARDING_ROLES = ["customer", "traveler"] as const;

export type OnboardingRole = (typeof ONBOARDING_ROLES)[number];

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function hasRole(
  roles: UserRole[] | null | undefined,
  role: UserRole
): boolean {
  return Boolean(roles?.includes(role));
}
