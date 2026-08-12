const isDev = () => !import.meta.env.MODE || import.meta.env.MODE === 'development';

const stripQuotes = (value) => value?.replace(/^['"]|['"]$/g, '').trim();

export const getDevTenantOverride = () =>
	isDev() ? stripQuotes(import.meta.env.VITE_DEV_TENANT) || '' : '';

export const getRootDomain = () => {
	const fromEnv = stripQuotes(import.meta.env.VITE_API_ROOT_DOMAIN);
	if (fromEnv) return fromEnv;

	const { hostname } = window.location;
	const parts = hostname.split('.');
	if (parts.length >= 2) {
		return parts.slice(-2).join('.');
	}
	return hostname;
};

const getOriginWithoutDevPort = () => window.location.origin.split(':3000')[0];

export const isOnTenantSubdomain = () => {
	if (getDevTenantOverride()) return true;

	const rootDomain = getRootDomain();
	const { hostname } = window.location;
	return hostname !== rootDomain && hostname.endsWith(`.${rootDomain}`);
};

/** First page when the app opens (unauthenticated root `/`). */
export const getDefaultAuthPath = () => '/signup';

/** Page after logout (and when a protected route is hit without a token). */
export const getLoginAuthPath = () => '/login';

const isOnApiHost = () => {
	const rootDomain = getRootDomain();
	const { hostname } = window.location;
	return hostname === rootDomain || hostname.endsWith(`.${rootDomain}`);
};

export const getSuperAdminBaseURL = () => {
	const rootDomain = getRootDomain();
	const protocol = window.location.protocol || 'http:';

	if (isDev()) {
		const host = stripQuotes(import.meta.env.VITE_API_BACKEND_HOST);
		if (host) return host.replace(/\/$/, '');
	}

	return `${protocol}//${rootDomain}`;
};

/** Root host + `/clients/{tenant}` so APIs resolve as `/clients/{tenant}/api/...`. */
export const getTenantApiBaseURL = (tenantSlug) => {
	const root = getSuperAdminBaseURL().replace(/\/$/, '');
	const normalizedSlug = normalizeTenantSlug(tenantSlug);
	if (!normalizedSlug) return root;
	return `${root}/clients/${normalizedSlug}`;
};

/** Normalize API tenant values (string or object) to a slug. */
export const normalizeTenantSlug = (tenant) => {
	if (!tenant) return '';
	if (typeof tenant === 'string') {
		const normalized = tenant.trim();
		return !normalized || normalized === '[object Object]' ? '' : normalized;
	}
	if (typeof tenant === 'object') {
		return String(
			tenant.schema_name ||
				tenant.tenant_name ||
				tenant.domain ||
				tenant.name ||
				tenant.slug ||
				'',
		).trim();
	}
	return String(tenant).trim();
};

/** Prefix a relative API path with `clients/{tenant}/` when a tenant is known. */
export const withClientTenantPrefix = (apiPath, tenantSlug) => {
	const normalizedSlug = normalizeTenantSlug(tenantSlug);
	const normalizedPath = String(apiPath || '').replace(/^\/+/, '');
	if (!normalizedSlug || !normalizedPath) return normalizedPath;
	if (normalizedPath.startsWith(`clients/${normalizedSlug}/`)) return normalizedPath;
	if (normalizedPath.startsWith('clients/')) return normalizedPath;
	return `clients/${normalizedSlug}/${normalizedPath}`;
};

const baseURLFunc = () => {
	const originWithoutDevPort = getOriginWithoutDevPort();

	// Option A: use page origin when app is served from root or tenant subdomain
	if (isOnApiHost() && (!isDev() || (isOnTenantSubdomain() || window.location.hostname === getRootDomain()))) {
		return originWithoutDevPort;
	}

	if (isDev()) {
		const host = stripQuotes(import.meta.env.VITE_API_BACKEND_HOST);
		return host?.replace(/\/$/, '') || originWithoutDevPort;
	}

	return originWithoutDevPort;
};

export const baseURL = baseURLFunc();

const baseURLCreator = () => {
	const url = getOriginWithoutDevPort();
	if (isDev()) {
		return `${url}:3000`;
	}
	return url;
};

export const baseURLForFrontend = baseURLCreator();

const baseURLForSocketIO = () => {
	const url = getOriginWithoutDevPort();
	if (isDev()) {
		return import.meta.env.VITE_API_BACKEND_HOST_FOR_SOCKET_IO;
	}
	return url;
};

export const wsUrl = baseURLForSocketIO();
