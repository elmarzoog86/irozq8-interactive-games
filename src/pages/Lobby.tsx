import React from 'react';
import { motion } from 'motion/react';
import { useTwitchAuth } from '../contexts/TwitchAuthContext';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, LogIn, LogOut } from 'lucide-react';

export function Lobby() {
  const { user, login, logout, isAuthenticated } = useTwitchAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 border-b border-yellow-500/20 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/50 glow-gold">
            <Gamepad2 className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold font-arabic tracking-wider text-yellow-500 glow-gold-text">
            iRozQ8
          </h1>
        </div>

        <div>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-full border border-yellow-500/30">
                <img 
                  src={user.profile_image_url} 
                  alt={user.display_name} 
                  className="w-8 h-8 rounded-full border border-yellow-500/50"
                />
                <span className="font-medium text-zinc-200">{user.display_name}</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 bg-[#9146FF] hover:bg-[#772CE8] text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-purple-500/20"
            >
              <LogIn className="w-5 h-5" />
              تسجيل الدخول عبر تويتش
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h2 className="text-5xl md:text-7xl font-bold font-arabic mb-6 text-white tracking-tight">
            منصة الألعاب <span className="text-yellow-500 glow-gold-text">التفاعلية</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12 font-arabic max-w-2xl mx-auto leading-relaxed">
            العب مع متابعينك بث مباشر، ألعاب تفاعلية، وتحديات ممتعة تزيد من تفاعل البث الخاص بك.
          </p>

          {isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/games')}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-4 rounded-full font-bold text-xl transition-all glow-gold flex items-center gap-3 mx-auto"
            >
              <Gamepad2 className="w-6 h-6" />
              تصفح الألعاب
            </motion.button>
          ) : (
            <div className="p-6 bg-zinc-900/50 border border-yellow-500/20 rounded-2xl max-w-md mx-auto backdrop-blur-sm">
              <p className="text-zinc-300 mb-4 font-arabic">
                قم بتسجيل الدخول باستخدام حساب تويتش للبدء
              </p>
              <button 
                onClick={login}
                className="w-full flex items-center justify-center gap-2 bg-[#9146FF] hover:bg-[#772CE8] text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <LogIn className="w-5 h-5" />
                تسجيل الدخول عبر تويتش
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
