import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        // Handle validation errors
        if (response.status === 422 && data.errors) {
          const emailError = data.errors.email?.[0];
          setError(emailError || data.message || 'Email tidak ditemukan dalam sistem.');
        } else {
          setError(data.message || 'Terjadi kesalahan. Silakan coba lagi.');
        }
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
              Email Terkirim!
            </h2>
            
            <p className={`mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Kami telah mengirim link reset password ke <strong>{email}</strong>. 
              Silakan cek inbox atau folder spam Anda.
            </p>
            
            <div className={`p-4 rounded-lg mb-6 ${
              isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm ${
                isDark ? 'text-blue-300' : 'text-blue-800'
              }`}>
                💡 Link akan kadaluarsa dalam 1 jam. Jika tidak menerima email, 
                periksa folder spam atau coba kirim ulang.
              </p>
            </div>
            
            <Link
              to="/login"
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-blue-400 hover:bg-blue-500/10' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Login</span>
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Lupa Password?
          </h2>
          
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Masukkan email Anda dan kami akan mengirim link untuk reset password
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="masukkan@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || !email
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            } text-white`}
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
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

export default ForgotPassword;