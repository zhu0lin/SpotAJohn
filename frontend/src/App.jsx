/* React imports */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

/* Component imports */
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

/* Route imports */
import Home from "./routes/Home";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";
import UserHome from "./routes/UserHome";
import UserProfile from "./routes/UserProfile";
import SavedLocations from "./routes/SavedLocations";
import LocationMap from "./routes/LocationMap";
import LocationList from "./routes/LocationList";

/* Style imports */
import './App.css';

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authChange = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => authChange();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" color="#28A745" />
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={user ? <Navigate to='/home' replace /> : <Home />} />
          <Route path='/signup' element={user ? <Navigate to='/home' replace /> : <SignUp />} />
          <Route path='/login' element={user ? <Navigate to='/home' replace /> : <Login />} />

          <Route path='/home' element={user ? <UserHome /> : <Navigate to='/' replace />} />
          <Route path='/profile' element={user ? <UserProfile user={user} /> : <Navigate to='/' replace />} />
          <Route path='/saved-locations' element={user ? <SavedLocations /> : <Navigate to='/' replace />} />
          <Route path='/location-map' element={user ? <LocationMap /> : <Navigate to='/' replace />} />
          <Route path='/location-list' element={user ? <LocationList /> : <Navigate to='/' replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          {/*Add more routes here */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
