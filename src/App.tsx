import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/home/Home";

function App() {
  return (
    <Router>
      <div className="p-4">
        <h1 className="text-2xl font-bold">MetaBuzz</h1>
        <Routes>
          <Route path="/home" element={<Home/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
