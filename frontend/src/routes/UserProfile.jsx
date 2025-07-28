/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";

/* Style imports */
import '../styles/UserProfile.css';

export default function UserProfile({ user }) {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Spot a John - Profile';
    }, []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await updateProfile(user, {
                displayName: displayName.trim()
            });
            setIsEditing(false);
            // Note: The user object will be updated by the App component's onAuthStateChanged
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <LoadingSpinner size="large" color="#28A745" />
            </div>
        );
    }

    return (
        <div className="user-profile-container">
            {/* Header */}
            <Header
                userName={user.displayName || user.email?.split('@')[0] || 'User'}
            />

            {/* Main Content */}
            <main className="user-profile-main">
                <div className="profile-header">
                    <h1>Profile Settings</h1>
                    <p>Manage your account information and preferences</p>
                </div>

                <ErrorMessage
                    message={error}
                    type="error"
                    onClose={() => setError('')}
                />

                <div className="profile-content">
                    {/* Profile Picture Section */}
                    <div className="profile-section">
                        <h2>Profile Picture</h2>
                        <div className="profile-picture">
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="profile-picture-placeholder" style={{ display: user.photoURL ? 'none' : 'flex' }}>
                                <svg width="48" height="48" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="profile-section">
                        <h2>Account Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Display Name</label>
                                {isEditing ? (
                                    <div className="edit-field">
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Enter display name"
                                            className="edit-input"
                                        />
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={loading}
                                            className="save-btn"
                                        >
                                            {loading ? <LoadingSpinner size="small" color="white" /> : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setDisplayName(user.displayName || '');
                                            }}
                                            className="cancel-btn"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="info-value">
                                        <span>{user.displayName || 'Not set'}</span>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="edit-btn"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="info-item">
                                <label>Email</label>
                                <div className="info-value">
                                    <span>{user.email}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <label>Account Created</label>
                                <div className="info-value">
                                    <span>{formatDate(user.metadata?.creationTime)}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <label>Last Sign In</label>
                                <div className="info-value">
                                    <span>{formatDate(user.metadata?.lastSignInTime)}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <label>Email Verified</label>
                                <div className="info-value">
                                    <span className={user.emailVerified ? 'verified' : 'not-verified'}>
                                        {user.emailVerified ? '✓ Verified' : '✗ Not verified'}
                                    </span>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="profile-section">
                        <h2>Account Actions</h2>
                        <div className="action-buttons">
                            <button
                                onClick={() => navigate('/home')}
                                className="dashboard-btn"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
} 