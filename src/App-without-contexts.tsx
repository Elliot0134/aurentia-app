import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

const App = () => {
  console.log("🔥 App-without-contexts rendered");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div style={{padding: '20px'}}>404 - Page non trouvée</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
