import { Navigate, Route, Routes } from "react-router-dom";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import JoinPage from "./pages/JoinPage";
import PropertyCataloguePage from "./pages/PropertyCataloguePage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import SignInPage from "./pages/SignInPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PropertyCataloguePage />} />
      <Route path="/properties" element={<PropertyCataloguePage />} />
      <Route path="/properties/:slug" element={<PropertyDetailPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;