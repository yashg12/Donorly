import { useState } from 'react';
import axios from 'axios';
import { Trash2, AlertTriangle } from 'lucide-react';
import { API_URL } from '../utils/api';

export default function FeedbackModeration({ stories, onRefresh, authHeaders }) {
	const [deleting, setDeleting] = useState(null);

	// Filter only valid success stories (must have userName and story fields)
	const validStories = stories.filter(s => s.userName && s.story && s.userEmail);

	const handleDelete = async (storyId) => {
		if (!confirm('Are you sure you want to delete this success story? This action cannot be undone.')) {
			return;
		}

		setDeleting(storyId);
		try {
			if (!authHeaders) {
				alert('Missing auth token. Please login again.');
				return;
			}
			await axios.delete(`${API_URL}/api/admin/feedback/${storyId}`, { headers: authHeaders });
			alert('Success story deleted successfully');
			onRefresh();
		} catch (err) {
			alert(err?.response?.data?.error || 'Failed to delete story');
		} finally {
			setDeleting(null);
		}
	};

	const getItemColor = (itemType) => {
		const type = itemType.toUpperCase();
		if (type.includes('BLOOD')) return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
		if (type.includes('FOOD')) return { bg: '#dcfce7', border: '#16a34a', text: '#166534' };
		if (type.includes('CLOTHES')) return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
		return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' };
	};

	return (
		<div className="p-8">
			<div className="mb-6">
				<h2 className="text-3xl font-bold text-gray-900">Feedback Moderation</h2>
				<p className="text-gray-600 mt-1">Review and moderate success stories ({validStories.length} total)</p>
			</div>

			{validStories.length === 0 ? (
				<div className="bg-white rounded-xl shadow-lg p-12 text-center">
					<AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-xl text-gray-600">No success stories found</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{validStories.map((story) => {
						const colors = getItemColor(story.itemType);
						return (
							<div
								key={story._id}
								className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-red-200"
							>
								{/* Header */}
								<div className="p-6 border-b border-gray-100">
									<div className="flex items-center justify-between mb-3">
										<span
											className="px-3 py-1 rounded-full text-xs font-bold"
											style={{
												background: colors.bg,
												border: `2px solid ${colors.border}`,
												color: colors.text,
											}}
										>
											{story.itemType}
										</span>
										<span className="text-sm text-gray-500">
											{new Date(story.createdAt).toLocaleDateString()}
										</span>
									</div>

									<div className="flex items-center gap-3">
										<div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
											{story.userName.charAt(0).toUpperCase()}
										</div>
										<div className="flex-1">
											<p className="font-semibold text-gray-900">{story.userName}</p>
											<p className="text-xs text-gray-500">{story.userEmail}</p>
										</div>
									</div>
								</div>

								{/* Story Content */}
								<div className="p-6">
									<p className="text-gray-800 text-sm leading-relaxed mb-4">
										"{story.story}"
									</p>

									<div className="flex items-center justify-between pt-4 border-t border-gray-100">
										<span className="text-sm font-semibold text-gray-600">
											Impact: <span className="text-green-600">+{story.impactScore || 10}</span>
										</span>
										<span className="text-xs text-gray-400">
											ID: {story._id.slice(-8)}
										</span>
									</div>
								</div>

								{/* Delete Button */}
								<div className="p-4 bg-gray-50 border-t border-gray-100">
									<button
										onClick={() => handleDelete(story._id)}
										disabled={deleting === story._id}
										className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									>
										<Trash2 size={18} />
										{deleting === story._id ? 'Deleting...' : 'Delete Story'}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
