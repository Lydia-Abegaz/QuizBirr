
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Phone, RefreshCw, ShieldCheck } from '../components/icons';

const LoginPage = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  
  
  const onSendOTP = async (data: any) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.sendOTP(data.phoneNumber);
      if (response.data.success) {
        setPhoneNumber(data.phoneNumber);
        setStep('otp');
        reset();
        setMessage('OTP sent — check your phone');
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
  
  const onVerifyOTP = async (data: any) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.verifyOTP(phoneNumber, data.otp);
      if (response.data.success && response.data.data) {
        setAuth(response.data.data.user, response.data.data.token);
        navigate('/');
      } else {
        setError(response.data.error || 'Invalid OTP');
        reset({ otp: '' });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Resend timer (seconds)
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let t: any;
    if (resendTimer > 0) {
      t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    }
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleResend = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const resp = await authApi.sendOTP(phoneNumber);
      if (resp.data.success) {
        setMessage('OTP resent — check your phone');
        setResendTimer(30);
      } else {
        setError(resp.data.error || 'Failed to resend OTP');
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };
  
  
  
  return (
    <>
      {/* Animated Background - Same as inner pages */}
      <div className="gif-background" />
      
      <div className="content-wrapper min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Floating Logo Section */}
          <div className="text-center animate-float">
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white text-7xl font-black p-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300">
                  💰
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-4 drop-shadow-2xl animate-pulse">
              QuizBirr
            </h1>
            <p className="text-green-300/90 font-bold text-xl mb-2">Swipe • Answer • Win Money!</p>
            <div className="flex items-center justify-center gap-2 text-green-400/80 text-sm font-semibold">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Join thousands earning daily</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Main Login Card */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-teal-900/40 rounded-3xl border-2 border-green-500/30 p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
        
              {/* Status Messages */}
              {error && (
                <div className="mb-6 p-4 backdrop-blur-xl bg-red-500/30 border-2 border-red-400/50 rounded-2xl text-red-100 text-sm font-bold shadow-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {error}
                  </div>
                </div>
              )}
              {message && (
                <div className="mb-6 p-4 backdrop-blur-xl bg-green-500/30 border-2 border-green-400/50 rounded-2xl text-green-100 text-sm font-bold shadow-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {message}
                  </div>
                </div>
              )}
        
        
        
              {step === 'phone' ? (
                <form onSubmit={handleSubmit(onSendOTP)} className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-lg font-black text-green-300 mb-4 drop-shadow-lg flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all"></div>
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-400 z-10" />
                      <input
                        type="tel"
                        {...register('phoneNumber', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\+?[0-9]{10,15}$/,
                            message: 'Enter a valid phone number (10-15 digits, optional +)'
                          }
                        })}
                        className="relative w-full pl-14 pr-6 py-5 backdrop-blur-xl bg-green-900/30 border-2 border-green-500/40 rounded-2xl focus:ring-4 focus:ring-green-400/30 focus:border-green-400 text-white placeholder-green-300/60 font-bold text-lg shadow-xl transition-all duration-300 hover:bg-green-900/40"
                        placeholder="+251912345678"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-3 text-sm text-red-300 font-bold backdrop-blur-xl bg-red-500/20 px-4 py-2 rounded-xl border border-red-400/30">{errors.phoneNumber.message as string}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden backdrop-blur-xl bg-gradient-to-r from-green-500/60 via-emerald-500/60 to-teal-500/60 hover:from-green-500/80 hover:via-emerald-500/80 hover:to-teal-500/80 text-white font-black text-xl py-6 rounded-2xl border-2 border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          SENDING...
                        </>
                      ) : (
                        <>
                          📤 SEND OTP
                        </>
                      )}
                    </span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onVerifyOTP)} className="space-y-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-4 mb-6 p-4 backdrop-blur-xl bg-green-500/20 rounded-2xl border border-green-400/30">
                      <div className="relative">
                        <ShieldCheck className="w-8 h-8 text-green-400 animate-pulse" />
                        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"></div>
                      </div>
                      <div className="text-left">
                        <p className="text-green-300 font-black text-xl">Verification Code</p>
                        <p className="text-green-400/80 text-sm">Code sent to <span className="font-bold text-green-300">{phoneNumber}</span></p>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl blur-2xl group-focus-within:blur-3xl transition-all"></div>
                      <input
                        type="text"
                        {...register('otp', {
                          required: 'OTP is required',
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: 'OTP must be 6 digits'
                          }
                        })}
                        className="relative w-full px-8 py-8 backdrop-blur-xl bg-green-900/40 border-2 border-green-500/50 rounded-2xl focus:ring-4 focus:ring-green-400/40 focus:border-green-400 text-center text-5xl tracking-[0.5em] font-black text-green-300 placeholder-green-500/40 shadow-2xl transition-all duration-300 hover:bg-green-900/50"
                        placeholder="000000"
                        maxLength={6}
                      />
                      {errors.otp && (
                        <p className="mt-4 text-sm text-red-300 font-bold backdrop-blur-xl bg-red-500/20 px-4 py-3 rounded-xl border border-red-400/30 text-center">{errors.otp.message as string}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={handleResend} 
                        disabled={resendTimer > 0 || loading} 
                        className="group flex items-center gap-2 px-6 py-3 backdrop-blur-xl bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl text-green-300 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden backdrop-blur-xl bg-gradient-to-r from-green-500/60 via-emerald-500/60 to-teal-500/60 hover:from-green-500/80 hover:via-emerald-500/80 hover:to-teal-500/80 text-white font-black text-xl py-6 rounded-2xl border-2 border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          VERIFYING...
                        </>
                      ) : (
                        <>
                          ✅ VERIFY CODE
                        </>
                      )}
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-full group flex items-center justify-center gap-2 text-green-300 py-4 text-lg font-bold backdrop-blur-xl bg-green-500/10 hover:bg-green-500/20 rounded-xl border border-green-400/20 transition-all hover:scale-105"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                    Change Phone Number
                  </button>
                </form>
        )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
