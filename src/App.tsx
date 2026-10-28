import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/formations" element={<CoursesPage />} />
          <Route path="/formations/:id" element={<CourseDetailPage />} />
          <Route path="/inscription" element={<RegistrationPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/volontaires" element={<VolunteersPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
