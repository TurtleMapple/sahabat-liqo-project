import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import KelolaMentee from "./pages/admin/KelolaMentee/KelolaMentee";
import AdminTambahMentee from "./pages/admin/KelolaMentee/TambahMentee";
import EditMentee from "./pages/admin/KelolaMentee/EditMentee";
import RecycleBinMentee from "./pages/admin/KelolaMentee/RecycleBinMentee";
import KelolaMentor from "./pages/admin/KelolaMentor/KelolaMentor";
import TambahMentor from "./pages/admin/KelolaMentor/TambahMentor";
import EditMentor from "./pages/admin/KelolaMentor/EditMentor";
import RecycleBinMentor from "./pages/admin/KelolaMentor/RecycleBinMentor";
import KelolaLaporan from "./pages/admin/KelolaLaporan/KelolaLaporan";
import LaporanBulanan from "./pages/admin/KelolaLaporan/LaporanBulanan";
import CatatanPertemuan from "./pages/admin/CatatanPertemuan/CatatanPertemuan";
import TambahPertemuan from "./pages/admin/CatatanPertemuan/TambahPertemuan";
import EditPertemuan from "./pages/admin/CatatanPertemuan/EditPertemuan";
import TrashedPertemuan from "./pages/admin/CatatanPertemuan/TrashedPertemuan";
import AdminKelolaKelompok from "./pages/admin/KelolaKelompok/KelolaKelompok";
import AdminTambahKelompok from "./pages/admin/KelolaKelompok/TambahKelompok";
import EditKelompok from "./pages/admin/KelolaKelompok/EditKelompok";
import TrashedKelompok from "./pages/admin/KelolaKelompok/TrashedKelompok";
import KelolaPengumuman from "./pages/admin/KelolaPengumuman/KelolaPengumuman";
import TambahPengumuman from "./pages/admin/KelolaPengumuman/TambahPengumuman";
import DetailPengumuman from "./pages/admin/KelolaPengumuman/DetailPengumuman";
import EditPengumuman from "./pages/admin/KelolaPengumuman/EditPengumuman";
import ArsipPengumuman from "./pages/admin/KelolaPengumuman/ArsipPengumuman";
import TrashPengumuman from "./pages/admin/KelolaPengumuman/TrashPengumuman";
import Profile from "./pages/admin/Profile/Profile";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import KelolaAdmin from "./pages/superadmin/KelolaAdmin/KelolaAdmin";
import KelolaSuperAdmin from "./pages/superadmin/KelolaSuperAdmin/KelolaSuperAdmin";
import AddAdmin from "./pages/superadmin/KelolaAdmin/AddAdmin";
import RecycleBin from "./pages/superadmin/KelolaAdmin/RecycleBin";
import Pengumuman from "./pages/superadmin/Pengumuman";
import MentorDashboard from "./pages/mentor/Dashboard";

import MentorLayout from "./components/mentor/Layout";
import MentorKelolaKelompok from "./pages/mentor/KelolaKelompok/KelolaKelompok";
import MentorTambahMentee from "./pages/mentor/KelolaMentee/TambahMentee";
import MentorEditMentee from "./pages/mentor/KelolaMentee/EditMentee";
import MentorMenteeNonAktif from "./pages/mentor/KelolaMentee/MenteeNonAktif";
import MentorCatatanPertemuan from "./pages/mentor/KelolaPertemuan/CatatanPertemuan";
import MentorTambahPertemuan from "./pages/mentor/KelolaPertemuan/TambahPertemuan";
import MentorEditPertemuan from "./pages/mentor/KelolaPertemuan/EditPertemuan";
import MentorPengumuman from "./pages/mentor/Pengumuman/Pengumuman";
import Settings from "./pages/mentor/ProfileMentor/Settings";

import ProtectedRoute from "./routes/ProtectedRoute";
import TokenExpirationProvider from "./components/TokenExpirationProvider";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Router>
          <TokenExpirationProvider>
            <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboard routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentee"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaMentee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentee/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTambahMentee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentee/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditMentee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentee/recycle-bin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RecycleBinMentee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentor"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaMentor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentor/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TambahMentor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentor/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditMentor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentor/recycle-bin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RecycleBinMentor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-laporan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaLaporan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/laporan-bulanan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanBulanan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catatan-pertemuan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CatatanPertemuan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catatan-pertemuan/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TambahPertemuan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catatan-pertemuan/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditPertemuan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catatan-pertemuan/trashed"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TrashedPertemuan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-kelompok"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminKelolaKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-kelompok/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTambahKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-kelompok/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-kelompok/trashed"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TrashedKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-pengumuman"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaPengumuman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-pengumuman/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TambahPengumuman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-pengumuman/detail/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DetailPengumuman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-pengumuman/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditPengumuman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-pengumuman/arsip"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ArsipPengumuman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-pengumuman/trash"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TrashPengumuman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        

        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/kelola-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <KelolaAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/kelola-superadmin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <KelolaSuperAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/add-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AddAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/recycle-bin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <RecycleBin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/pengumuman"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Pengumuman />
            </ProtectedRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="kelompok/:id" element={<MentorKelolaKelompok />} />
          <Route path="kelompok/:id/kelola-mentee" element={<MentorTambahMentee />} />
          <Route path="kelompok/:id/edit-mentee/:menteeId" element={<MentorEditMentee />} />
          <Route path="kelompok/:id/mentee-nonaktif" element={<MentorMenteeNonAktif />} />
          <Route path="catatan-pertemuan" element={<MentorCatatanPertemuan />} />
          <Route path="tambah-pertemuan/:groupId" element={<MentorTambahPertemuan />} />
          <Route path="edit-pertemuan/:meetingId" element={<MentorEditPertemuan />} />
          <Route path="pengumuman" element={<MentorPengumuman />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </TokenExpirationProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;