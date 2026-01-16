import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// SVG Illustration Component
function LoginIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-20 animate-gradient-xy"></div>
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full opacity-20 animate-float-delayed"></div>
      <div className="absolute top-1/2 right-10 w-24 h-24 bg-pink-400 rounded-full opacity-20 animate-float-slow"></div>
      
      {/* Main SVG Illustration */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full max-w-md relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated Background Circle */}
        <circle
          cx="250"
          cy="250"
          r="200"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="2"
          className="animate-pulse"
        />
        
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        
        {/* Lock Icon Illustration */}
        <g transform="translate(250, 200)">
          {/* Lock Body */}
          <rect
            x="-40"
            y="0"
            width="80"
            height="100"
            rx="8"
            fill="url(#gradient2)"
            className="animate-bounce-slow"
          />
          
          {/* Lock Shackle */}
          <path
            d="M -40 0 Q -40 -30 0 -30 Q 40 -30 40 0"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="8"
            strokeLinecap="round"
            className="animate-bounce-slow"
          />
          
          {/* Keyhole */}
          <circle
            cx="0"
            cy="50"
            r="15"
            fill="white"
            opacity="0.8"
          />
          <rect
            x="-3"
            y="50"
            width="6"
            height="30"
            fill="white"
            opacity="0.8"
          />
        </g>
        
        {/* Shield/Protection Icon */}
        <g transform="translate(150, 150)">
          <path
            d="M 0 -50 L 30 0 L 0 50 L -30 0 Z"
            fill="url(#gradient2)"
            opacity="0.6"
            className="animate-pulse"
          />
        </g>
        
        {/* Document/Portal Icon */}
        <g transform="translate(350, 150)">
          <rect
            x="-25"
            y="-40"
            width="50"
            height="60"
            rx="4"
            fill="url(#gradient2)"
            opacity="0.6"
            className="animate-bounce-slow"
          />
          <line
            x1="-15"
            y1="-20"
            x2="15"
            y2="-20"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="-15"
            y1="0"
            x2="15"
            y2="0"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="-15"
            y1="20"
            x2="5"
            y2="20"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        
        {/* Stars/Sparkles */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8;
          const radius = 180;
          const x = 250 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 250 + radius * Math.sin((angle * Math.PI) / 180);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#FCD34D"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      // Handle different error response formats
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <LoginIllustration />
        
        {/* Overlay Text */}
        <div className="absolute bottom-10 left-10 right-10 z-20 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-blue-100 text-lg">
            Secure access to the Remedial Portal Admin Dashboard
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <LockClosedIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
              Remedial Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your admin account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-shake">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Sign in
                      <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Secure login powered by{' '}
            <span className="font-semibold text-blue-600">FUTB Remedial Portal</span>
          </p>
        </div>
      </div>
    </div>
  );
}
