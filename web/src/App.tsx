import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LanguageSync } from "./i18n/LanguageSync";
import { ThemeSync } from "./theme/ThemeSync";
import { AccountActivationPage } from "./pages/AccountActivationPage";
import { AdDetailPage } from "./pages/AdDetailPage";
import { AgbPage } from "./pages/AgbPage";
import { AdListPage } from "./pages/AdListPage";
import { CreateAdPage } from "./pages/CreateAdPage";
import { EmailActionPage } from "./pages/EmailActionPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { FollowListPage } from "./pages/FollowListPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { ImpressumPage } from "./pages/ImpressumPage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { MyAdsPage } from "./pages/MyAdsPage";
import { MyBidsPage } from "./pages/MyBidsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { PrivacySettingsPage } from "./pages/PrivacySettingsPage";
import { PaymentPage } from "./pages/PaymentPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TermsPage } from "./pages/TermsPage";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <LanguageSync />
      <ThemeSync />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/passwort-vergessen" element={<ForgotPasswordPage />} />
          <Route path="/passwort-zuruecksetzen" element={<ResetPasswordPage />} />
          <Route path="/konto-aktivieren" element={<AccountActivationPage />} />
          <Route path="/email-bestaetigen" element={<EmailActionPage />} />
          <Route path="/ads" element={<AdListPage />} />
          <Route path="/ads/:adId" element={<AdDetailPage />} />
          <Route path="/profile/:uid" element={<PublicProfilePage />} />
          <Route path="/profile/:uid/:kind" element={<FollowListPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<PrivacyPage />} />
          <Route path="/nutzungsbedingungen" element={<TermsPage />} />
          <Route path="/agb" element={<AgbPage />} />
          <Route path="/datenschutzeinstellungen" element={<PrivacySettingsPage />} />
          <Route
            path="/ads/new"
            element={
              <ProtectedRoute>
                <CreateAdPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ads/:adId/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-ads"
            element={
              <ProtectedRoute>
                <MyAdsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bids"
            element={
              <ProtectedRoute>
                <MyBidsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
