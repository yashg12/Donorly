import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { Heart, Sparkles } from 'lucide-react';

export default function ImpactFeed() {
	const [stories, setStories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchStories() {
			try {
				const res = await axios.get(`${API_URL}/api/stories/stories?limit=3`);
				setStories(res.data || []);
			} catch (err) {
				console.error('Failed to fetch stories:', err);
				setStories([]); // Set empty array on error
			} finally {
				setLoading(false);
			}
		}
		fetchStories();
	}, []);

	const getItemColor = (itemType) => {
		const type = itemType.toUpperCase();
		if (type.includes('BLOOD')) return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
		if (type.includes('FOOD')) return { bg: '#dcfce7', border: '#16a34a', text: '#166534' };
		if (type.includes('CLOTHES')) return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
		return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' };
	};

	return (
		<div className="w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Sparkles className="text-yellow-500" size={36} />
						<h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
							Wall of Kindness
						</h2>
						<Heart className="text-red-500" size={36} fill="currentColor" />
					</div>
					<p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
						Real stories from real people making a difference. Be inspired! 💚
					</p>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
						<p className="mt-4 text-gray-600">Loading inspiring stories...</p>
					</div>
				) : stories.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-2xl shadow-lg">
						<Sparkles className="mx-auto text-gray-400 mb-4" size={48} />
						<p className="text-xl text-gray-600">No stories yet. Be the first to share your impact!</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{stories.map((story, index) => {
							const colors = getItemColor(story.itemType);
							return (
								<div
									key={story._id || index}
									className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 p-6 border-2 border-transparent hover:border-green-400"
									style={{
										animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
									}}
								>
									{/* Badge */}
									<div className="flex items-center justify-between mb-4">
										<span
											className="px-4 py-1.5 rounded-full text-sm font-bold"
											style={{
												background: colors.bg,
												border: `2px solid ${colors.border}`,
												color: colors.text,
											}}
										>
											{story.itemType}
										</span>
										<span className="text-2xl">✨</span>
									</div>

									{/* Story Text */}
									<p className="text-gray-800 text-base leading-relaxed mb-4 min-h-[80px]">
										"{story.story}"
									</p>

									{/* Footer */}
									<div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
										<div className="flex items-center gap-2">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
												{(story.userName || 'A').charAt(0).toUpperCase()}
											</div>
											<div>
												<p className="font-semibold text-gray-900 text-sm">
													{story.userName || 'Anonymous'}
												</p>
												<p className="text-xs text-gray-500">
													{new Date(story.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-1 text-yellow-500">
											<span className="text-sm font-bold">+{story.impactScore || 10}</span>
											<Heart size={16} fill="currentColor" />
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Call to Action */}
				<div className="mt-12 text-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
					<h3 className="text-2xl md:text-3xl font-bold mb-3">
						Ready to Make an Impact? 🌟
					</h3>
					<p className="text-lg mb-6 opacity-95">
						Join our community of givers. Your story could be next!
					</p>
					<button
						onClick={() => {
							const authSection = document.getElementById('auth-section');
							if (authSection) {
								authSection.scrollIntoView({ behavior: 'smooth' });
							}
						}}
						className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
					>
						Start Giving Today →
					</button>
				</div>
			</div>

			<style>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.scrollbar-thin::-webkit-scrollbar {
					width: 8px;
				}

				.scrollbar-thin::-webkit-scrollbar-track {
					background: #dcfce7;
					border-radius: 10px;
				}

				.scrollbar-thin::-webkit-scrollbar-thumb {
					background: #16a34a;
					border-radius: 10px;
				}

				.scrollbar-thin::-webkit-scrollbar-thumb:hover {
					background: #15803d;
				}
			`}</style>
		</div>
	);
}
