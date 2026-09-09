import { Navigate, Route, Routes } from "react-router-dom";
import PropertyCataloguePage from "./pages/PropertyCataloguePage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertyCataloguePage />} />
      <Route path="/properties" element={<PropertyCataloguePage />} />
      <Route path="/properties/:slug" element={<PropertyDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;