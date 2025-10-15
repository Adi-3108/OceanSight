import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, database } from './firebase';
import Header from './Header';
import { ArrowLeft, ExternalLink, Copy, ImageIcon, Loader2, History as HistoryIcon } from 'lucide-react';


export default function History() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const predictionsRef = ref(database, 'users/' + user.uid + '/predictions');
      
      const unsubscribe = onValue(predictionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const historyList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setHistory(historyList);
        } else {
          setHistory([]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header handleLogout={handleLogout} />
      
      <main className="px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Prediction History</h1>
            <p className="mt-1 text-base text-gray-600">Browse your previously enhanced images and predictions.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
        
        <div className="space-y-8">
          {loading ? (
            <LoadingState />
          ) : history.length > 0 ? (
            history.map((item) => <HistoryItem key={item.id} item={item} />)
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}



const HistoryItem = ({ item }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
    <div className="p-4 border-b border-gray-200">
      <p className="text-sm font-semibold text-gray-700">
        Time: <span className="font-normal text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
      </p>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <ImageCard title="Original" imageUrl={item.original_url} />
      <ImageCard title="Enhanced" imageUrl={item.enhanced_url} />
      <ImageCard title="Prediction" imageUrl={item.result_url} />
    </div>
  </div>
);

const ImageCard = ({ title, imageUrl }) => {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
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

const LoadingState = () => (
  <div className="text-center py-20">
    <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
    <p className="mt-4 text-lg font-semibold text-gray-700">Loading History...</p>
    <p className="text-gray-500">Please wait a moment.</p>
  </div>
);

const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
      <HistoryIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-800">No History Found</h3>
      <p className="mt-1 text-sm text-gray-500">You haven't made any predictions yet. Go to the dashboard to get started!</p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};