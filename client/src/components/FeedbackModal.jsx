import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { Star, X, Send, MessageSquare } from 'lucide-react';

export default function FeedbackModal({ user, onClose }) {
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (rating === 0) {
			alert('Please select a rating!');
			return;
		}
		
		if (!message.trim()) {
			alert('Please write your feedback message!');
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post(`${API_URL}/api/feedback/submit`, {
				userEmail: user?.email || 'anonymous@donorly.com',
				userName: user?.name || 'Anonymous',
				rating,
				message: message.trim(),
			});

			if (response.data.success) {
				setSubmitted(true);
				setTimeout(() => {
					onClose();
				}, 2000);
			}
		} catch (err) {
			alert(err?.response?.data?.error || 'Failed to submit feedback. Please try again.');
		} finally {
			setLoading(false);
		}
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
				.feedback-overlay {
					animation: fadeIn 0.2s ease-out;
				}
				.feedback-modal {
					animation: slideUp 0.3s ease-out;
				}
				.star-button {
					transition: all 0.2s ease;
					cursor: pointer;
				}
				.star-button:hover {
					transform: scale(1.1);
				}
				.submit-btn {
					transition: all 0.3s ease;
				}
				.submit-btn:hover:not(:disabled) {
					transform: translateY(-2px);
					box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
				}
				.success-checkmark {
					animation: pulse 0.6s ease-out;
				}
			`}</style>

			{/* Overlay */}
			<div
				className="feedback-overlay"
				onClick={onClose}
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.6)',
					backdropFilter: 'blur(4px)',
					zIndex: 9999,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '20px',
				}}
			>
				{/* Modal */}
				<div
					className="feedback-modal"
					onClick={(e) => e.stopPropagation()}
					style={{
						background: 'white',
						borderRadius: '20px',
						maxWidth: '480px',
						width: '100%',
						boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
						overflow: 'hidden',
					}}
				>
					{!submitted ? (
						<>
							{/* Header */}
							<div
								style={{
									background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
									padding: '24px',
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
										width: '32px',
										height: '32px',
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

								<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
									<MessageSquare size={32} />
									<h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
										Share Your Feedback
									</h2>
								</div>
								<p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
									Help us improve Donorly! We'd love to hear from you.
								</p>
							</div>

							{/* Form */}
							<form onSubmit={handleSubmit} style={{ padding: '24px' }}>
								{/* Rating Section */}
								<div style={{ marginBottom: '24px', textAlign: 'center' }}>
									<label
										style={{
											display: 'block',
											fontSize: '16px',
											fontWeight: 600,
											color: '#374151',
											marginBottom: '12px',
										}}
									>
										How would you rate your experience?
									</label>
									<div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
										{[1, 2, 3, 4, 5].map((star) => (
											<button
												key={star}
												type="button"
												className="star-button"
												onClick={() => setRating(star)}
												onMouseEnter={() => setHoveredRating(star)}
												onMouseLeave={() => setHoveredRating(0)}
												style={{
													background: 'none',
													border: 'none',
													padding: '4px',
												}}
											>
												<Star
													size={40}
													fill={
														(hoveredRating || rating) >= star
															? '#fbbf24'
															: 'transparent'
													}
													stroke={
														(hoveredRating || rating) >= star
															? '#fbbf24'
															: '#d1d5db'
													}
													strokeWidth={2}
												/>
											</button>
										))}
									</div>
									{rating > 0 && (
										<p style={{ marginTop: '8px', color: '#fbbf24', fontWeight: 600 }}>
											{rating === 5 && '⭐ Excellent!'}
											{rating === 4 && '😊 Great!'}
											{rating === 3 && '👍 Good!'}
											{rating === 2 && '😐 Fair'}
											{rating === 1 && '😕 Needs Improvement'}
										</p>
									)}
								</div>

								{/* Message Section */}
								<div style={{ marginBottom: '24px' }}>
									<label
										htmlFor="feedback-message"
										style={{
											display: 'block',
											fontSize: '16px',
											fontWeight: 600,
											color: '#374151',
											marginBottom: '8px',
										}}
									>
										Tell us more (optional)
									</label>
									<textarea
										id="feedback-message"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="What did you like? What can we improve? Your thoughts help us grow! 💚"
										rows={4}
										maxLength={1000}
										style={{
											width: '100%',
											padding: '12px',
											borderRadius: '12px',
											border: '2px solid #e5e7eb',
											fontSize: '14px',
											resize: 'vertical',
											fontFamily: 'inherit',
											transition: 'border-color 0.2s',
											outline: 'none',
										}}
										onFocus={(e) => (e.target.style.borderColor = '#10b981')}
										onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
									/>
									<div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
										{message.length}/1000
									</div>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={loading || rating === 0}
									className="submit-btn"
									style={{
										width: '100%',
										padding: '14px',
										background: rating === 0 ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
										color: 'white',
										border: 'none',
										borderRadius: '12px',
										fontSize: '16px',
										fontWeight: 700,
										cursor: rating === 0 ? 'not-allowed' : 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '8px',
										boxShadow: rating === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
									}}
								>
									{loading ? (
										<>
											<div
												style={{
													width: '20px',
													height: '20px',
													border: '3px solid rgba(255,255,255,0.3)',
													borderTopColor: 'white',
													borderRadius: '50%',
													animation: 'spin 0.8s linear infinite',
												}}
											/>
											Submitting...
										</>
									) : (
										<>
											<Send size={20} />
											Submit Feedback
										</>
									)}
								</button>
							</form>
						</>
					) : (
						// Success State
						<div
							style={{
								padding: '60px 40px',
								textAlign: 'center',
							}}
						>
							<div
								className="success-checkmark"
								style={{
									width: '80px',
									height: '80px',
									borderRadius: '50%',
									background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
									margin: '0 auto 24px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '48px',
								}}
							>
								✓
							</div>
							<h3 style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginBottom: '12px' }}>
								Thank You!
							</h3>
							<p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
								Your feedback has been submitted successfully. We truly appreciate your input! 💚
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
