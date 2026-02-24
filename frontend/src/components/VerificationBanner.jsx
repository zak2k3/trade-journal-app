import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const VerificationBanner = () => {
  const { user, emailVerified } = useSelector((state) => state.auth);

  if (!user || emailVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-b border-yellow-400">
      <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-yellow-800 text-sm font-medium">
              ⚠️ Please verify your email address to access all features.
            </span>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Link
              to="/verify-email"
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-200 hover:bg-yellow-300"
            >
              Verify Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;