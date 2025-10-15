import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ref, set, get, push } from "firebase/database";
import { auth, database } from "./firebase";
import Header from './Header'; 
import { UploadCloud, Image as ImageIcon, AlertTriangle, Copy, ExternalLink, Loader2, Waves, History as HistoryIcon, LogOut } from 'lucide-react';

const url = import.meta.env.VITE_URL+"/predict";

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrls, setImageUrls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    if (user) {
      const userRef = ref(database, 'users/' + user.uid);
      get(userRef).then((snapshot) => {
        if (!snapshot.exists()) {
          set(userRef, {
            email: user.email,
            uid: user.uid,
            createdAt: new Date().toISOString(),
          });
        }
      });
    }
  }, [user]);

  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUrls(null);
      setError('');
    }
  };

  
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setError(!selectedFile ? 'Please select an image file first.' : 'You must be logged in.');
      return;
    }
    setLoading(true);
    setError('');
    setImageUrls(null);
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('idToken', idToken);
      const response = await fetch(url, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      const data = await response.json();
      setImageUrls(data);
      const predictionsRef = ref(database, 'users/' + user.uid + '/predictions');
      await push(predictionsRef, {
        original_url: data.original_url,
        enhanced_url: data.enhanced_url,
        result_url: data.result_url,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header navigate={navigate} handleLogout={handleLogout} />
      
      <main className="px-4 pt-8 pb-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Hero navigate={navigate} />

        <div className="mt-12 space-y-12">
          <Uploader 
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            loading={loading}
          />

          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-500"/>
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          {(loading || imageUrls) && (
            <Results loading={loading} imageUrls={imageUrls} />
          )}
        </div>
      </main>
    </div>
  );
}

const Hero = ({ navigate }) => (
  <div className="text-center py-10">
    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
      Unveil Clarity with AI Precision
    </h2>
    <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600">
      Upload an underwater image, enhance it with a single click, and discover predictions through our powerful and accessible interface.
    </p>
    <div className="mt-8 flex justify-center gap-4">
      <button 
        onClick={() => navigate('/history')}
        className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        View History
      </button>
      <button 
        onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition"
      >
        Try it now
      </button>
    </div>
  </div>
);

const Uploader = ({ selectedFile, handleFileChange, handleUpload, loading }) => (
  <section id="upload-section">
    <div className="flex items-center gap-3 mb-5">
      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-sm">1</span>
      <h3 className="text-xl font-bold text-gray-800">Upload Your Image</h3>
    </div>
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <label htmlFor="file-upload-input" className="md:col-span-2 flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-400 transition-colors duration-300">
          <div className="flex flex-col items-center justify-center text-center">
            <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-600 font-semibold">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, BMP (MAX. 10MB)</p>
          </div>
          <input id="file-upload-input" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>
        <div className="flex flex-col">
          <button id="choose-file-button" onClick={() => document.getElementById('file-upload-input')?.click()} className="w-full px-5 py-3 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg border border-indigo-200 hover:bg-indigo-200 transition">
            Choose file
          </button>
          <p className="text-xs text-gray-500 mt-3 mb-4 truncate px-1">
            {selectedFile ? `File: ${selectedFile.name}` : 'No file selected'}
          </p>
          <button 
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : null}
            {loading ? 'Processing...' : 'Enhance & Predict'}
          </button>
        </div>
      </div>
    </div>
  </section>
);

const Results = ({ loading, imageUrls }) => (
  <section id="results-section">
    <div className="flex items-center gap-3 mb-5">
      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-sm">2</span>
      <h3 className="text-xl font-bold text-gray-800">Results</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {loading ? (
        <>
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </>
      ) : (
        <>
          <ImageCard title="Original" imageUrl={imageUrls?.original_url} />
          <ImageCard title="Enhanced" imageUrl={imageUrls?.enhanced_url} />
          <ImageCard title="Prediction" imageUrl={imageUrls?.result_url} />
        </>
      )}
    </div>
  </section>
);

const ImageCard = ({ title, imageUrl }) => {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    if (imageUrl) {
        navigator.clipboard.writeText(imageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h4 className="font-bold text-gray-800 text-base">{title}</h4>
        <div className="flex items-center gap-4">
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition"><ExternalLink size={16} /></a>
          <button onClick={copyLink} className="text-gray-500 hover:text-indigo-600 transition">
            {copied ? <span className="text-xs font-bold text-indigo-600">Copied!</span> : <Copy size={16} />}
          </button>
        </div>
      </div>
      <div className="bg-gray-100 p-2">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-56 object-cover rounded-md" />
        ) : (
          <div className="h-56 flex items-center justify-center rounded-md bg-gray-200">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingCard = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="p-4 h-[57px] border-b border-gray-200 bg-gray-50">
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
        </div>
        <div className="p-2">
            <div className="h-56 w-full bg-gray-200 rounded-md"></div>
        </div>
    </div>
);