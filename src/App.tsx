import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import VerificationPage from '@/pages/VerificationPage';
import VolunteersPage from '@/pages/VolunteersPage';
import RegistrationPage from '@/pages/RegistrationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
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
