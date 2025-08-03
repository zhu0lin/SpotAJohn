/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Style imports */
import '../styles/LocationList.css';

export default function LocationList() {
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Spot a John - List';
    }, []);

    return (
        <div className="location-list-container">
            {/* Header */}
            <Header 
                userName="User" 
                showBackButton={true}
                backButtonText="Back to Dashboard"
                backButtonPath="/home"
            />

            {/* Main Content */}
            <main className="location-list-main">
                <div className="list-header">
                    <h1>📋 Location List</h1>
                    <p>Browse all bathroom locations in a list format</p>
                </div>

                <div className="list-content">
                    <div className="filter-section">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="filter-options">
                            <select 
                                value={filterType} 
                                onChange={(e) => setFilterType(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Locations</option>
                                <option value="restaurant">Restaurants</option>
                                <option value="gas-station">Gas Stations</option>
                                <option value="shopping">Shopping Centers</option>
                                <option value="park">Parks</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="list-placeholder">
                        <div className="list-placeholder-content">
                            <h2>Location List</h2>
                            <p>Filter by: <strong>{filterType === 'all' ? 'All Locations' : filterType}</strong></p>
                            {searchQuery && <p>Searching for: <strong>"{searchQuery}"</strong></p>}
                            <div className="list-features">
                                <div className="list-feature">
                                    <span className="feature-icon">📋</span>
                                    <span>Browse all locations</span>
                                </div>
                                <div className="list-feature">
                                    <span className="feature-icon">🔍</span>
                                    <span>Search and filter</span>
                                </div>
                                <div className="list-feature">
                                    <span className="feature-icon">⭐</span>
                                    <span>Sort by ratings</span>
                                </div>
                                <div className="list-feature">
                                    <span className="feature-icon">📍</span>
                                    <span>View details</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="list-controls">
                        <button className="control-btn control-btn--primary">
                            🔍 Search Locations
                        </button>
                        <button className="control-btn control-btn--secondary">
                            📊 Sort Options
                        </button>
                        <button className="control-btn control-btn--success">
                            ➕ Add New Location
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
