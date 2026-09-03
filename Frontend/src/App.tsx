import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { I18nProvider } from './contexts/I18nContext';
import { ToastProvider } from './contexts/ToastContext';
import { MarketingLayout } from './components/marketing/MarketingLayout';
import { PortalLayout } from './components/portal/PortalLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminAccessGate } from './components/admin/AdminAccessGate';
import { Home } from './pages/Home';
import { Vehicles } from './pages/Vehicles';
import { VehicleDetail } from './pages/VehicleDetail';
import { Drivers } from './pages/Drivers';
import { Individuals } from './pages/Individuals';
import { HowItWorks } from './pages/HowItWorks';
import { Pricing } from './pages/Pricing';
import { Faq } from './pages/Faq';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Legal } from './pages/Legal';
import { NotFound } from './pages/NotFound';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Mfa } from './pages/auth/Mfa';
import { AuthSuccess } from './pages/auth/AuthSuccess';
import { PortalOverview } from './pages/portal/Overview';
import { PortalBookings } from './pages/portal/Bookings';
import { PortalBookingFlow } from './pages/portal/BookingFlow';
import { PortalRental } from './pages/portal/Rental';
import { PortalDocuments } from './pages/portal/Documents';
import { PortalContract } from './pages/portal/Contract';
import { PortalPayments } from './pages/portal/Payments';
import { PortalIncident } from './pages/portal/Incident';
import { PortalSupport } from './pages/portal/Support';
import { PortalProfile } from './pages/portal/Profile';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminDossiers } from './pages/admin/Dossiers';
import { AdminReservations } from './pages/admin/Reservations';
import { AdminVehicles } from './pages/admin/Vehicles';
import { AdminVehicleWizardPage } from './pages/admin/VehicleWizardPage';
import { AdminComingSoon } from './pages/admin/ComingSoon';
import { AdminNotifications } from './pages/admin/Notifications';
import { SecurityActivity } from './pages/admin/SecurityActivity';
import { AdminRentalRequests } from './pages/admin/RentalRequests';

import { Fleet } from './pages/Fleet';
import { Blog } from './pages/Blog';
import { BlogPostDetail } from './pages/BlogPostDetail';
import { clearAuthSession } from './services/auth';
import { useToast } from './contexts/ToastContext';


const ENABLE_INTERNAL_ROUTES = true;

function SessionExpiryHandler() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const handleSessionExpiry = () => {
      clearAuthSession();
      showToast({
        tone: 'warn',
        title: 'Votre session a expir\u00e9e pour votre s\u00e9curit\u00e9. Veuillez vous reconnecter.',
      });
      navigate('/connexion', { replace: true });
    };

    window.addEventListener('novavolt:session-expired', handleSessionExpiry);
    return () => window.removeEventListener('novavolt:session-expired', handleSessionExpiry);
  }, [navigate, showToast]);

  return null;
}

export function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <BrowserRouter>
          <SessionExpiryHandler />
          <Routes>
            {/* Public marketing site */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/vehicules" element={<Vehicles />} />
              <Route path="/vehicules/:id" element={<VehicleDetail />} />
              <Route path="/chauffeurs" element={<Drivers />} />
              <Route path="/particuliers" element={<Individuals />} />
              <Route path="/flotte" element={<Fleet />} />
              <Route path="/blogue" element={<Blog />} />
              <Route path="/blogue/:slug" element={<BlogPostDetail />} />
              <Route path="/comment-ca-marche" element={<HowItWorks />} />
              <Route path="/tarifs" element={<Pricing />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal/:slug" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Internal Authentication, Customer Portal, and Admin routes */}
            {ENABLE_INTERNAL_ROUTES && (
              
              <>
                {/* Authentication */}
                <Route path="/connexion" element={<SignIn />} />
                <Route path="/inscription" element={<SignUp />} />
                <Route path="/verification-email" element={<VerifyEmail />} />
                <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
                <Route path="/reinitialiser" element={<ResetPassword />} />
                <Route path="/mfa" element={<Mfa />} />
                <Route path="/succes" element={<AuthSuccess />} />

                {/* Secure customer portal */}
                <Route path="/portail" element={<PortalLayout />}>
                  <Route index element={<PortalOverview />} />
                  <Route path="reservations" element={<PortalBookings />} />
                  <Route path="reservation" element={<PortalBookingFlow />} />
                  <Route path="location" element={<PortalRental />} />
                  <Route path="documents" element={<PortalDocuments />} />
                  <Route path="contrat" element={<PortalContract />} />
                  <Route path="paiements" element={<PortalPayments />} />
                  <Route path="incident" element={<PortalIncident />} />
                  <Route path="support" element={<PortalSupport />} />
                  <Route path="profil" element={<PortalProfile />} />
                </Route>

                {/* Administration */}
                <Route element={<AdminAccessGate />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="security" element={<SecurityActivity />} />
                    <Route path="clients" element={<AdminComingSoon />} />
                    <Route path="dossiers" element={<AdminDossiers />} />
                    <Route path="vehicules" element={<AdminVehicles />} />
                    <Route path="vehicules/nouveau" element={<AdminVehicleWizardPage />} />
                    <Route path="vehicules/:id/modifier" element={<AdminVehicleWizardPage />} />
                    <Route path="calendrier" element={<AdminComingSoon />} />
                    <Route path="reservations" element={<AdminReservations />} />
                    <Route path="demandes-location" element={<AdminRentalRequests />} />
                    <Route path="locations" element={<AdminComingSoon />} />
                    <Route path="contrats" element={<AdminComingSoon />} />
                    <Route path="paiements" element={<AdminComingSoon />} />
                    <Route path="depots" element={<AdminComingSoon />} />
                    <Route path="maintenance" element={<AdminComingSoon />} />
                    <Route path="incidents" element={<AdminComingSoon />} />
                    <Route path="rapports" element={<AdminComingSoon />} />
                    <Route path="parametres" element={<AdminComingSoon />} />
                  </Route>
                </Route>
              </>
            )}

            <Route path="/vehicles" element={<Navigate to="/vehicules" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </I18nProvider>
  );
}
