// Import Leaflet styles (must be first)
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { API_URL } from './utils/api';

const foodIcon = new L.Icon({
	iconUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	iconRetinaUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
	shadowSize: [41, 41],
});

const bloodIcon = new L.Icon({
	iconUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	iconRetinaUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
	shadowSize: [41, 41],
});

const clothesIcon = new L.Icon({
	iconUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
	iconRetinaUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
	shadowSize: [41, 41],
});

export default function MapBoard() {
	const [position, setPosition] = useState([18.5204, 73.8567]); // default Pune
	const [donations, setDonations] = useState([]);
	const [filter, setFilter] = useState('ALL'); // ALL | REQUESTS | DONATIONS

	const normalizeImageUrl = (url) => {
		if (!url) return null;
		const s = String(url).trim();
		if (!s) return null;
		if (/^https?:\/\//i.test(s)) return s;
		if (s.startsWith('//')) return `https:${s}`;
		if (s.startsWith('/')) return `${API_URL}${s}`;
		return s;
	};

	const getDefaultImageForType = (baseType) => {
		const t = String(baseType || '').toUpperCase();
		if (t.includes('BLOOD')) return '/assets/blood-clinic.png';
		if (t.includes('FOOD')) return '/assets/food-kitchen.png';
		// Covers CLOTHES/OTHERS and the legacy AMBULANCE mapping.
		if (t.includes('CLOTH') || t.includes('OTHER') || t.includes('AMBULANCE')) {
			return '/assets/essentials-sorting.png';
		}
		return '/assets/donation-placeholder.svg';
	};

	const getIconForType = (baseType) => {
		const t = String(baseType || '').toUpperCase();
		if (t.includes('BLOOD')) return bloodIcon;
		if (t.includes('FOOD')) return foodIcon;
		if (t.includes('CLOTH') || t.includes('OTHER') || t.includes('AMBULANCE')) return clothesIcon;
		return foodIcon;
	};

	async function fetchDonations(pos = position, radius = 25000) {
		try {
			const lat = Array.isArray(pos) ? pos[0] : pos?.lat;
			const lng = Array.isArray(pos) ? pos[1] : pos?.lng;
			const res = await axios.get(
				`${API_URL}/api/donations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
			);
			setDonations(res.data || []);
		} catch (err) {
			console.error('Failed to fetch donations', err);
		}
	}

	useEffect(() => {
		// Try to get user position on mount
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const next = [pos.coords.latitude, pos.coords.longitude];
					setPosition(next);
					fetchDonations(next, 25000); // fetch with 25km radius
				},
				(err) => {
					console.warn('Geolocation failed, using default Pune center.', err);
					fetchDonations(position, 25000); // fallback with 25km radius
				},
				{ enableHighAccuracy: true, timeout: 10000 }
			);
		} else {
			// No geolocation support
			fetchDonations(position);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{/* Filter Bar */}
			<div className="filter-bar" style={{ top: '90px' }}>
				<button
					className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
					type="button"
					onClick={() => setFilter('ALL')}
				>
					Show All
				</button>
				<button
					className={`filter-btn requests ${filter === 'REQUESTS' ? 'active' : ''}`}
					type="button"
					onClick={() => setFilter('REQUESTS')}
				>
					Only Requests
				</button>
				<button
					className={`filter-btn donations ${filter === 'DONATIONS' ? 'active' : ''}`}
					type="button"
					onClick={() => setFilter('DONATIONS')}
				>
					Only Donations
				</button>
			</div>

			{donations
				.filter((d) => {
					const it = (d.itemType || d.type || '').toUpperCase();
					if (filter === 'REQUESTS') return it.startsWith('REQUEST_');
					if (filter === 'DONATIONS') return it.startsWith('DONATE_');
					return true;
				})
				.map((donation) => {
				const coords = donation?.location?.coordinates; // [lng, lat]
				if (!coords || coords.length < 2) return null;
				const position = [coords[1], coords[0]]; // Leaflet expects [lat, lng]
				const rawType = donation.itemType || donation.type || '';
				const isRequest = rawType.startsWith('REQUEST_');
				const isDonate = rawType.startsWith('DONATE_');
				const baseType = rawType.replace(/^REQUEST_|^DONATE_/, '').toUpperCase(); // e.g. FOOD, BLOOD
				// Display mapping override: show 'Clothes/Others' instead of AMBULANCE
				const rawDisplay = baseType.replace(/_/g, ' ');
				const displayType = baseType === 'AMBULANCE' ? 'Clothes/Others' : rawDisplay;
				// Icons: match category (blood/food/clothes)
				const icon = getIconForType(baseType);
				const headerColor = isRequest ? '#b91c1c' : '#15803d';
				const phone = donation.contactPhone || '';
				const phoneDigits = String(phone).replace(/\D/g, '');
				const normalizedImg = normalizeImageUrl(donation.imageUrl);
				const imgSrc = normalizedImg || getDefaultImageForType(baseType);
				const fallbackImg = '/assets/donation-placeholder.svg';
				const buttonBase = {
					display: 'inline-block',
					padding: '10px 16px',
					borderRadius: '12px',
					color: '#fff',
					textDecoration: 'none',
					fontWeight: 700,
					fontSize: '13px',
					transition: 'all 0.2s ease',
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
				};
				const callStyle = { 
					...buttonBase, 
					background: 'linear-gradient(135deg, #10b981, #059669)',
					boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
				};
				const chatStyle = { 
					...buttonBase, 
					background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
					boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
				};
				let popupRef = null;
				return (
					<Marker
						key={donation._id || `${coords[0]}-${coords[1]}`}
						position={position}
						icon={icon}
					>
						<Popup ref={(r) => (popupRef = r)}>
							<div style={{ 
								minWidth: '260px',
								background: 'white',
								borderRadius: '16px',
								padding: '4px',
							}}>
								<div
									style={{
										fontWeight: 800,
										color: '#fff',
										marginBottom: '8px',
										fontSize: '15px',
										letterSpacing: '0.5px',
										textTransform: 'uppercase',
										padding: '8px 12px',
										background: isRequest 
											? 'linear-gradient(135deg, #f43f5e, #dc2626)' 
											: 'linear-gradient(135deg, #10b981, #059669)',
										borderRadius: '12px',
										boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
									}}
								>
									{displayType}
								</div>
									<div style={{ 
										width: '100%', 
										height: '160px', 
										marginBottom: '12px',
										borderRadius: '12px',
										overflow: 'hidden',
										boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
									}}>
										<img
											src={imgSrc}
											alt={displayType}
											referrerPolicy="no-referrer"
											onLoad={() => popupRef && popupRef.update()}
											onError={(e) => {
												if (e.currentTarget.src !== fallbackImg) {
													e.currentTarget.src = fallbackImg;
												}
												popupRef && popupRef.update();
											}}
											style={{
												width: '100%',
												height: '100%',
												display: 'block',
												objectFit: 'cover',
											}}
										/>
									</div>
								<div style={{ 
									color: '#475569', 
									fontSize: '14px', 
									marginBottom: '12px',
									lineHeight: '1.6',
									padding: '0 4px',
								}}>
									{donation.description || 'No description provided.'}
								</div>
								<div style={{ 
									display: 'flex', 
									gap: '10px',
									padding: '0 4px',
								}}>
									<a href={`tel:${phone}`} style={callStyle}>
										📞 Call
									</a>
									<a
										href={`https://wa.me/${phoneDigits}`}
										target="_blank"
										rel="noopener noreferrer"
										style={chatStyle}
									>
										💬 Chat
									</a>
								</div>
							</div>
						</Popup>
					</Marker>
				);
			})}
		</MapContainer>
	);
}

