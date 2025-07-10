import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import Header from './Dashboard/Header';
import Footer from './components/Footer';

const Upload = () => {
  const [fileName, setFileName] = useState('Drag and drop or click to upload a file');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [downloadVisible, setDownloadVisible] = useState(false);
  const previewRef = useRef(null);
  const downloadRef = useRef(null);

  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file ? file.name : 'Drag and drop or click to upload a file');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('#fileInput');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (file.size > maxSizeBytes) {
      alert(`File size exceeds ${maxSizeMB}MB. Please choose a smaller file.`);
      fileInput.value = '';
      setFileName('Drag and drop or click to upload a file');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF, DOC, DOCX, and CSV are allowed.');
      fileInput.value = '';
      setFileName('Drag and drop or click to upload a file');
      return;
    }

    setPreviewVisible(true);
  };

  const handleGenerateReport = () => {
    setDownloadVisible(true);
  };

  const handleDownload = () => {
    alert('Download functionality will be added soon.');
  };

  useEffect(() => {
    if (previewVisible && previewRef.current) {
      gsap.fromTo(previewRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    }
  }, [previewVisible]);

  useEffect(() => {
    if (downloadVisible && downloadRef.current) {
      gsap.fromTo(downloadRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    }
  }, [downloadVisible]);

  useEffect(() => {
    gsap.from('.hero h2', { y: -30, opacity: 0, duration: 1 });
    gsap.from('.hero p', { y: 30, opacity: 0, duration: 1, delay: 0.3 });
    gsap.from('.upload-illustration', { x: -50, opacity: 0, duration: 1, delay: 0.6 });
    gsap.from('.upload-form-block', { x: 50, opacity: 0, duration: 1, delay: 0.6 });
  }, []);

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <section className="hero">
        <h2>Upload Your Financial Documents</h2>
        <p>Drag, drop or select your expense files to begin your smart analysis journey.</p>
      </section>

      <main className="container upload-layout">
        <div className="upload-illustration">
          <img src="images/upload-illustration.jpg" alt="Upload Illustration" />
        </div>
        <div className="upload-form-block">
          <form className="upload-form" onSubmit={handleSubmit}>
            <label htmlFor="fileInput" className="drop-zone" onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()} onDrop={handleDrop}>
              <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.csv" required onChange={handleFileChange} />
              <span id="fileName">{fileName}</span>
            </label>
            <button type="submit" id="uploadBtn" className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-300">
              Upload
            </button>
          </form>

          <div ref={previewRef} id="previewSection" className={`preview-section ${!previewVisible ? 'hidden' : ''}`}>
            <p className="inline-flex items-center bg-green-100 text-green-700 px-4 py-1 rounded-full font-medium text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              File is ready for processing.
            </p>
            <br />
            <button
              id="generateBtn"
              className="bg-green-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-700 transition duration-300"
              onClick={handleGenerateReport}
            >
              Generate Report
            </button>
          </div>

          <div ref={downloadRef} id="downloadSection" className={`download-section ${!downloadVisible ? 'hidden' : ''}`}>
            <p className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-semibold text-sm">
              🎉 Report generated!
            </p>
            <div className="download-buttons flex flex-wrap justify-center gap-4 mt-4">
              <button className="download-btn bg-purple-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-purple-700 transition duration-300" onClick={handleDownload}>
                Download as PDF
              </button>
              <button className="download-btn bg-pink-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-pink-700 transition duration-300" onClick={handleDownload}>
                Download as CSV
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;