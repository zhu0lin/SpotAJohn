import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import SpotaJohnIcon from "../assets/icon.png";
import '../styles/UserHome.css';

export default function UserHome() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User'); // This would come from auth context

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log('Logout clicked');
        navigate('/login');
    };

    return (
        <div className="user-home-container">
            {/* Header */}
            <header className="user-home-header">
                <div className="header-left">
                    <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <h3>
                            <img src={SpotaJohnIcon} alt="Spot a John icon" />
                            Spot a John
                        </h3>
                    </div>
                </div>
                <div className="header-right">
                    <span className="welcome-text">Welcome, {userName}!</span>
                    <button 
                        onClick={handleLogout}
                        className="logout-btn"
                        style={{
                            background: 'none',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="user-home-main">
                <div className="welcome-section">
                    <h1>Welcome to Spot a John!</h1>
                    <p>Your account is ready. Here's what you can do:</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>🚽 Find Bathrooms</h3>
                        <p>Discover nearby public restrooms and their details.</p>
                        <button 
                            className="feature-btn"
                            style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 20px',
                                cursor: 'pointer'
                            }}
                        >
                            Search Now
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>📍 Add Locations</h3>
                        <p>Help others by adding new bathroom locations to our database.</p>
                        <button 
                            className="feature-btn"
                            style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 20px',
                                cursor: 'pointer'
                            }}
                        >
                            Add Location
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>⭐ Rate & Review</h3>
                        <p>Share your experience and help others find the best spots.</p>
                        <button 
                            className="feature-btn"
                            style={{
                                background: '#ffc107',
                                color: 'black',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 20px',
                                cursor: 'pointer'
                            }}
                        >
                            View Reviews
                        </button>
                    </div>

                    <div className="feature-card">
                        <h3>⚙️ Settings</h3>
                        <p>Manage your account preferences and privacy settings.</p>
                        <button 
                            className="feature-btn"
                            style={{
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 20px',
                                cursor: 'pointer'
                            }}
                        >
                            Settings
                        </button>
                    </div>
                </div>

                <div className="quick-stats">
                    <h2>Your Activity</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Locations Added</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Reviews Written</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Bathrooms Found</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}