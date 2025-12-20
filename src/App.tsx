import { BrowserRouter, useNavigate, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';

import Header from "./components/Header";
import Home from "./pages/Home";
import Info from "./pages/Info";

function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = sessionStorage.getItem("redirect");
    if (redirect) {
      sessionStorage.removeItem("redirect");
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return null;
}

function App() {
  return(
    <BrowserRouter basename="/drawMandelbrotSet">
      <RedirectHandler />
      <Header />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/info" element={<Info />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;