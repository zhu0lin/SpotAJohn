/* React imports */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* Asset imports */
import SpotaJohnIcon from "../assets/icon.png";

/* Style imports */
import '../styles/components/Header.css';

export default function Header({ userName, showProfileButton = true, showBackButton = false, backButtonPath = "/home" }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const closeMenuAnd = (fn) => () => {
        setIsMenuOpen(false);
        fn();
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.hamburger-btn')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                        <div className="profile-dropdown-container" ref={profileDropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="profile-btn"
                                aria-expanded={isProfileDropdownOpen}
                                aria-haspopup="true"
                            >
                                <svg width="24" height="24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span>Profile</span>
                                <svg 
                                    className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`}
                                    width="16" 
                                    height="16" 
                                    fill="none" 
                                    stroke="#666" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    viewBox="0 0 24 24"
                                >
                                    <polyline points="6,9 12,15 18,9" />
                                </svg>
                            </button>
                            
                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown" role="menu">
                                    <button 
                                        className="dropdown-item" 
                                        role="menuitem"
                                        onClick={() => {
                                            setIsProfileDropdownOpen(false);
                                            navigate('/profile');
                                        }}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Settings
                                    </button>
                                    <button 
                                        className="dropdown-item" 
                                        role="menuitem"
                                        onClick={() => {
                                            setIsProfileDropdownOpen(false);
                                            navigate('/saved-locations');
                                        }}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Saved Locations
                                    </button>
                                </div>
                            )}
                        </div>
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
                    <div className="mobile-menu" role="menu" ref={mobileMenuRef}>
                        <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(() => navigate('/location-map'))}>
                             View Map
                        </button>
                        <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(() => navigate('/location-list'))}>
                             View List
                        </button>
                        {showProfileButton && (
                            <>
                                <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(() => navigate('/profile'))}>
                                     Settings
                                </button>
                                <button className="mobile-menu-item" role="menuitem" onClick={closeMenuAnd(() => navigate('/saved-locations'))}>
                                     Saved Locations
                                </button>
                            </>
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