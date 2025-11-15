import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { isDark } = useTheme();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Konfirmasi password tidak cocok');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md rounded-2xl shadow-xl p-8 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className={`text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Password Berhasil Direset!
            </h2>
            
            <p className={`mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login dalam beberapa detik.
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              <span>Login Sekarang</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md rounded-2xl shadow-xl p-8 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Reset Password
          </h2>
          
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Masukkan password baru untuk akun Anda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex items-start space-x-3 ${
                isDark 
                  ? 'bg-red-500/10 border border-red-500/20' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <AlertCircle className={`w-5 h-5 mt-0.5 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`} />
              <p className={`text-sm ${
                isDark ? 'text-red-300' : 'text-red-800'
              }`}>
                {error}
              </p>
            </motion.div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                disabled={loading}
                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.password || !formData.password_confirmation}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || !formData.password || !formData.password_confirmation
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            } text-white`}
          >
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className={`inline-flex items-center space-x-2 text-sm transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-blue-400' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;