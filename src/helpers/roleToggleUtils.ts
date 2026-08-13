const ROLE_TOGGLE_TYPES = new Set<TenantRouteRole>(['Admin', 'Manager', 'HR']);
const USER_HOME_PATH = '/leave-requests';
export const PLATFORM_ADMIN_HOME_PATH = '/registrations';
export const PLATFORM_ADMIN_ROUTE_ROLE = 'platform_admin';
export const PLATFORM_PARTNER_HOME_PATH = '/customers';
export const PARTNER_ROUTE_ROLE = 'partner';

export type TenantRouteRole = 'Admin' | 'HR' | 'Manager' | 'user';

export type UserDataInput = {
	is_platform_admin?: boolean;
	is_platform_partner?: boolean;
	is_tenant_admin?: boolean;
	is_hr?: boolean;
	is_manager?: boolean;
} | null | undefined;

const toBool = (value: unknown): boolean =>
	value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';

/**
 * Maps `/api/users/profile/` tenant flags to route/menu role keys
 * (`Admin` | `HR` | `Manager` | `user`) used in RoutesMenu & contentRoutes.
 */
export const resolveTenantRouteRole = (userData: UserDataInput): TenantRouteRole => {
	if (!userData || typeof userData !== 'object') return 'user';

	if (toBool(userData.is_tenant_admin)) return 'Admin';
	if (toBool(userData.is_hr)) return 'HR';
	if (toBool(userData.is_manager)) return 'Manager';

	return 'user';
};

export const isUserRole = (userData: UserDataInput = null): boolean =>
	resolveTenantRouteRole(userData) === 'user';

/** Self toggle, or plain employee — same sidebar and route access. */
export const isSelfEquivalentMode = (userData: UserDataInput, mode: string): boolean =>
	isUserRole(userData) || (canUseRoleToggle(userData) && mode === 'Self');

export const getUserHomePath = (): string => USER_HOME_PATH;

export const isPlatformAdmin = (userData: UserDataInput): boolean =>
	userData?.is_platform_admin === true;

export const isPlatformPartner = (userData: UserDataInput): boolean =>
	userData?.is_platform_partner === true;

export const getHomePathForUser = (userData: UserDataInput): string => {
	if (isPlatformAdmin(userData)) return PLATFORM_ADMIN_HOME_PATH;
	if (isPlatformPartner(userData)) return PLATFORM_PARTNER_HOME_PATH;
	if (isUserRole(userData)) return USER_HOME_PATH;
	return '/';
};

/** Home path for the current Self / Admin toggle (Self cannot open `/`). */
export const getEffectiveHomePathForUser = (
	userData: UserDataInput,
	mode: string,
): string => {
	if (isPlatformAdmin(userData)) return PLATFORM_ADMIN_HOME_PATH;
	if (isPlatformPartner(userData)) return PLATFORM_PARTNER_HOME_PATH;
	if (isSelfEquivalentMode(userData, mode)) return USER_HOME_PATH;
	return getHomePathForUser(userData);
};

export const canUseRoleToggle = (userData: UserDataInput = null): boolean => {
	const role = resolveTenantRouteRole(userData);
	return role === 'Admin' || role === 'HR' || role === 'Manager';
};

export const isPrivilegedToggleMode = (userData: UserDataInput, mode: string): boolean =>
	canUseRoleToggle(userData) && mode !== 'Self';

/** Admin or HR only (not Manager), while in privileged (non-Self) mode. */
export const isAdminOrHrRole = (userData: UserDataInput = null): boolean => {
	const role = resolveTenantRouteRole(userData);
	return role === 'Admin' || role === 'HR';
};

export const isAdminOrHrToggleMode = (userData: UserDataInput, mode: string): boolean =>
	isAdminOrHrRole(userData) && mode !== 'Self';

export const getPrivilegedToggleLabel = (userData: UserDataInput = null): string => {
	const role = resolveTenantRouteRole(userData);
	return ROLE_TOGGLE_TYPES.has(role) ? role : 'Admin';
};

export const getEffectiveUserTypeForRoutes = (userData: UserDataInput, mode: string): string => {
	if (isPlatformAdmin(userData)) return PLATFORM_ADMIN_ROUTE_ROLE;
	if (isPlatformPartner(userData)) return PARTNER_ROUTE_ROLE;
	if (isSelfEquivalentMode(userData, mode)) return 'user';
	return resolveTenantRouteRole(userData);
};

/** Static tenant role options for user create/edit forms (no roles API). */
export const TENANT_USER_ROLE_OPTIONS: { label: string; value: TenantRouteRole }[] = [
	{ label: 'Employee', value: 'user' },
	{ label: 'Admin', value: 'Admin' },
	{ label: 'HR', value: 'HR' },
	{ label: 'Manager', value: 'Manager' },
];

export const tenantRoleFlagsFromSelect = (
	role: TenantRouteRole | string | null | undefined,
): { is_tenant_admin: boolean; is_hr: boolean; is_manager: boolean } => ({
	is_tenant_admin: role === 'Admin',
	is_hr: role === 'HR',
	is_manager: role === 'Manager',
});

export const mapAccountToTenantRoleSelect = (
	user: UserDataInput | Record<string, unknown> | null | undefined,
) => {
	const role = resolveTenantRouteRole(user as UserDataInput);
	return TENANT_USER_ROLE_OPTIONS.find((option) => option.value === role) ?? TENANT_USER_ROLE_OPTIONS[0];
};

export const appendTenantRoleFormFields = (
	formData: FormData,
	tenantRole: { value?: string } | string | null | undefined,
) => {
	const roleKey =
		typeof tenantRole === 'object' && tenantRole != null ? tenantRole.value : tenantRole;
	const flags = tenantRoleFlagsFromSelect(
		roleKey != null && roleKey !== '' ? String(roleKey) : 'user',
	);
	formData.append('is_tenant_admin', String(flags.is_tenant_admin));
	formData.append('is_hr', String(flags.is_hr));
	formData.append('is_manager', String(flags.is_manager));
};
