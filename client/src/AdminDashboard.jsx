import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './components/AdminLayout';
import DashboardStats from './components/DashboardStats';
import UserManagement from './components/UserManagement';
import FeedbackModeration from './components/FeedbackModeration';
import { API_URL, getAuthHeaders } from './utils/api';

export default function AdminDashboard({ onClose }) {
	const [activeTab, setActiveTab] = useState('dashboard');
	const [stats, setStats] = useState({});
	const [users, setUsers] = useState([]);
	const [stories, setStories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const authHeaders = getAuthHeaders();

	// Fetch dashboard stats
	const loadStats = async () => {
		try {
			setError('');
			if (!authHeaders) {
				setError('Missing auth token. Please login again.');
				return;
			}
			const res = await axios.get(`${API_URL}/api/admin/stats`, { headers: authHeaders });
			setStats(res.data || {});
		} catch (err) {
			console.error('Failed to load stats:', err);
			setError(err?.response?.data?.error || 'Failed to load statistics');
		}
	};

	// Fetch all users
	const loadUsers = async () => {
		try {
			setLoading(true);
			setError('');
			if (!authHeaders) {
				setError('Missing auth token. Please login again.');
				return;
			}
			const res = await axios.get(`${API_URL}/api/admin/users`, { headers: authHeaders });
			setUsers(res.data || []);
		} catch (err) {
			setError(err?.response?.data?.error || 'Failed to load users');
			console.error('Failed to load users:', err);
		} finally {
			setLoading(false);
		}
	};

	// Fetch all success stories
	const loadStories = async () => {
		try {
			setLoading(true);
			setError('');
			if (!authHeaders) {
				setError('Missing auth token. Please login again.');
				return;
			}
			const res = await axios.get(`${API_URL}/api/admin/feedback`, { headers: authHeaders });
			setStories(res.data || []);
		} catch (err) {
			setError(err?.response?.data?.error || 'Failed to load feedback');
			console.error('Failed to load feedback:', err);
		} finally {
			setLoading(false);
		}
	};

	// Load data based on active tab
	useEffect(() => {
		if (activeTab === 'dashboard') {
			loadStats();
		} else if (activeTab === 'users') {
			loadUsers();
		} else if (activeTab === 'feedback') {
			loadStories();
		}
	}, [activeTab]);

	const handleLogout = () => {
		if (confirm('Are you sure you want to close the admin panel?')) {
			if (onClose) onClose();
		}
	};

	return (
		<AdminLayout
			activeTab={activeTab}
			onTabChange={setActiveTab}
			onLogout={handleLogout}
		>
			{error && (
				<div className="m-8 p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-800">
					<strong>Error:</strong> {error}
				</div>
			)}

			{loading && activeTab !== 'dashboard' && (
				<div className="flex items-center justify-center h-full">
					<div className="text-center">
						<div className="inline-block w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
						<p className="text-gray-600 text-lg">Loading...</p>
					</div>
				</div>
			)}

			{!loading && activeTab === 'dashboard' && <DashboardStats stats={stats} />}
			{!loading && activeTab === 'users' && (
				<UserManagement users={users} onRefresh={loadUsers} authHeaders={authHeaders} />
			)}
			{!loading && activeTab === 'feedback' && (
				<FeedbackModeration stories={stories} onRefresh={loadStories} authHeaders={authHeaders} />
			)}
		</AdminLayout>
	);
}
