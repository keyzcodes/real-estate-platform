import { Navigate, Route, Routes } from "react-router-dom";
import PropertyCataloguePage from "./pages/PropertyCataloguePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertyCataloguePage />} />
      <Route path="/properties" element={<PropertyCataloguePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;