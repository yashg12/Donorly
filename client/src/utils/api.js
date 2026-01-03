import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getAuthHeaders() {
	const token = localStorage.getItem('donorly_token');
	return token ? { Authorization: `Bearer ${token}` } : null;
}

// Optional convenience client; use when you want shared baseURL defaults.
export const apiClient = axios.create({
	baseURL: API_URL,
});
