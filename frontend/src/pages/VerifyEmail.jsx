import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resendVerificationEmail } from '../store/authSlice';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleResend = async () => {
    setMessage('');
    setMessageType('');
    
    try {
      await dispatch(resendVerificationEmail()).unwrap();
      setMessage('Verification email sent! Please check your inbox.');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to send verification email. Please try again.');
      setMessageType('error');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <p className="text-center text-gray-600">Please log in to verify your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification email to <strong>{user.email}</strong>.
          Please check your inbox and click the verification link.
        </p>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>
        
        <p className="text-sm text-gray-500 mt-6">
          After verifying your email, you can access all features of Trade Journal.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;