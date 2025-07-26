import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./routes/Home";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";
import UserHome from "./routes/UserHome";

function App() {

  const isAuthenticated = true;

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/"
            element={
              <>
                {isAuthenticated ? 
                <>
                <Home />
                </>
                :
                <UserHome />
                }
              </>
            } />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<UserHome />}/>
          {/*Add more routes here */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
