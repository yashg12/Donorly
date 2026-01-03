import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { X, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SuccessStoryModal({ user, donation, onClose, onSuccess }) {
	const [story, setStory] = useState('');
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e, skipStory = false) => {
		if (e) e.preventDefault();

		setLoading(true);

		try {
			// Save the success story only if not skipping and story exists
			if (!skipStory && story.trim()) {
				await axios.post(`${API_URL}/api/stories/save`, {
					userEmail: user?.email || 'anonymous@donorly.com',
					userName: user?.name || 'Anonymous',
					itemType: donation?.itemType || 'Donation',
					story: story.trim(),
				});
			}

			// Complete the donation (mark as fulfilled)
			const response = await axios.post(`${API_URL}/api/donations/complete/${donation._id}`);
			setSubmitted(true);

			// Trigger confetti! 🎉
			confetti({
				particleCount: 150,
				spread: 100,
				origin: { y: 0.6 },
				colors: ['#16a34a', '#10b981', '#fbbf24', '#f59e0b', '#ec4899'],
			});

			setTimeout(() => {
				if (onSuccess) {
					onSuccess(response.data?.newScore);
				}
				onClose();
			}, 2500);
		} catch (err) {
			alert(err?.response?.data?.error || 'Failed to complete donation. Please try again.');
			setLoading(false);
		}
	};

	const handleSkip = () => {
		handleSubmit(null, true);
	};

	return (
		<>
			<style>{`
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				@keyframes slideUp {
					from { opacity: 0; transform: translateY(30px) scale(0.95); }
					to { opacity: 1; transform: translateY(0) scale(1); }
				}
				@keyframes pulse {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.05); }
				}
				@keyframes sparkle {
					0%, 100% { transform: rotate(0deg) scale(1); }
					50% { transform: rotate(180deg) scale(1.2); }
				}
				.story-overlay {
					animation: fadeIn 0.2s ease-out;
				}
				.story-modal {
					animation: slideUp 0.3s ease-out;
				}
				.sparkle-icon {
					animation: sparkle 2s ease-in-out infinite;
				}
			`}</style>

			{/* Overlay */}
			<div
				className="story-overlay"
				onClick={onClose}
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.7)',
					backdropFilter: 'blur(4px)',
					zIndex: 10000,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '20px',
				}}
			>
				{/* Modal */}
				<div
					className="story-modal"
					onClick={(e) => e.stopPropagation()}
					style={{
						background: 'white',
						borderRadius: '24px',
						maxWidth: '520px',
						width: '100%',
						boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
						overflow: 'hidden',
					}}
				>
					{!submitted ? (
						<>
							{/* Header */}
							<div
								style={{
									background: 'linear-gradient(135deg, #16a34a 0%, #10b981 50%, #059669 100%)',
									padding: '28px 24px',
									color: 'white',
									position: 'relative',
								}}
							>
								<button
									onClick={onClose}
									style={{
										position: 'absolute',
										top: '16px',
										right: '16px',
										background: 'rgba(255, 255, 255, 0.2)',
										border: 'none',
										borderRadius: '50%',
										width: '36px',
										height: '36px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										color: 'white',
										transition: 'all 0.2s',
									}}
									onMouseEnter={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.3)')}
									onMouseLeave={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
								>
									<X size={20} />
								</button>

								<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
									<Sparkles className="sparkle-icon" size={36} />
									<h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>
										Share Your Impact Story! 🎉
									</h2>
								</div>
								<p style={{ margin: 0, opacity: 0.95, fontSize: '15px', lineHeight: '1.5' }}>
									You're about to mark <strong>{donation?.itemType}</strong> as fulfilled! Share how this helped someone.
								</p>
							</div>

							{/* Form */}
							<form onSubmit={handleSubmit} style={{ padding: '28px' }}>
								{/* Story Input */}
								<div style={{ marginBottom: '24px' }}>
									<label
										htmlFor="success-story"
										style={{
											display: 'block',
											fontSize: '16px',
											fontWeight: 700,
											color: '#111827',
											marginBottom: '10px',
										}}
									>
										Tell us about the impact ✨
									</label>
									<textarea
										id="success-story"
										value={story}
										onChange={(e) => setStory(e.target.value)}
										placeholder="Example: 'Helped a family in need with fresh groceries. They were so grateful! 💚' or 'Donated blood that saved a life. Feeling blessed to help!'"
										rows={5}
										maxLength={500}

										style={{
											width: '100%',
											padding: '14px',
											borderRadius: '14px',
											border: '2px solid #e5e7eb',
											fontSize: '15px',
											resize: 'vertical',
											fontFamily: 'inherit',
											transition: 'border-color 0.2s',
											outline: 'none',
											lineHeight: '1.6',
										}}
										onFocus={(e) => (e.target.style.borderColor = '#10b981')}
										onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
									/>
									<div style={{ 
										display: 'flex', 
										justifyContent: 'space-between',
										alignItems: 'center',
										marginTop: '8px' 
									}}>
										<span style={{ fontSize: '13px', color: '#6b7280' }}>
											Your story will inspire others! 💚
										</span>
										<span style={{ fontSize: '12px', color: '#9ca3af' }}>
											{story.length}/500
										</span>
									</div>
								</div>

								{/* Impact Notice */}
								<div style={{
									background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
									padding: '16px',
									borderRadius: '12px',
									marginBottom: '24px',
									border: '2px solid #fbbf24',
								}}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
										<span style={{ fontSize: '20px' }}>⭐</span>
										<span style={{ fontWeight: 700, color: '#92400e' }}>
											Reward: +10 Impact Score!
										</span>
									</div>
									<p style={{ margin: 0, fontSize: '13px', color: '#78350f' }}>
										Share your story to inspire others on the "Wall of Kindness"! (Optional)
									</p>
								</div>

								{/* Action Buttons */}
								<div style={{ display: 'flex', gap: '12px' }}>
									<button
										type="button"
										onClick={handleSkip}
										disabled={loading}
										style={{
											flex: '1',
											padding: '16px',
											background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
											color: 'white',
											border: 'none',
											borderRadius: '14px',
											fontSize: '16px',
											fontWeight: 700,
											cursor: loading ? 'not-allowed' : 'pointer',
											opacity: loading ? 0.6 : 1,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											gap: '8px',
											transition: 'all 0.2s',
										}}
										onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
										onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
									>
										{loading ? 'Processing...' : 'Skip Story'}
									</button>
									<button
										type="submit"
										disabled={loading || !story.trim()}
										style={{
											flex: '2',
											padding: '16px',
											background: !story.trim() ? '#d1d5db' : 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
											color: 'white',
											border: 'none',
											borderRadius: '14px',
											fontSize: '17px',
											fontWeight: 800,
											cursor: (!story.trim() || loading) ? 'not-allowed' : 'pointer',
											opacity: (!story.trim() || loading) ? 0.6 : 1,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											gap: '10px',
											boxShadow: !story.trim() ? 'none' : '0 6px 16px rgba(16, 185, 129, 0.4)',
											transition: 'all 0.3s ease',
										}}
									onMouseEnter={(e) => {
										if (story.trim() && !loading) {
											e.target.style.transform = 'translateY(-2px)';
											e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.5)';
										}
									}}
									onMouseLeave={(e) => {
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = !story.trim() ? 'none' : '0 6px 16px rgba(16, 185, 129, 0.4)';
									}}
								>
									{loading ? (
										<>
											<div
												style={{
													width: '22px',
													height: '22px',
													border: '3px solid rgba(255,255,255,0.3)',
													borderTopColor: 'white',
													borderRadius: '50%',
													animation: 'spin 0.8s linear infinite',
												}}
											/>
											Saving Your Story...
										</>
									) : (
										<>
											<Send size={22} />
											Mark as Fulfilled & Share Story
										</>
									)}
								</button>
							</div>
						</form>
						</>
					) : (
						// Success State
						<div
							style={{
								padding: '70px 40px',
								textAlign: 'center',
							}}
						>
							<div
								style={{
									width: '90px',
									height: '90px',
									borderRadius: '50%',
									background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
									margin: '0 auto 24px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '52px',
									animation: 'pulse 0.6s ease-out',
								}}
							>
								🎉
							</div>
							<h3 style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
								Amazing! +10 Points!
							</h3>
							<p style={{ fontSize: '17px', color: '#6b7280', margin: '0 0 12px 0' }}>
								Your success story has been saved and will inspire others on the <strong>Wall of Kindness</strong>!
							</p>
							<p style={{ fontSize: '15px', color: '#10b981', fontWeight: 600, margin: 0 }}>
								Thank you for making a difference! 💚
							</p>
						</div>
					)}
				</div>
			</div>

			<style>{`
				@keyframes spin {
					to { transform: rotate(360deg); }
				}
			`}</style>
		</>
	);
}
