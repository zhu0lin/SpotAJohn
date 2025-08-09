/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Style imports */
import '../styles/UserHome.css';

export default function UserHome() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        document.title = 'Spot a John - Dashboard';
    }, []);
    const [greeting, setGreeting] = useState('');

    // Get user info and set greeting
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            // Get display name from Google login
            const displayName = user.displayName;
            if (displayName) {
                // Extract first name (everything before the first space)
                const firstName = displayName.split(' ')[0];
                setUserName(firstName);
            } else {
                // Fallback to email if no display name
                const email = user.email;
                if (email) {
                    const emailName = email.split('@')[0];
                    setUserName(emailName);
                }
            }
        }

        // Set time-based greeting in EST
        const getGreeting = () => {
            const now = new Date();
            // Convert to EST (UTC-5) or EDT (UTC-4) - browser handles daylight saving
            const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
            const hour = estTime.getHours();

            if (hour >= 5 && hour < 12) {
                return 'Good morning';
            } else if (hour >= 12 && hour < 17) {
                return 'Good afternoon';
            } else {
                return 'Good evening';
            }
        };

        setGreeting(getGreeting());

        // Update greeting every minute to handle time changes
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);



    return (
        <div className="user-home-container">
            {/* Header */}
            <Header userName={userName} />

            {/* Main Content */}
            <main className="user-home-main">
                <div className="welcome-section">
                    <h1>{greeting}, {userName}!</h1>
                    <p>Welcome to Spot a John. Here's what you can do:</p>
                </div>

                <div className="map-section">
                    <div className="map-background">
                        <div className="map-overlay">
                            <button 
                                className="map-btn"
                                onClick={() => navigate('/location-map')}
                            >
                                Open Map
                            </button>
                        </div>
                    </div>
                </div>

                <div className="list-section">
                    <div className="list-background">
                        <div className="list-overlay">
                            <button 
                                className="list-btn"
                                onClick={() => navigate('/location-list')}
                            >
                                View Location List
                            </button>
                        </div>
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