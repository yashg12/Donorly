import ImpactFeed from './components/ImpactFeed';

export default function LandingPage({ onGetStarted, onSignUp }) {
	const navStyle = {
		width: '100%',
		background: 'rgba(255, 255, 255, 0.95)',
		borderBottom: '1px solid #e5e7eb',
		backdropFilter: 'blur(12px)',
		boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
	};

	const navContainerStyle = {
		maxWidth: '1200px',
		margin: '0 auto',
		padding: '16px 24px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	};

	const brandStyle = {
		background: 'linear-gradient(135deg, #10b981, #059669)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		fontSize: '22px',
		fontWeight: '800',
		fontFamily: 'Outfit, sans-serif',
	};

	const navButtonsStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
	};

	const loginBtnStyle = {
		color: '#374151',
		background: 'transparent',
		border: 'none',
		padding: '8px 16px',
		fontWeight: '500',
		cursor: 'pointer',
		transition: 'color 0.15s',
	};

	const signupBtnStyle = {
		background: 'linear-gradient(135deg, #10b981, #059669)',
		color: '#fff',
		border: 'none',
		borderRadius: '9999px',
		padding: '10px 28px',
		fontWeight: '600',
		fontFamily: 'Inter, sans-serif',
		cursor: 'pointer',
		boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
		transition: 'all 0.2s',
	};

	const heroStyle = {
		width: '100%',
		background: 'linear-gradient(135deg, #10b981, #059669)',
		padding: '96px 24px',
	};

	const heroContentStyle = {
		maxWidth: '1200px',
		margin: '0 auto',
		textAlign: 'center',
	};

	const headlineStyle = {
		color: '#fff',
		fontSize: '56px',
		fontWeight: '800',
		fontFamily: 'Outfit, sans-serif',
		marginBottom: '20px',
		lineHeight: '1.2',
	};

	const subheadlineStyle = {
		color: 'rgba(255,255,255,0.95)',
		fontSize: '20px',
		fontFamily: 'Inter, sans-serif',
		marginBottom: '36px',
		lineHeight: '1.6',
	};

	const ctaBtnStyle = {
		background: '#fff',
		color: '#059669',
		border: '2px solid #10b981',
		borderRadius: '9999px',
		padding: '14px 36px',
		fontSize: '18px',
		fontWeight: '600',
		fontFamily: 'Inter, sans-serif',
		cursor: 'pointer',
		boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
		transition: 'all 0.2s',
	};

	const featuresSectionStyle = {
		padding: '64px 24px',
		background: '#f8fafc',
	};

	const featuresGridStyle = {
		maxWidth: '1200px',
		margin: '0 auto',
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
		gap: '24px',
	};

	const cardStyle = {
		background: '#fff',
		borderRadius: '16px',
		padding: '28px',
		textAlign: 'center',
		boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
		transition: 'all 0.2s',
	};

	const iconStyle = {
		fontSize: '56px',
		marginBottom: '16px',
	};

	const cardTitleStyle = {
		fontSize: '20px',
		fontWeight: '700',
		fontFamily: 'Outfit, sans-serif',
		color: '#111827',
		marginBottom: '10px',
	};

	const cardDescStyle = {
		fontSize: '15px',
		fontFamily: 'Inter, sans-serif',
		color: '#64748b',
		lineHeight: '1.6',
	};

	const footerStyle = {
		width: '100%',
		borderTop: '1px solid #e5e7eb',
		background: '#fff',
		padding: '20px 24px',
		textAlign: 'center',
		color: '#64748b',
		fontSize: '14px',
		fontFamily: 'Inter, sans-serif',
		marginTop: 'auto',
	};

	return (
		<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			{/* Navigation Bar */}
			<nav style={navStyle}>
				<div style={navContainerStyle}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<img src="/logo.png" alt="Donorly Logo" style={{ height: '30px', width: '30px', objectFit: 'contain' }} />
						<span style={brandStyle}>Donorly</span>
					</div>
					<div style={navButtonsStyle}>
						<button
							onClick={typeof onGetStarted === 'function' ? onGetStarted : undefined}
							style={loginBtnStyle}
							onMouseEnter={(e) => e.target.style.color = '#111827'}
							onMouseLeave={(e) => e.target.style.color = '#374151'}
						>
							Login
						</button>
						<button
							onClick={typeof onSignUp === 'function' ? onSignUp : undefined}
							style={signupBtnStyle}
						onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'; }}
						onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'; }}
						>
							Sign Up
						</button>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section style={heroStyle}>
				<div style={heroContentStyle}>
					<h1 style={headlineStyle}>
						Donorly: Bridging the Gap Between Surplus and Need.
					</h1>
					<p style={subheadlineStyle}>
						Connect with local NGOs, donate food, request blood, and help your community instantly.
					</p>
					<button
						onClick={typeof onGetStarted === 'function' ? onGetStarted : undefined}
						style={ctaBtnStyle}
					onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.5)'; }}
					onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'; }}
					>
						Get Started
					</button>
				</div>
			</section>

			{/* Features */}
			<section style={featuresSectionStyle}>
				<div style={featuresGridStyle}>
					{/* Food */}
					<div 
						style={cardStyle}
						onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.2)'; }}
						onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)'; }}
					>
						<div style={{ margin: '-28px -28px 16px -28px' }}>
							<img
								src="/assets/food-kitchen.png"
								alt="Share Surplus Food"
								className="w-full h-56 object-cover rounded-t-2xl"
							/>
						</div>
						<div style={cardTitleStyle}>Share Surplus Food</div>
						<div style={cardDescStyle}>Share surplus food from functions or restaurants friendly and instantly.</div>
					</div>

					{/* Blood */}
					<div 
						style={cardStyle}
						onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.2)'; }}
						onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)'; }}
					>
						<div style={{ margin: '-28px -28px 16px -28px' }}>
							<img
								src="/assets/blood-clinic.png"
								alt="Emergency Blood Requests"
								className="w-full h-56 object-cover rounded-t-2xl"
							/>
						</div>
						<div style={cardTitleStyle}>Emergency Blood Requests</div>
						<div style={cardDescStyle}>Connect with local NGOs and donors for emergency blood requests.</div>
					</div>

					{/* Clothes */}
					<div 
						style={cardStyle}
						onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.2)'; }}
						onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)'; }}
					>
						<div style={{ margin: '-28px -28px 16px -28px' }}>
							<img
								src="/assets/essentials-sorting.png"
								alt="Donate Essentials"
								className="w-full h-56 object-cover rounded-t-2xl"
							/>
						</div>
						<div style={cardTitleStyle}>Donate Essentials</div>
						<div style={cardDescStyle}>Donate essentials for needy, find strength, and support friends.</div>
					</div>
				</div>
			</section>

			{/* Wall of Kindness - Impact Stories */}
			<ImpactFeed />

			{/* Footer */}
			<footer style={footerStyle}>
				© 2025 Donorly - Built for Community.
			</footer>
		</div>
	);
}
