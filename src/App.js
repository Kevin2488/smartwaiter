import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import StatusPage from "./pages/StatusPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
