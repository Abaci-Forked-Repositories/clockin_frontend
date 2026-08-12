import axios from 'axios';
import {
	baseURL,
	getSuperAdminBaseURL,
	getTenantApiBaseURL,
	normalizeTenantSlug,
} from './helpers/baseURL';
import { AxiosTimeout } from './helpers/constants';
import Cookies from 'js-cookie';

export const publicAxios = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	headers: { 'content-type': 'application/json', accept: 'application/json' },
	// withCredentials: true,
});

export const publicAxiosFileUpload = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	headers: {
		'content-type': 'multipart/form-data',
		accept: 'application/json',
	},
	// withCredentials: true,
});

const authAxios = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	headers: {
		'content-type': 'application/json',
		accept: 'application/json',
	},
	// withCredentials: true,
});

const authAxiosForCSV = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	responseType: 'blob',
	// headers: {
	// 	'content-type': 'application/json',
	// 	accept: 'application/json',
	// },
	withCredentials: true,
});

const authAxiosFileUpload = axios.create({
	baseURL,
	headers: {
		'content-type': 'multipart/form-data',
		accept: 'application/json',
	},
	withCredentials: true,
});

/** Platform / public paths that must stay on the root host (no `/clients/{tenant}`). */
const TENANT_PATH_EXCLUDED = [
	'/users/validate-email',
	'/users/admin/login',
	'/users/partners/login',
	'/customers/registrations',
	'/customers/clients',
	'/customers/timezones',
	'/customers/licenses',
	'/customers/signup',
	'/signup-verify-email',
	'/partners/',
];

const shouldSkipTenantClientPath = (url = '') => {
	const normalized = String(url)
		.toLowerCase()
		.replace(/^https?:\/\/[^/]+/i, '');
	return TENANT_PATH_EXCLUDED.some((path) => normalized.includes(path));
};

const resolveRequestTenant = (config) => {
	const explicitTenant = config?.clientTenant;
	return normalizeTenantSlug(explicitTenant) || normalizeTenantSlug(Cookies.get('tenant'));
};

/**
 * Force every tenant request onto `{host}/clients/{tenant}/...`.
 * Also strips a leading `/` on relative URLs so axios does not drop the `/clients/{tenant}` path.
 * Prefer `config.clientTenant` (explicit) over the cookie so login never races the cookie write.
 */
const attachTenantClientPathInterceptor = (instance) => {
	instance.interceptors.request.use((config) => {
		const requestUrl = config.url || '';
		const skipTenantPath = shouldSkipTenantClientPath(requestUrl);
		const tenantName = resolveRequestTenant(config);

		if (!/^https?:\/\//i.test(requestUrl) && requestUrl.startsWith('/')) {
			config.url = requestUrl.replace(/^\/+/, '');
		}

		if (skipTenantPath || !tenantName) {
			config.baseURL = getSuperAdminBaseURL().replace(/\/$/, '') || baseURL;
			return config;
		}

		// Avoid `clients/{tenant}/clients/{tenant}/...` if caller already prefixed.
		const relativeUrl = String(config.url || '');
		if (
			relativeUrl.startsWith(`clients/${tenantName}/`) ||
			relativeUrl.startsWith('clients/')
		) {
			config.baseURL = getSuperAdminBaseURL().replace(/\/$/, '') || baseURL;
			return config;
		}

		config.baseURL = getTenantApiBaseURL(tenantName);
		return config;
	});
};

[publicAxios, publicAxiosFileUpload, authAxios, authAxiosFileUpload, authAxiosForCSV].forEach(
	attachTenantClientPathInterceptor,
);

const getTenantScopedBaseURL = (tenantValue) => {
	const tenantName =
		normalizeTenantSlug(tenantValue) || normalizeTenantSlug(Cookies.get('tenant'));
	return getTenantApiBaseURL(tenantName);
};

export const updateToken = (newToken, tenant) => {
	authAxios.defaults.headers.Authorization = `Bearer ${newToken}`;
	authAxiosFileUpload.defaults.headers.Authorization = `Bearer ${newToken}`;
	authAxiosForCSV.defaults.headers.Authorization = `Bearer ${newToken}`;
	const tenantScopedBaseURL = getTenantScopedBaseURL(tenant);
	authAxios.defaults.baseURL = tenantScopedBaseURL;
	authAxiosFileUpload.defaults.baseURL = tenantScopedBaseURL;
	authAxiosForCSV.defaults.baseURL = tenantScopedBaseURL;
};

export const setInitialToken = () => {
	const token = Cookies.get('token');
	const tenantScopedBaseURL = getTenantScopedBaseURL();
	authAxios.defaults.headers.Authorization = `Bearer ${token}`;
	authAxiosFileUpload.defaults.headers.Authorization = `Bearer ${token}`;
	authAxiosForCSV.defaults.headers.Authorization = `Bearer ${token}`;
	authAxios.defaults.baseURL = tenantScopedBaseURL;
	authAxiosFileUpload.defaults.baseURL = tenantScopedBaseURL;
	authAxiosForCSV.defaults.baseURL = tenantScopedBaseURL;
};

setInitialToken();

export { authAxios, authAxiosFileUpload, authAxiosForCSV };
