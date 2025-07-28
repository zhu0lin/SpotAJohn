/* React imports */
import { useNavigate } from 'react-router-dom';

/* Asset imports */
import SpotaJohnIcon from "../assets/icon.png";

/* Style imports */
import '../styles/components/Header.css';

export default function Header({ userName, showProfileButton = true, showBackButton = false, backButtonPath = "/home" }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Import auth dynamically to avoid circular imports
            const { auth } = await import('../firebase');
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo" onClick={() => navigate('/home')}>
                    <h3>
                        <img src={SpotaJohnIcon} alt="Spot a John icon" />
                        Spot a John
                    </h3>
                </div>
            </div>
            <div className="header-right">
                <div className="header-actions">
                    {showProfileButton && (
                        <button
                            onClick={() => navigate('/profile')}
                            className="profile-btn"
                        >
                            <svg width="24" height="24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Profile</span>
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}