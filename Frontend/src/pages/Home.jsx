import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Dark Freelance Theme */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] 
      bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-blue-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>


        <div className="relative container mx-auto py-44 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="lg:w-1/2 text-white">
              <div className="inline-block px-4 py-2 bg-blue-500/10 rounded-full mb-6">
                <span className="text-blue-400 font-medium">Welcome to FreeXpert</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Master
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {" "}freelance{" "}
                </span>
                Through Practice
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-gray-300 leading-relaxed">
                Join over 100,000 security professionals and enthusiasts in our immersive learning platform.
                Master real-world hacking techniques, defensive strategies, and security best practices.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
                {JSON.parse(localStorage.getItem('userData')) ? (
                  <button onClick={() => navigate('/account')} className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-blue-600 
            to-cyan-600 rounded-lg font-semibold overflow-hidden">
                    <span className="relative z-10 text-white">View Your Progress</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 translate-y-full 
              group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                ) : (
                  <button onClick={() => navigate('/signup')} className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-blue-600 
            to-cyan-600 rounded-lg font-semibold overflow-hidden">
                    <span className="relative z-10 text-white">Start Your Journey</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 translate-y-full 
              group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                )}

                <button onClick={() => navigate('/learn')} className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:bg-white/10 
            text-white rounded-lg font-semibold transition-colors duration-300">
                  View Learning Paths
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="w-full aspect-square relative">
                <img
                  src="/Images/developer.webp"
                  alt="Freelance Shield"
                  className="absolute inset-0 w-full h-full object-contain opacity-35 filter blur-sm"
                />
                <img
                  src="/Images/developer.webp"
                  alt="Freelance Shield"
                  className="absolute inset-0 w-full h-full object-contain animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>
        {`
    @keyframes float {
      0% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
      100% { transform: translateY(0px) scale(1); }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
  `}
      </style>
    </div>
  );
};

export default Home;