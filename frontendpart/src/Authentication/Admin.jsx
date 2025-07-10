import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both admin email and password.');
      return;
    }

    if (!validateEmail(email)) {
      alert('Please enter a valid admin email.');
      return;
    }

    // Temporary admin login - redirect to admin dashboard
    alert(`Admin signed in as: ${email}`);
    navigate('/admin-dashboard');
  };

  return (
    <div className="bg-gray-100">
      <Header />
      <div className="py-6">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold text-blue-600 bg-clip-text pb-3">Admin Login</h1>
          <p className="text-sm mt-2 text-blue-500">Home &gt; Admin Sign In</p>
        </div>
      </div>

      <div className="flex justify-center mt-10 px-4 mb-10">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md w-full">
          {/* Centered Form */}
          <div className="p-8">
            {/* Admin Badge */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                Administrator Access
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-2 text-gray-900 text-center">Welcome Back, Admin!</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">Please sign in to access the admin dashboard.</p>

            <form onSubmit={handleSubmit}>
              <input
                id="email"
                type="email"
                placeholder="Admin Email"
                className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Admin Password"
                  className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Sign In as Admin
              </button>
            </form>

            <div className="text-center mt-4">
              <Link to="#" className="text-blue-600 text-sm hover:underline">
                Forgot Password?
              </Link>
            </div>

            <p className="text-sm mt-4 text-center">
              Need user access?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Switch to User Login
              </Link>
            </p>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 text-gray-400">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <div className="flex justify-center space-x-4">
              <button className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-google"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                </svg>
              </button>
              <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-facebook"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                </svg>
              </button>
              <button className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-twitter-x"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="footer"></div>
      <Footer />
    </div>
  );
};

export default AdminLogin;