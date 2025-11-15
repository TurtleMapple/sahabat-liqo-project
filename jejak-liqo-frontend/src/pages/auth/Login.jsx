import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Mail, Lock, Loader2 } from 'lucide-react';
import { login } from '../../api/auth';
import toast, { Toaster } from 'react-hot-toast';
import SuccessModal from '../../components/ui/SuccessModal';
import BlockedAccountModal from '../../components/ui/BlockedAccountModal';
import logoLight from '../../assets/images/logo/LogoShaf_Terang.png';
import logoDark from '../../assets/images/logo/LogoShaf_Gelap.png';
import carousel1 from '../../assets/images/carousel1.jpeg';
import carousel3 from '../../assets/images/carousel3.jpeg';
import carousel5 from '../../assets/images/carousel5.jpeg';
import { getAuthData } from '../../utils/authHelper';

const Login = () => {
  const navigate = useNavigate();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [blockedAt, setBlockedAt] = useState('');


  // ============================================
  // CONFIGURATION - Easy to modify
  // ============================================



  // Slideshow images with overlay text - easily add or remove
  const slideshowImages = [
    {
      url: carousel3,
      alt: 'Mentoring',
      title: 'Kolaborasi Tim',
      description: 'Koordinasi yang lebih baik untuk mentor'
    },
    {
      url: carousel1,
      alt: 'Education',
      title: 'Laporan Otomatis',
      description: 'Generate laporan komprehensif dengan satu klik'
    },
    {
      url: carousel5,
      alt: 'Teamwork',
      title: 'Pengembangan Karakter',
      description: 'Membimbing generasi muda menuju Indonesia Emas 2025'
    }
  ];

  // Main description text
  const mainDescription = "Program mentoring Shaf Pembangunan bertujuan membimbing generasi muda dalam pengembangan karakter, spiritualitas, dan kepemimpinan untuk Indonesia Emas 2025.";

  // ============================================
  // CHECK IF ALREADY LOGGED IN
  // ============================================
  useEffect(() => {
    const authData = getAuthData();
    if (authData?.token && authData?.user?.role) {
      const getDashboardPath = (role) => {
        switch (role) {
          case "super_admin":
            return "/superadmin/dashboard";
          case "admin":
            return "/admin/dashboard";
          case "mentor":
            return "/mentor/dashboard";
          default:
            return "/login";
        }
      };
      navigate(getDashboardPath(authData.user.role), { replace: true });
    }
  }, [navigate]);

  // ============================================
  // SLIDESHOW AUTO-PLAY EFFECT
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user } = await login(email, password);

      // Show success modal
      setShowSuccessModal(true);

      // After modal shows, redirect
      setTimeout(() => {
        setShowSuccessModal(false);
        
        // Clear all toasts before redirect
        toast.dismiss();
        
        // Show welcome toast after redirect
        setTimeout(() => {
          toast.success(`🎉 Selamat datang, ${user.profile?.full_name || user.email}!`, {
            duration: 4000,
            style: {
              background: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0'
            }
          });
        }, 500);
        
        // Redirect to appropriate dashboard
        if (user && user.role === 'super_admin') {
          navigate('/superadmin/dashboard');
        } else if (user && user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user && user.role === 'mentor') {
          navigate('/mentor/dashboard');
        } else {
          navigate('/dashboard'); // fallback
        }
      }, 2000);

    } catch (err) {
      console.log('Login error:', err.response?.data); // Debug log
      
      if (err.response && err.response.status === 422) {
        const errorData = err.response.data;
        const errorType = errorData.error_type;
        const message = errorData.message;
        
        // Handle specific error types
        switch (errorType) {
          case 'email_not_found':
            toast.error('📧 Email tidak terdaftar dalam sistem', {
              duration: 4000,
              style: {
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA'
              }
            });
            setError('Email tidak terdaftar dalam sistem');
            break;
            
          case 'wrong_password':
            toast.error('🔒 Password yang Anda masukkan salah', {
              duration: 4000,
              style: {
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA'
              }
            });
            setError('Password yang Anda masukkan salah');
            break;
            
          case 'account_blocked':
            setBlockedMessage(message);
            setBlockedAt(errorData.blocked_at || '');
            setShowBlockedModal(true);
            toast.error('🚫 Akun Anda telah diblokir', {
              duration: 5000,
              style: {
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA'
              }
            });
            return;
            
          default:
            toast.error('❌ Terjadi kesalahan saat login', {
              duration: 4000
            });
            setError(message || 'Terjadi kesalahan saat login');
        }
      } else if (err.response?.status === 429) {
        toast.error('⏰ Terlalu banyak percobaan login. Tunggu beberapa saat', {
          duration: 5000,
          style: {
            background: '#FEF3C7',
            color: '#D97706',
            border: '1px solid #FDE68A'
          }
        });
        setError('Terlalu banyak percobaan login. Silakan tunggu beberapa saat.');
      } else if (err.response?.status >= 500) {
        toast.error('🔧 Server sedang bermasalah. Coba lagi nanti', {
          duration: 5000,
          style: {
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA'
          }
        });
        setError('Server sedang bermasalah. Silakan coba lagi nanti.');
      } else if (err.request) {
        toast.error('🌐 Tidak dapat terhubung ke server. Periksa koneksi internet', {
          duration: 5000,
          style: {
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA'
          }
        });
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        toast.error('❌ Terjadi kesalahan yang tidak diketahui', {
          duration: 4000
        });
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  // ============================================
  // RENDER COMPONENT
  // ============================================
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-[#4DABFF]/10 via-white to-[#4DABFF]/5 dark:from-[#1a2332] dark:via-[#0d1117] dark:to-[#1a2332]">

      {/* ============================================ */}
      {/* LEFT SECTION - SLIDESHOW WITH TEXT OVERLAY */}
      {/* ============================================ */}
      <div className="w-full lg:w-1/2 h-56 sm:h-72 md:h-96 lg:h-screen relative overflow-hidden">
        {/* Slideshow Container */}
        <div className="relative w-full h-full">
          {slideshowImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              role="img"
              aria-label={image.alt}
            />
          ))}

          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>
        </div>

        {/* Main Description - Top of slideshow - Hidden on mobile, visible on tablet+ */}
        <div className="absolute top-4 sm:top-6 lg:top-8 left-0 right-0 z-20 px-4 sm:px-6 lg:px-12 hidden sm:block">
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20">
            <p className="text-white text-xs sm:text-sm lg:text-base leading-relaxed font-medium">
              {mainDescription}
            </p>
          </div>
        </div>

        {/* Feature Text Overlay - Bottom of slideshow */}
        <div className="absolute bottom-12 sm:bottom-16 lg:bottom-20 left-0 right-0 z-20 px-4 sm:px-6 lg:px-12">
          {slideshowImages.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            >
              <div className="bg-[#4DABFF]/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30 shadow-2xl">
                <h3 className="text-white text-base sm:text-xl lg:text-3xl font-bold mb-1 sm:mb-2">
                  {slide.title}
                </h3>
                <p className="text-white/90 text-xs sm:text-sm lg:text-base">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-[#4DABFF]/80
                   text-white p-1.5 sm:p-2 rounded-full transition-all backdrop-blur-sm hover:scale-110 hidden sm:block"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-[#4DABFF]/80
                   text-white p-1.5 sm:p-2 rounded-full transition-all backdrop-blur-sm hover:scale-110 hidden sm:block"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Dots Indicator - Smaller on mobile */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
          {slideshowImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-[#4DABFF] w-6 sm:w-8 shadow-lg shadow-[#4DABFF]/50'
                  : 'bg-white/50 hover:bg-white/75 w-1.5 sm:w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* RIGHT SECTION - LOGIN FORM CARD */}
      {/* ============================================ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 min-h-[calc(100vh-14rem)] sm:min-h-[calc(100vh-18rem)] md:min-h-[calc(100vh-24rem)] lg:min-h-screen">
        <div className="w-full max-w-md bg-white dark:bg-[#1a2332] rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl
                      hover:shadow-[#4DABFF]/20 hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]
                      p-6 sm:p-8 lg:p-10 border border-gray-200 dark:border-[#4DABFF]/20">

          {/* Logo Section with Glow Effect */}
          <div className="mb-6 sm:mb-8 text-center">
            <div
              className="relative inline-block"
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
            >
              {/* Glowing background effect */}
              <div className={`absolute inset-0 bg-[#4DABFF] rounded-full blur-xl transition-opacity duration-500 ${
                isLogoHovered ? 'opacity-60 scale-125' : 'opacity-0'
              }`}></div>

              {/* Logo - Light mode */}
              <img
                src={logoDark}
                alt="Shaf Logo"
                className="h-14 sm:h-16 lg:h-20 mx-auto relative z-10 dark:hidden transition-transform duration-500"
                onError={(e) => {
                  e.target.src = '/logo-placeholder.png';
                }}
              />

              {/* Logo - Dark mode */}
              <img
                src={logoLight}
                alt="Shaf Logo"
                className="h-14 sm:h-16 lg:h-20 mx-auto relative z-10 hidden dark:block transition-transform duration-500"
                onError={(e) => {
                  e.target.src = '/logo-placeholder.png';
                }}
              />
            </div>

            {/* Welcome Text */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2 mt-4 sm:mt-6">
              Selamat Datang <br />Sahabat Liqo !!!
            </h1>
            <br />
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Silakan masuk ke akun Anda
            </p>
          </div>

          {/* Mobile - Show main description here */}
          <div className="mb-6 sm:hidden">
            <div className="bg-[#4DABFF]/10 dark:bg-[#4DABFF]/20 rounded-xl p-3 border border-[#4DABFF]/30">
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                {mainDescription}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">

            {/* Email Input with Icon */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#4DABFF]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email kamu"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl
                           border-2 border-gray-200 dark:border-[#4DABFF]/30
                           bg-gray-50 dark:bg-[#0d1117] text-gray-800 dark:text-white
                           text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#4DABFF] focus:border-[#4DABFF]
                           placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input with Icon */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-[#4DABFF]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password kamu"
                  required
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg sm:rounded-xl
                           border-2 border-gray-200 dark:border-[#4DABFF]/30
                           bg-gray-50 dark:bg-[#0d1117] text-gray-800 dark:text-white
                           text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#4DABFF] focus:border-[#4DABFF]
                           placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />

                {/* Toggle Password Visibility Button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500
                           hover:text-[#4DABFF] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-[#4DABFF] hover:text-[#3a8fd9] font-medium transition-colors
                         hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              className="w-full py-2.5 sm:py-3 lg:py-3.5 px-4 bg-gradient-to-r from-[#4DABFF] to-[#3a8fd9]
                       hover:from-[#3a8fd9] hover:to-[#2d7ec7] text-white font-semibold
                       text-sm sm:text-base
                       rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                       focus:outline-none focus:ring-2 focus:ring-[#4DABFF] focus:ring-offset-2
                       dark:focus:ring-offset-[#1a2332] shadow-lg hover:shadow-xl
                       hover:shadow-[#4DABFF]/30 active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        message="Login berhasil! Mengalihkan ke dashboard..."
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Blocked Account Modal */}
      <BlockedAccountModal
        isOpen={showBlockedModal}
        onClose={() => {
          setShowBlockedModal(false);
          setBlockedMessage('');
          setBlockedAt('');
        }}
        message={blockedMessage}
        blockedAt={blockedAt}
      />

      {/* Toast Container */}
      <Toaster position="top-right" />
    </div>
  );
};

export default Login;
