import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logout } from "../../api/auth";

const MentorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // ✅ Panggil API logout
      toast.success("Anda telah logout.");
      navigate("/login");
    } catch (error) {
      toast.error("Gagal logout, coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4DABFF]/10 via-white to-[#4DABFF]/5 dark:from-[#1a2332] dark:via-[#0d1117] dark:to-[#1a2332] p-8">
      {/* 🔹 Header Dashboard */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard Mentor
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#4DABFF] hover:bg-[#3399ff] text-white rounded-lg font-medium transition-all"
        >
          Logout
        </button>
      </div>

      {/* 🔹 Deskripsi */}
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Selamat datang di halaman Mentor. Di sini Anda bisa mengelola siswa dan
        aktivitas mentoring.
      </p>

      {/* 🔹 Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1a2332] p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Total Siswa</h3>
          <p className="text-2xl font-bold text-[#4DABFF]">25</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Aktivitas Bulan Ini</h3>
          <p className="text-2xl font-bold text-[#4DABFF]">12</p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Laporan Selesai</h3>
          <p className="text-2xl font-bold text-[#4DABFF]">8</p>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
