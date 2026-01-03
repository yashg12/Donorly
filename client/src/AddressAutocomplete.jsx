import { useEffect, useRef, useState } from 'react';

export default function AddressAutocomplete({ onSelect }) {
	const [query, setQuery] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [hoveredKey, setHoveredKey] = useState(null);
	const timerRef = useRef(null);

	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		if (!query.trim()) {
			setSuggestions([]);
			return;
		}
		timerRef.current = setTimeout(async () => {
			try {
				setIsSearching(true);
				const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					query.trim()
				)}&limit=5`;
				const res = await fetch(url, { headers: { Accept: 'application/json' } });
				const data = await res.json();
				setSuggestions(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error('Autocomplete search failed', err);
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		}, 1000); // debounce 1s
		return () => timerRef.current && clearTimeout(timerRef.current);
	}, [query]);

	function handleChoose(s) {
		const displayName = s.display_name || '';
		setQuery(displayName);
		setSuggestions([]);
		if (typeof onSelect === 'function') {
			onSelect(parseFloat(s.lat), parseFloat(s.lon), displayName);
		}
	}

	const wrapperStyle = { position: 'relative', marginBottom: '16px' };
	const inputStyle = {
		width: '100%',
		padding: '12px 14px',
		borderRadius: '12px',
		border: '2px solid #e2e8f0',
		fontSize: '14px',
		fontFamily: "'Inter', sans-serif",
		transition: 'all 0.2s ease',
		outline: 'none',
	};
	const listStyle = {
		position: 'absolute',
		top: '100%',
		left: 0,
		right: 0,
		background: 'rgba(255, 255, 255, 0.98)',
		backdropFilter: 'blur(12px)',
		boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
		zIndex: 10,
		maxHeight: '220px',
		overflowY: 'auto',
		marginTop: '8px',
		borderRadius: '12px',
		border: '1px solid #e5e7eb',
		listStyle: 'none',
		padding: '6px',
	};
	const itemStyle = {
		padding: '12px 14px',
		cursor: 'pointer',
		borderRadius: '8px',
		fontSize: '14px',
		transition: 'all 0.15s ease',
	};

	const [isFocused, setIsFocused] = useState(false);

	return (
		<div style={wrapperStyle}>
			<input
				type="text"
				placeholder="🔍 Search Area (e.g. Kothrud)"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				style={{
					...inputStyle,
					...(isFocused && {
						borderColor: '#10b981',
						boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
					})
				}}
			/>
			{isSearching && (
				<div style={{ position: 'absolute', top: '100%', marginTop: 6, fontSize: 12, color: '#6b7280' }}>
					Searching...
				</div>
			)}
			{suggestions.length > 0 && (
				<ul style={listStyle}>
					{suggestions.map((s) => {
						const key = `${s.place_id}-${s.lat}-${s.lon}`;
						const isHovered = hoveredKey === key;
						return (
							<li
								key={key}
								style={{
									...itemStyle,
									...(isHovered && {
										background: '#f0fdf4',
										color: '#059669',
										fontWeight: '600'
									})
								}}
								onMouseEnter={() => setHoveredKey(key)}
								onMouseLeave={() => setHoveredKey(null)}
								onClick={() => handleChoose(s)}
								onKeyDown={(e) => e.key === 'Enter' && handleChoose(s)}
								role="button"
								tabIndex={0}
							>
								{s.display_name}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
