import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import VerificationPage from '@/pages/VerificationPage';
import VolunteersPage from '@/pages/VolunteersPage';
import RegistrationPage from '@/pages/RegistrationPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';

// Espace d'administration : chargé à part, le site public n'en paie pas le poids.
const AdminApp = lazy(() => import('@/pages/admin/AdminApp'));

// Anciennes adresses en français : les liens déjà partagés (WhatsApp, e-mails...) continuent de fonctionner.
function RedirectTo({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

function RedirectToCourse() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/courses/${id}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#0b1b30]" />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/a-propos" element={<RedirectTo to="/about" />} />
          <Route path="/formations" element={<RedirectTo to="/courses" />} />
          <Route path="/formations/:id" element={<RedirectToCourse />} />
          <Route path="/inscription" element={<RedirectTo to="/register" />} />
          <Route path="/volontaires" element={<RedirectTo to="/volunteers" />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
