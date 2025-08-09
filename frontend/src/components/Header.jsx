/* React imports */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Asset imports */
import SpotaJohnIcon from "../assets/icon.png";

/* Style imports */
import '../styles/components/Header.css';

export default function Header({ userName, showProfileButton = true, showBackButton = false, backButtonPath = "/home" }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenuAnd = (fn) => () => {
        setIsMenuOpen(false);
        fn();
    };

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
                {/* Mobile: Hamburger */}
                <button
                    className="hamburger-btn"
                    aria-label="Menu"
                    onClick={() => setIsMenuOpen((v) => !v)}
                >
                    <span className="hamburger-bar" />
                    <span className="hamburger-bar" />
                    <span className="hamburger-bar" />
                </button>

                <div className="header-actions">
                    <button
                        onClick={() => navigate('/location-map')}
                        className="nav-btn"
                    >
                         View Map
                    </button>
                    <button
                        onClick={() => navigate('/location-list')}
                        className="nav-btn"
                    >
                         View List
                    </button>
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

                {/* Mobile dropdown menu */}
                {isMenuOpen && (
                    <div className="mobile-menu" role="menu">
                        <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(() => navigate('/location-map'))}>
                             View Map
                        </button>
                        <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(() => navigate('/location-list'))}>
                             View List
                        </button>
                        {showProfileButton && (
                            <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(() => navigate('/profile'))}>
                                 Profile
                            </button>
                        )}
                        <div className="mobile-menu-separator" />
                        <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(handleLogout)}>
                            ↪ Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}