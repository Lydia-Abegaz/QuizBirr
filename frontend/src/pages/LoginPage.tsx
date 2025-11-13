
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Phone, RefreshCw, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full backdrop-blur-2xl bg-white/20 rounded-3xl border-2 border-white/40 p-10 shadow-2xl">
        {/* Logo/Brand Section */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white text-6xl font-black px-8 py-4 rounded-3xl shadow-2xl">
                💰
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-2xl">QuizBirr</h1>
          <p className="text-white/90 font-bold text-lg">Swipe • Answer • Win Money!</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 backdrop-blur-xl bg-red-500/30 border-2 border-red-400/50 rounded-2xl text-white text-sm font-bold shadow-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 backdrop-blur-xl bg-green-600/20 border-2 border-green-400/30 rounded-2xl text-green-200 text-sm font-semibold shadow-inner">
            {message}
          </div>
        )}
        
        
        
        {step === 'phone' ? (
          <form onSubmit={handleSubmit(onSendOTP)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-3 drop-shadow-lg">
                📱 Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 w-6 h-6 text-white/80" />
                <input
                type="tel"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[0-9]{10,15}$/,
                    message: 'Enter a valid phone number (10-15 digits, optional +)'
                  }
                })}
                className="w-full pl-14 px-6 py-4 backdrop-blur-xl bg-white/30 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-white/30 focus:border-white text-white placeholder-white/60 font-bold text-lg shadow-xl transition-all"
                placeholder="+251912345678"
              />
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-200 font-bold backdrop-blur-xl bg-red-500/20 px-3 py-2 rounded-lg">{errors.phoneNumber.message as string}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full backdrop-blur-xl bg-gradient-to-r from-green-500/50 to-blue-500/50 hover:from-green-500/70 hover:to-blue-500/70 text-white font-black text-lg py-5 rounded-2xl border-2 border-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
            >
              {loading ? '📤 SENDING...' : '📤 SEND OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onVerifyOTP)} className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-3">
                <ShieldCheck className="w-6 h-6 text-green-300" />
                <div>
                  <p className="text-white font-black text-lg">Enter Verification Code</p>
                  <p className="text-sm text-white/80">We sent a 6-digit code to <span className="font-bold">{phoneNumber}</span></p>
                </div>
              </div>

              <input
                type="text"
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'OTP must be 6 digits'
                  }
                })}
                className="w-full px-6 py-6 backdrop-blur-xl bg-white/30 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-white/30 focus:border-white text-center text-4xl tracking-widest font-black text-white placeholder-white/60 shadow-xl transition-all"
                placeholder="000000"
                maxLength={6}
              />
              {errors.otp && (
                <p className="mt-2 text-sm text-red-200 font-bold backdrop-blur-xl bg-red-500/20 px-3 py-2 rounded-lg text-center">{errors.otp.message as string}</p>
              )}

              <div className="mt-3 flex items-center justify-center gap-3">
                <button type="button" onClick={handleResend} disabled={resendTimer>0 || loading} className="text-sm text-white/90 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50">
                  <RefreshCw className="inline w-4 h-4 mr-2" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full backdrop-blur-xl bg-gradient-to-r from-green-500/50 to-blue-500/50 hover:from-green-500/70 hover:to-blue-500/70 text-white font-black text-lg py-5 rounded-2xl border-2 border-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
            >
              {loading ? '⏳ VERIFYING...' : '✅ VERIFY OTP'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-white py-3 text-sm font-bold hover:underline backdrop-blur-xl bg-white/10 rounded-xl transition-all hover:bg-white/20"
            >
              ← Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
