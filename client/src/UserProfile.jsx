import { useEffect, useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import SuccessStoryModal from './components/SuccessStoryModal';
import { API_URL } from './utils/api';

export default function UserProfile({ user, onClose, onDelete }) {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [closing, setClosing] = useState(false);
	const [impactScore, setImpactScore] = useState(user?.impactScore || 0);
	const [selectedDonation, setSelectedDonation] = useState(null);

	useEffect(() => {
		async function fetchPosts() {
			try {
				setLoading(true);
				setError('');
				const res = await axios.get(
					`${API_URL}/api/donations/my-posts?email=${encodeURIComponent(user?.email || '')}`
				);
				setPosts(res.data || []);
				
				// Fetch user's impact score
				if (user?.email) {
					try {
						const userRes = await axios.get(
							`${API_URL}/api/auth/user?email=${encodeURIComponent(user.email)}`
						);
						if (userRes.data?.impactScore !== undefined) {
							setImpactScore(userRes.data.impactScore);
						}
					} catch (err) {
						console.error('Failed to fetch impact score:', err);
					}
				}
			} catch (err) {
				setError(err?.response?.data?.error || 'Failed to load posts');
			} finally {
				setLoading(false);
			}
		}
		if (user?.email) fetchPosts();
	}, [user?.email]);

	function handleLogout() {
		localStorage.removeItem('donorly_token');
		localStorage.removeItem('donorly_user');
		localStorage.removeItem('user');
		if (typeof onClose === 'function') onClose();
		window.location.reload();
	}

	function handleClose() {
		// trigger closing animation then call onClose
		setClosing(true);
		setTimeout(() => {
			if (typeof onClose === 'function') onClose();
		}, 280); // match animation duration
	}

	async function handleDelete(id) {
		try {
			await axios.delete(`${API_URL}/api/donations/${id}`);
			setPosts((prev) => prev.filter((p) => p._id !== id));
			if (typeof onDelete === 'function') onDelete();
		} catch (err) {
			alert(err?.response?.data?.error || 'Failed to delete');
		}
	}

	async function handleMarkAsFulfilled(id) {
		try {
			const res = await axios.post(`${API_URL}/api/donations/complete/${id}`);
			
			// Update impact score
			if (res.data?.newScore !== undefined) {
				setImpactScore(res.data.newScore);
			}
			
			// Remove from posts list
			setPosts((prev) => prev.filter((p) => p._id !== id));
			
			// Trigger confetti celebration! 🎉
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ['#16a34a', '#10b981', '#fbbf24', '#f59e0b'],
			});
			
			if (typeof onDelete === 'function') onDelete();
		} catch (err) {
			alert(err?.response?.data?.error || 'Failed to mark as fulfilled');
		}
	}

function handleMarkAsFulfilled(id) {
	// Find the donation and open the success story modal
	const donation = posts.find(p => p._id === id);
	if (donation) {
		setSelectedDonation(donation);
	}
}

function handleStorySuccess(newScore) {
	// Update impact score
	if (newScore !== undefined) {
		setImpactScore(newScore);
	}
	
	// Remove from posts list
	if (selectedDonation) {
		setPosts((prev) => prev.filter((p) => p._id !== selectedDonation._id));
	}
	
	// Close modal
	setSelectedDonation(null);
	
	if (typeof onDelete === 'function') onDelete();
}

const drawerStyle = {
	position: 'fixed',
	top: 0,
	right: 0,
	height: '100vh',
	width: '400px',
	background: '#ffffff',
	zIndex: 2000,
	boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
	display: 'flex',
	flexDirection: 'column',
	borderLeft: 'none',
};

	const headerStyle = {
		padding: '24px',
		borderBottom: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		background: 'linear-gradient(135deg, #10b981, #059669)',
		color: '#ffffff',
		boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
	};

	const logoutBtn = {
		background: 'linear-gradient(135deg, #f43f5e, #dc2626)',
		color: '#fff',
		border: 'none',
		borderRadius: 12,
		padding: '10px 16px',
		fontWeight: 700,
		cursor: 'pointer',
		boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
		transition: 'all 0.2s ease',
	};

	const bodyStyle = { padding: '20px 24px', overflowY: 'auto', background: '#f8fafc' };
	const cardStyle = {
		border: '2px solid #e2e8f0',
		borderRadius: 16,
		padding: '16px 18px',
		marginBottom: '16px',
		boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
		background: '#ffffff',
		transition: 'all 0.3s ease',
	};

	return (
		<aside style={drawerStyle} className={`user-drawer${closing ? ' closing' : ''}`}>
			<div style={headerStyle}>
				<div>
					<div style={{ fontWeight: 800, fontSize: '20px' }}>{user?.name || 'User'}</div>
					<div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{user?.email}</div>
					<div style={{ 
						display: 'flex', 
						alignItems: 'center', 
						gap: '6px', 
						marginTop: '10px',
						background: 'rgba(255,255,255,0.2)',
						padding: '6px 12px',
						borderRadius: '12px',
						color: '#ffffff',
						fontWeight: 700,
						fontSize: '15px'
					}}>
						<Star size={18} fill="#fbbf24" />
						Impact Score: {impactScore}
					</div>
				</div>
				<div style={{ display: 'flex', gap: '8px' }}>
				<button 
					onClick={handleLogout} 
					style={logoutBtn}
					onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
					onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
				>Logout</button>
				<button 
					onClick={handleClose} 
					style={{ ...logoutBtn, background: 'rgba(255,255,255,0.2)' }}
					onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
					onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
				>Close</button>
				</div>
			</div>

			<div style={bodyStyle}>
				{loading && <div>Loading posts...</div>}
				{error && <div style={{ color: '#b91c1c' }}>{error}</div>}
				{!loading && posts.length === 0 && <div>No posts yet.</div>}
				{posts.map((p) => {
					const isRequest = /^REQUEST_/.test(p.itemType);
					const typeColor = isRequest ? '#e11d48' : '#16a34a';
					return (
					<div 
						key={p._id} 
						style={cardStyle}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = 'translateY(-2px)';
							e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
							e.currentTarget.style.borderColor = '#10b981';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'translateY(0)';
							e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
							e.currentTarget.style.borderColor = '#e2e8f0';
						}}
					>
						<div style={{ fontWeight: 800, color: typeColor, fontSize: '15px', letterSpacing: '0.3px' }}>{p.itemType}</div>
						<div style={{ color: '#64748b', fontSize: '12px', margin: '8px 0' }}>
							{new Date(p.createdAt).toLocaleString()}
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
							<div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>{p.description || 'No description'}</div>
							<div style={{ display: 'flex', gap: '8px' }}>
								<button
									onClick={() => handleMarkAsFulfilled(p._id)}
									style={{
										background: 'linear-gradient(135deg, #10b981, #059669)',
										color: '#fff',
										border: 'none',
										borderRadius: 12,
										padding: '10px 16px',
										fontWeight: 700,
										cursor: 'pointer',
										boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
										transition: 'all 0.2s ease',
										fontSize: '13px',
									}}
									onMouseEnter={(e) => {
										e.target.style.transform = 'scale(1.05)';
										e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
									}}
									onMouseLeave={(e) => {
										e.target.style.transform = 'scale(1)';
										e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
									}}
									title="Mark as Fulfilled"
								>
									✅ Mark as Fulfilled
								</button>
								<button
									onClick={() => handleDelete(p._id)}
								onMouseEnter={(e) => {
									e.target.style.transform = 'scale(1.05)';
									e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
								}}
								onMouseLeave={(e) => {
									e.target.style.transform = 'scale(1)';
									e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
								}}
								style={{
									background: 'linear-gradient(135deg, #f43f5e, #dc2626)',
									color: '#fff',
									border: 'none',
									borderRadius: 12,
									padding: '10px 16px',
									fontWeight: 700,
									fontSize: '13px',
									cursor: 'pointer',
									boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
									transition: 'all 0.2s ease',
								}}
								title="Delete"
							>
								🗑️ Delete
						</button>
					</div>
				</div>
			</div>
			);
		})}
	</div>

	{/* Success Story Modal */}
	{selectedDonation && (
		<SuccessStoryModal
			user={user}
			donation={selectedDonation}
			onClose={() => setSelectedDonation(null)}
			onSuccess={handleStorySuccess}
		/>
	)}
</aside>);
}