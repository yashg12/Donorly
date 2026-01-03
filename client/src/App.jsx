import { useState, useMemo, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import MapBoard from './MapBoard';
import DonationForm from './DonationForm';
import AuthPage from './authPage';
import UserProfile from './UserProfile';
import AdminDashboard from './AdminDashboard';
import LandingPage from './LandingPage';
import ChatAssistant from './components/ChatAssistant';
import FeedbackModal from './components/FeedbackModal';
import { showToast, showSuccess, showError } from './utils/notify';

function App() {
  // Read user from localStorage (support both donorly_user and user for compatibility)
  const initialUser = useMemo(() => {
    const stored = localStorage.getItem('donorly_user') || localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const [user, setUser] = useState(initialUser);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleDonationAdded = () => {
    showSuccess('Success!', 'Your donation has been posted and is now visible to those in need.');
    setRefreshKey((prev) => prev + 1); // force MapBoard remount to re-fetch
  };

  // Override window.alert globally with custom toast notifications
  useEffect(() => {
    const originalAlert = window.alert;
    
    // Only override after component mounts to avoid startup issues
    const timeoutId = setTimeout(() => {
      window.alert = (message) => {
        // Parse message to determine type and title
        const msg = String(message);
        const isError = /error|fail|invalid|wrong|denied|cannot/i.test(msg);
        const isSuccess = /success|added|saved|done|complete|thank/i.test(msg);
        const isUrgent = /urgent|blood|emergency|critical/i.test(msg);
        
        let type = 'success';
        let title = 'Notice';
        
        if (isUrgent) {
          type = 'urgent';
          title = 'Urgent Blood Needed';
        } else if (isError) {
          type = 'error';
          title = 'Error';
        } else if (isSuccess) {
          type = 'success';
          title = 'Success';
        }
        
        showToast(title, msg, type);
        
        // Note: Native alert() is blocking, but toast is not.
        // If you need blocking behavior, wrap critical code in Promise/callback.
      };
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      window.alert = originalAlert;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('donorly_token');
    localStorage.removeItem('donorly_user');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Landing/Auth flow when not logged in
  if (!user) {
    if (showLanding) {
      return (
        <LandingPage
          onGetStarted={() => {
            setShowLanding(false);
            setShowSignup(false);
          }}
          onSignUp={() => {
            setShowLanding(false);
            setShowSignup(true);
          }}
        />
      );
    }
    return <AuthPage initialMode={showSignup ? 'signup' : 'login'} />;
  }

  const canAdmin = user?.role === 'ADMIN' || (user?.email || '').toLowerCase() === 'yash@test.com';

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <header className="app-header">
        <div className="brand">Donorly</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {canAdmin && (
            <button
              onClick={() => setShowAdmin(true)}
              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}
            >
              Admin Panel
            </button>
          )}
          <button
            className="profile-btn"
            onClick={() => setShowProfile(true)}
            style={{ zIndex: 1500 }}
          >
            👤 {user.name}
          </button>
        </div>
      </header>

      {/* Main view: Admin or Map */}
      {showAdmin ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }}>
          <AdminDashboard onClose={() => setShowAdmin(false)} />
        </div>
      ) : (
        <>
          {/* Donation form overlays the map */}
          <DonationForm onDonationAdded={handleDonationAdded} />
          {/* Map renders underneath; remount on refreshKey change */}
          <MapBoard key={refreshKey} />
        </>
      )}

      {/* Backdrop */}
      {showProfile && (
        <div
          className="drawer-backdrop"
          onClick={() => setShowProfile(false)}
          role="button"
          aria-label="Close profile"
        />
      )}

      {/* Profile drawer */}
      {showProfile && (
        <UserProfile user={user} onClose={() => setShowProfile(false)} />
      )}

      {/* ChatAssistant - Hide in admin panel */}
      {!showAdmin && <ChatAssistant />}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal 
          user={user} 
          onClose={() => setShowFeedback(false)} 
        />
      )}

      {/* Floating Feedback Button - Hide in admin panel */}
      {user && !showLanding && !showAdmin && (
        <button
          onClick={() => setShowFeedback(true)}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 9998,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1) rotate(5deg)';
            e.target.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) rotate(0deg)';
            e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
          }}
          title="Share Feedback"
        >
          💬
        </button>
      )}

      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        }}
      />
    </div>
  );
}

export default App;