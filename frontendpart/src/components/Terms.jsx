import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const Terms = () => {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please agree to the terms and conditions before continuing.');
      return;
    }
    alert('Terms accepted! Redirecting...'); // Replace with navigation logic if needed
  };

  return (
    <div className="bg-gradient-to-b from-blue-300 to-purple-300 min-h-screen flex items-center justify-center">
      <Header />
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl mt-20 mb-20 mx-auto">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-sm"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-600 mt-4">FinTrackAI</h1>
          <p className="text-gray-500 text-sm">Master Your Finances with AI Intelligence</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2 text-center">Terms & Services</h2>

        <div className="text-gray-600 text-sm space-y-4 mt-4 max-h-[300px] overflow-y-auto px-2">
          <p>
            Welcome to FinTrackAI! By using our platform, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern FinTrackAI's relationship with you in relation to this website.
          </p>
          <p>
            The content of the pages of this website is for your general information and use only. It is subject to change without notice.
          </p>
          <p>
            Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose.
          </p>
          <p>
            Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services, or information available through this website meet your specific requirements.
          </p>
          <p>
            Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.
          </p>
          <p>
            This website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).
          </p>
          <p>
            Your use of this website and any dispute arising out of such use of the website is subject to the laws of your jurisdiction.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">I have read and agree to all the conditions</span>
          </label>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-600"
          >
            Continue
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
      <div id="footer"></div>
      <Footer />
    </div>
  );
};

export default Terms;