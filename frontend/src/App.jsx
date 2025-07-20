import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./routes/Home";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";

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
                null
                }
              </>
            } />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          {/*Add more routes here */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
