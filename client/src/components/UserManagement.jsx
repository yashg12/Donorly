import { useState } from 'react';
import axios from 'axios';
import { Pencil, Save, X } from 'lucide-react';
import { API_URL } from '../utils/api';

export default function UserManagement({ users, onRefresh, authHeaders }) {
	const [editingId, setEditingId] = useState(null);
	const [editScore, setEditScore] = useState(0);
	const [loading, setLoading] = useState(false);

	const handleEditClick = (user) => {
		setEditingId(user._id);
		setEditScore(user.impactScore || 0);
	};

	const handleSave = async (userId) => {
		setLoading(true);
		try {
			if (!authHeaders) {
				alert('Missing auth token. Please login again.');
				return;
			}
			await axios.put(
				`${API_URL}/api/admin/users/${userId}/score`,
				{ impactScore: Number(editScore) },
				{ headers: authHeaders }
			);
			setEditingId(null);
			onRefresh();
			alert('Impact score updated successfully!');
		} catch (err) {
			alert(err?.response?.data?.error || 'Failed to update score');
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditScore(0);
	};

	const toggleVerify = async (user) => {
		const newStatus = !user.isVerified;
		try {
			if (!authHeaders) {
				alert('Missing auth token. Please login again.');
				return;
			}
			await axios.put(
				`${API_URL}/api/admin/verify/${user._id}`,
				{ isVerified: newStatus },
				{ headers: authHeaders }
			);
			onRefresh();
		} catch (err) {
			alert(err?.response?.data?.error || 'Failed to update verification');
		}
	};

	return (
		<div className="p-8">
			<div className="mb-6">
				<h2 className="text-3xl font-bold text-gray-900">User Control</h2>
				<p className="text-gray-600 mt-1">Manage users and impact scores</p>
			</div>

			<div className="bg-white rounded-xl shadow-lg overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-800 text-white">
						<tr>
							<th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
								Email
							</th>
							<th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
								Role
							</th>
							<th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
								Verified
							</th>
							<th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
								Impact Score
							</th>
							<th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{users.map((user) => (
							<tr key={user._id} className="hover:bg-gray-50 transition-colors">
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
											{user.name.charAt(0).toUpperCase()}
										</div>
										<div className="ml-4">
											<div className="text-sm font-semibold text-gray-900">{user.name}</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
									{user.email}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className={`px-3 py-1 rounded-full text-xs font-bold ${
										user.role === 'NGO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
									}`}>
										{user.role}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<button
										onClick={() => toggleVerify(user)}
										className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
											user.isVerified
												? 'bg-green-100 text-green-800 hover:bg-green-200'
												: 'bg-red-100 text-red-800 hover:bg-red-200'
										}`}
									>
										{user.isVerified ? '✓ Verified' : '✗ Not Verified'}
									</button>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{editingId === user._id ? (
										<div className="flex items-center gap-2">
											<input
												type="number"
												value={editScore}
												onChange={(e) => setEditScore(e.target.value)}
												className="w-24 px-3 py-1.5 border-2 border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
												min="0"
											/>
											<button
												onClick={() => handleSave(user._id)}
												disabled={loading}
												className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
												title="Save"
											>
												<Save size={16} />
											</button>
											<button
												onClick={handleCancel}
												disabled={loading}
												className="p-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-colors"
												title="Cancel"
											>
												<X size={16} />
											</button>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<span className="text-lg font-bold text-gray-900">
												{user.impactScore || 0}
											</span>
											<button
												onClick={() => handleEditClick(user)}
												className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
												title="Edit Score"
											>
												<Pencil size={14} />
											</button>
										</div>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									<span className="text-xs text-gray-400">ID: {user._id.slice(-6)}</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{users.length === 0 && (
					<div className="text-center py-12 text-gray-500">
						No users found.
					</div>
				)}
			</div>
		</div>
	);
}
