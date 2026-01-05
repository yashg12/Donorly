import { useState } from 'react';
import axios from 'axios';
import { User, Building2 } from 'lucide-react';
import { API_URL } from './utils/api';

export default function AuthPage({ initialMode = 'login' }) {
	const [isLogin, setIsLogin] = useState(initialMode === 'login');
	const [isNGO, setIsNGO] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [ngoRegistrationNumber, setNgoRegistrationNumber] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const endpoint = isLogin
				? `${API_URL}/api/auth/login`
				: `${API_URL}/api/auth/register`;
			const payload = isLogin
				? { email, password }
				: {
					name,
					email,
					phone,
					password,
					role: isNGO ? 'ngo' : 'user',
					...(isNGO
						? {
							organizationDetails: {
								registrationNumber: ngoRegistrationNumber,
							},
						}
						: {}),
				};
			const { data } = await axios.post(endpoint, payload);

			if (isLogin) {
				localStorage.setItem('donorly_token', data.token);
				localStorage.setItem('donorly_user', JSON.stringify(data.user));
				alert('Success!');
				window.location.reload();
			} else {
				// After signup, force user to login (do not auto-authenticate).
				localStorage.removeItem('donorly_token');
				localStorage.removeItem('donorly_user');
				localStorage.removeItem('user');
				alert('Account created! Please log in.');
				setIsLogin(true);
				setPassword('');
				setNgoRegistrationNumber('');
			}
		} catch (err) {
			setError(err.response?.data?.error || 'Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
			{/* Left Side - Brand & Emotion */}
			<div style={{
				flex: 1,
				background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.85) 0%, rgba(16, 185, 129, 0.75) 100%), url("https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=800&fit=crop") center/cover',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				padding: '60px',
				color: '#fff',
			}}>
				<div style={{ marginBottom: '40px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '60px' }}>
						<img src="/logo.png" alt="Donorly Logo" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
						<span style={{ fontSize: '28px', fontWeight: '700' }}>Donorly</span>
					</div>
				<h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', fontFamily: 'Outfit, system-ui, sans-serif' }}>
						Join the Donorly<br />Community
					</h1>
					<p style={{ fontSize: '20px', opacity: 0.95, fontWeight: '400' }}>
						Make a difference today.
					</p>
				</div>
			</div>

			{/* Right Side - Form Container */}
			<div style={{
				flex: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#f9fafb',
				padding: '40px 20px',
			}}>
				<div style={{
					width: '100%',
					maxWidth: '440px',
					background: '#fff',
					borderRadius: '16px',
					boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
					padding: '40px',
				}}>
					{/* Tabs */}
					<div style={{ display: 'flex', marginBottom: '32px', borderBottom: '2px solid #e5e7eb' }}>
						<button
							onClick={() => setIsLogin(true)}
							style={{
								flex: 1,
								padding: '12px',
								background: 'none',
								border: 'none',
								fontSize: '16px',
								fontWeight: '600',
								color: isLogin ? '#059669' : '#6b7280',
								borderBottom: isLogin ? '3px solid #059669' : '3px solid transparent',
								marginBottom: '-2px',
								cursor: 'pointer',
								transition: 'all 0.3s',
							}}
						>
							Login
						</button>
						<button
							onClick={() => setIsLogin(false)}
							style={{
								flex: 1,
								padding: '12px',
								background: 'none',
								border: 'none',
								fontSize: '16px',
								fontWeight: '600',
								color: !isLogin ? '#059669' : '#6b7280',
								borderBottom: !isLogin ? '3px solid #059669' : '3px solid transparent',
								marginBottom: '-2px',
								cursor: 'pointer',
								transition: 'all 0.3s',
							}}
						>
							Sign Up
						</button>
					</div>

					{error && (
						<div style={{
							padding: '12px',
							background: '#fef2f2',
						color: '#f43f5e',
						borderRadius: '12px',
						marginBottom: '20px',
						fontSize: '14px',
					}}>
						{error}
					</div>
					)}

					<form onSubmit={handleSubmit}>
						{!isLogin && (
							<div className="mb-6">
								<div className="text-sm font-semibold text-slate-700 mb-2">I am a:</div>
								<div className="inline-flex w-full rounded-full bg-slate-100/80 p-1">
									<button
										type="button"
										onClick={() => {
											setIsNGO(false);
											setNgoRegistrationNumber('');
										}}
										className={[
											'flex-1 text-center py-2 rounded-full transition-all duration-300 active:scale-95',
											'inline-flex items-center justify-center gap-2',
											!isNGO
												? 'bg-white shadow-md text-emerald-600 font-semibold'
												: 'text-slate-500 hover:text-slate-700',
										].join(' ')}
									>
										<User size={18} />
										Individual
									</button>
									<button
										type="button"
										onClick={() => setIsNGO(true)}
										className={[
											'flex-1 text-center py-2 rounded-full transition-all duration-300 active:scale-95',
											'inline-flex items-center justify-center gap-2',
											isNGO
												? 'bg-white shadow-md text-emerald-600 font-semibold'
												: 'text-slate-500 hover:text-slate-700',
										].join(' ')}
									>
										<Building2 size={18} />
										NGO
									</button>
								</div>
							</div>
						)}
						{!isLogin && (
							<div style={{ marginBottom: '20px' }}>
								<div style={{ position: 'relative' }}>
									<span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>👤</span>
									<input
										type="text"
										placeholder="Name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										style={{
											width: '100%',
											padding: '14px 14px 14px 44px',
										borderRadius: '12px',
										border: '2px solid #e2e8f0',
										fontSize: '15px',
										fontFamily: 'Inter, system-ui, sans-serif',
										outline: 'none',
										transition: 'all 0.2s ease',
										boxSizing: 'border-box',
									}}
									onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'; }}
									onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
									/>
								</div>
							</div>
						)}

						<div style={{ marginBottom: '20px' }}>
							<div style={{ position: 'relative' }}>
								<span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>✉️</span>
								<input
									type="email"
									placeholder="Email Address"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									style={{
										width: '100%',
										padding: '14px 14px 14px 44px',
									borderRadius: '12px',
									border: '2px solid #e2e8f0',
									fontSize: '15px',
									fontFamily: 'Inter, system-ui, sans-serif',
									outline: 'none',
									transition: 'all 0.2s ease',
									boxSizing: 'border-box',
								}}
								onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'; }}
								onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
								/>
							</div>
						</div>

						{!isLogin && (
							<div style={{ marginBottom: '20px' }}>
								<div style={{ position: 'relative' }}>
									<span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>📱</span>
									<input
										type="text"
										placeholder="Phone Number"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										required
										style={{
											width: '100%',
											padding: '14px 14px 14px 44px',
										borderRadius: '12px',
										border: '2px solid #e2e8f0',
										fontSize: '15px',
										fontFamily: 'Inter, system-ui, sans-serif',
										outline: 'none',
										transition: 'all 0.2s ease',
										boxSizing: 'border-box',
									}}
									onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'; }}
									onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
									/>
								</div>
							</div>
						)}

						{!isLogin && isNGO && (
							<div style={{ marginBottom: '20px' }}>
								<div style={{ position: 'relative' }}>
									<span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>🏢</span>
									<input
										type="text"
										placeholder="NGO Registration Number"
										value={ngoRegistrationNumber}
										onChange={(e) => setNgoRegistrationNumber(e.target.value)}
										required
										style={{
											width: '100%',
											padding: '14px 14px 14px 44px',
											borderRadius: '12px',
											border: '2px solid #e2e8f0',
											fontSize: '15px',
											fontFamily: 'Inter, system-ui, sans-serif',
											outline: 'none',
											transition: 'all 0.2s ease',
											boxSizing: 'border-box',
										}}
										onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'; }}
										onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
									/>
								</div>
							</div>
						)}

						<div style={{ marginBottom: '20px' }}>
							<div style={{ position: 'relative' }}>
								<span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px' }}>🔒</span>
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									style={{
										width: '100%',
										padding: '14px 44px 14px 44px',
									borderRadius: '12px',
									border: '2px solid #e2e8f0',
									fontSize: '15px',
									fontFamily: 'Inter, system-ui, sans-serif',
									outline: 'none',
									transition: 'all 0.2s ease',
									boxSizing: 'border-box',
								}}
								onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'; }}
								onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									style={{
										position: 'absolute',
										right: '14px',
										top: '50%',
										transform: 'translateY(-50%)',
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										fontSize: '18px',
									color: '#10b981',
									padding: 0,
									transition: 'all 0.2s ease',
									}}
								>
									{showPassword ? '👁️' : '👁️‍🗨️'}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							style={{
								width: '100%',
								padding: '14px 16px',
								borderRadius: '12px',
								border: 'none',
								background: 'linear-gradient(135deg, #10b981, #059669)',
								color: '#fff',
								fontSize: '16px',
								fontWeight: '700',
								fontFamily: 'Outfit, system-ui, sans-serif',
								cursor: loading ? 'not-allowed' : 'pointer',
								opacity: loading ? 0.7 : 1,
								transition: 'all 0.2s ease',
								boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
								transform: 'scale(1)',
							}}
							onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
							onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
						>
							{loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
						</button>
					</form>

					{isLogin && (
						<div style={{ textAlign: 'center', marginTop: '16px' }}>
							<a href="#" style={{ color: '#10b981', fontSize: '14px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s ease' }}>
								Forgot password?
							</a>
						</div>
					)}

					<div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
						{isLogin ? "Don't have an account? " : 'Already have an account? '}
						<button
							onClick={() => setIsLogin(!isLogin)}
							style={{
								background: 'none',
								border: 'none',
								color: '#10b981',
								fontWeight: '700',
								cursor: 'pointer',
								textDecoration: 'underline',
								padding: 0,
								transition: 'all 0.2s ease',
							}}
						>
							{isLogin ? 'Sign Up' : 'Login'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

