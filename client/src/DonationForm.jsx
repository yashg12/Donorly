import { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import axios from 'axios';
import { showError } from './utils/notify';
import { API_URL } from './utils/api';

export default function DonationForm({ onDonationAdded }) {
const [formType, setFormType] = useState('DONATE'); // DONATE or REQUEST
const donateOptions = ['Blood Donation', 'Food', 'Clothes/Others'];
// Replace 'Ambulance' with 'Clothes/Others/Other' but without slash for schema validation
const requestOptions = [
{ label: 'Emergency Blood', value: 'Emergency Blood' },
{ label: 'Emergency Food', value: 'Emergency Food' },
{ label: 'Clothes/Others', value: 'Clothes/Others' },
];
const initialOption = donateOptions[0];
const [itemType, setItemType] = useState(initialOption);
const [description, setDescription] = useState('');
const [contactPhone, setContactPhone] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [location, setLocation] = useState(null); // {lat, lng}
const [locLoading, setLocLoading] = useState(false);
const [addressPicked, setAddressPicked] = useState('');
const [selectedFile, setSelectedFile] = useState(''); // base64 image data URL

const cardStyle = {
position: 'absolute',
top: '90px', // below header
right: '24px',
zIndex: 1200,
background: 'rgba(255, 255, 255, 0.95)',
backdropFilter: 'blur(12px)',
boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
borderRadius: '16px',
padding: '24px',
width: '340px',
border: '1px solid rgba(255, 255, 255, 0.5)',
};

const labelStyle = {
display: 'block',
marginBottom: '8px',
fontWeight: 700,
fontSize: '13px',
color: '#475569',
letterSpacing: '0.3px',
};
const inputStyle = {
width: '100%',
padding: '12px 14px',
marginBottom: '16px',
borderRadius: '12px',
border: '2px solid #e2e8f0',
fontSize: '14px',
fontFamily: "'Inter', sans-serif",
transition: 'all 0.2s ease',
outline: 'none',
};
const buttonStyle = {
width: '100%',
padding: '12px 16px',
borderRadius: '12px',
border: 'none',
background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
color: '#fff',
fontWeight: 700,
fontSize: '14px',
cursor: 'pointer',
boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
transition: 'all 0.2s ease',
};

function handleDetectLocation() {
if (!navigator.geolocation) {
showError?.('Geolocation is not supported in this browser.') ||
alert('Geolocation is not supported in this browser.');
return;
}
setLocLoading(true);

 const tryIpLocationFallback = async () => {
 try {
 // Approximate location based on IP as a last-resort fallback.
 // This avoids hard failure on devices without GPS/Wi‑Fi positioning.
 const { data } = await axios.get('https://ipapi.co/json/');
 const lat = Number(data?.latitude);
 const lng = Number(data?.longitude);
 if (Number.isFinite(lat) && Number.isFinite(lng)) {
 setLocation({ lat, lng });
 setLocLoading(false);
 alert('Using approximate location (IP-based).');
 return true;
 }
 } catch (e) {
 console.error('IP geolocation fallback failed', e);
 }
 return false;
 };

const onSuccess = (pos) => {
setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
setLocLoading(false);
alert('Location found!');
};

const onError = (err) => {
console.error('Geolocation error', err);
const code = err?.code;
const PERMISSION_DENIED = err?.PERMISSION_DENIED ?? 1;
const POSITION_UNAVAILABLE = err?.POSITION_UNAVAILABLE ?? 2;
const TIMEOUT = err?.TIMEOUT ?? 3;

// Many desktops fail high-accuracy GPS; try the opposite order:
// 1) coarse (more reliable) 2) high accuracy (if available)
if (code === POSITION_UNAVAILABLE || code === TIMEOUT) {
navigator.geolocation.getCurrentPosition(
onSuccess,
async (err2) => {
console.error('Geolocation high-accuracy fallback error', err2);
 const usedFallback = await tryIpLocationFallback();
 if (usedFallback) return;
 setLocLoading(false);
 showError?.(
 'Location position unavailable. Enable Location Services (Windows Settings) and allow location permission in the browser, then try again.'
 ) ||
 alert(
 'Location position unavailable. Enable Location Services (Windows Settings) and allow location permission in the browser, then try again.'
 );
},
{ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
);
return;
}

let msg = 'Failed to get your location.';
switch (code) {
case PERMISSION_DENIED:
msg = 'Location permission denied. Please allow location access and try again.';
break;
default:
break;
}
setLocLoading(false);
showError?.(msg) || alert(msg);
};

// Coarse first: more reliable on laptops/desktops.
navigator.geolocation.getCurrentPosition(onSuccess, onError, {
enableHighAccuracy: false,
timeout: 20000,
maximumAge: 60000,
});
}

function handleAddressSelect(lat, lon, displayName) {
if (typeof lat === 'number' && typeof lon === 'number') {
setLocation({ lat, lng: lon });
setAddressPicked(displayName || '');
}
}

function normalize(str) {
return String(str).trim().toUpperCase().replace(/\s+/g, '_');
}

async function handleSubmit(e) {
e.preventDefault();
setError('');
if (!location) {
alert('Please detect location first');
return;
}
setLoading(true);
try {
const userStr = localStorage.getItem('donorly_user') || localStorage.getItem('user');
let user = null;
try {
user = userStr ? JSON.parse(userStr) : null;
} catch {
user = null;
}
if (!user || !user.email) {
alert('You must be logged in');
return;
}
const prefixedType = `${formType}_${normalize(itemType)}`;
const payload = {
itemType: prefixedType,
description,
contactPhone,
userEmail: user.email,
location: {
type: 'Point',
coordinates: [location.lng, location.lat],
},
imageUrl: selectedFile || undefined,
};
		await axios.post(`${API_URL}/api/donations/add`, payload);
setDescription('');
setContactPhone('');
setItemType(formType === 'DONATE' ? donateOptions[0] : requestOptions[0].value);
setLocation(null);
setSelectedFile('');
if (typeof onDonationAdded === 'function') onDonationAdded();
} catch (err) {
setError(err?.response?.data?.error || 'Failed to post donation');
} finally {
setLoading(false);
}
}

return (
<div style={cardStyle}>
<form onSubmit={handleSubmit}>
<AddressAutocomplete onSelect={handleAddressSelect} />
{addressPicked && (
<div
style={{
color: '#10b981',
fontSize: '13px',
marginTop: '-8px',
marginBottom: '12px',
fontWeight: 600,
}}
>
 Location set: {addressPicked}
</div>
)}

<div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
<button
type="button"
onClick={() => {
setFormType('DONATE');
setItemType(donateOptions[0]);
}}
style={{
flex: 1,
padding: '12px 16px',
borderRadius: '12px',
border: 'none',
cursor: 'pointer',
fontWeight: 700,
fontSize: '14px',
background:
formType === 'DONATE' ? 'linear-gradient(135deg, #10b981, #059669)' : '#e5e7eb',
color: formType === 'DONATE' ? '#fff' : '#6b7280',
boxShadow:
formType === 'DONATE' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
transition: 'all 0.2s ease',
}}
>
Give Help
</button>
<button
type="button"
onClick={() => {
setFormType('REQUEST');
setItemType(requestOptions[0].value);
}}
style={{
flex: 1,
padding: '12px 16px',
borderRadius: '12px',
border: 'none',
cursor: 'pointer',
fontWeight: 700,
fontSize: '14px',
background:
formType === 'REQUEST' ? 'linear-gradient(135deg, #f43f5e, #dc2626)' : '#e5e7eb',
color: formType === 'REQUEST' ? '#fff' : '#6b7280',
boxShadow:
formType === 'REQUEST' ? '0 4px 12px rgba(244, 63, 94, 0.3)' : 'none',
transition: 'all 0.2s ease',
}}
>
Ask for Help
</button>
</div>

<label style={labelStyle}>Type</label>
<select value={itemType} onChange={(e) => setItemType(e.target.value)} style={inputStyle}>
{formType === 'DONATE'
? donateOptions.map((opt) => (
<option key={opt} value={opt}>
{opt}
</option>
))
: requestOptions.map((opt) => (
<option key={opt.value} value={opt.value}>
{opt.label}
</option>
))}
</select>

<label style={labelStyle}>Description</label>
<input
type="text"
value={description}
onChange={(e) => setDescription(e.target.value)}
placeholder={formType === 'DONATE' ? 'What are you offering?' : 'What help is needed?'}
style={inputStyle}
/>

<label style={labelStyle}>Phone</label>
<input
type="tel"
value={contactPhone}
onChange={(e) => setContactPhone(e.target.value)}
placeholder="Contact number"
style={inputStyle}
/>

<label style={labelStyle}>Upload Photo (optional)</label>
<input
type="file"
accept="image/*"
onChange={(e) => {
const file = e.target.files && e.target.files[0];
if (!file) return;
					// Note: base64 encoding increases size (~33%), so keep this under server JSON limit.
					const MAX_SIZE = 14 * 1024 * 1024; // 14MB
if (file.size > MAX_SIZE) {
						alert('File is too large. Please select an image under 14MB.');
e.target.value = '';
return;
}
const reader = new FileReader();
reader.onload = () => {
const result = reader.result;
if (typeof result === 'string') setSelectedFile(result);
};
reader.onerror = () => {
alert('Failed to read image file');
};
reader.readAsDataURL(file);
}}
style={{ ...inputStyle, padding: '6px' }}
/>
{selectedFile && (
<div style={{ marginBottom: '12px' }}>
<img
src={selectedFile}
alt="Selected preview"
style={{
width: '100%',
height: '160px',
objectFit: 'cover',
borderRadius: '16px',
border: '2px solid #e2e8f0',
}}
/>
</div>
)}

{error && (
<div style={{ color: '#f43f5e', marginBottom: '12px', fontWeight: 600, fontSize: '13px' }}>
{error}
</div>
)}

<div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
<button
type="button"
style={{
...buttonStyle,
background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
flex: 1,
}}
onClick={handleDetectLocation}
disabled={locLoading}
>
{locLoading ? 'Locating...' : '📍 Detect Location'}
</button>
<button
type="submit"
style={{
...buttonStyle,
background:
formType === 'DONATE'
? 'linear-gradient(135deg, #10b981, #059669)'
: 'linear-gradient(135deg, #f43f5e, #dc2626)',
boxShadow:
formType === 'DONATE'
? '0 4px 12px rgba(16, 185, 129, 0.3)'
: '0 4px 12px rgba(244, 63, 94, 0.3)',
flex: 1,
}}
disabled={loading}
>
{loading ? 'Posting...' : formType === 'DONATE' ? 'Post Donation' : 'Post Request'}
</button>
</div>

{location && (
<div style={{ marginTop: '8px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
Detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
</div>
)}
</form>
</div>
);
}
