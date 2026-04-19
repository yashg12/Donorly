import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isLocalhost =
	isBrowser &&
	(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL =
	import.meta.env.VITE_API_URL || (import.meta.env.DEV || isLocalhost ? 'http://localhost:5000' : '/api');

export function getAuthHeaders() {
	const tokenRaw = localStorage.getItem('donorly_token');
	const token = String(tokenRaw || '').trim();
	if (!token || token === 'null' || token === 'undefined') return null;
	return { Authorization: `Bearer ${token}` };
}

export function clearAuthSession() {
	localStorage.removeItem('donorly_token');
	localStorage.removeItem('donorly_user');
	localStorage.removeItem('user');
}

export function isAuthError(err) {
	const status = err?.response?.status;
	if (status === 401) return true;
	const msg = String(err?.response?.data?.error || '').toLowerCase();
	return msg.includes('invalid or expired token') || msg.includes('missing authorization');
}

export function handleAuthExpiry(err) {
	if (!isAuthError(err)) return false;
	clearAuthSession();
	return true;
}

// Optional convenience client; use when you want shared baseURL defaults.
export const apiClient = axios.create({
	baseURL: API_URL,
});
