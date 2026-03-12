import React from 'react';
import { motion } from 'motion/react';
import { useTwitchAuth } from '../contexts/TwitchAuthContext';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft, Play, Lock } from 'lucide-react';

const games = [
  {
    id: 'questions',
    title: 'سين جيم',
    description: 'لعبة أسئلة تفاعلية متنوعة للاعبين الأسرع في الإجابة',
    icon: '🎯',
    path: '/games/questions',
    status: 'active',
  },
  {
    id: 'fruit-war',
    title: 'حرب الفواكه',
    description: 'اللعبة تعتمد على تعيين فواكه أو خضروات لكل لاعب ويتم الإقصاء بالنقر، تنافس من أجل البقاء!',
    icon: '🍎',
    path: '/games/fruit-war',
    status: 'active',
  },
  {
    id: 'guess-song',
    title: 'خمن الأغنية',
    description: 'لعبة تخمين الأغاني مع الشات',
    icon: '🎵',
    path: '/games/guess-song',
    status: 'active',
  },
  {
    id: 'typing-derby',
    title: 'سباق الكتابة',
    description: 'تحدي وسرعة كتابة بين جمهورك! من سيكون الأسرع؟',
    icon: '⌨️',
    path: '/games/typing-derby',
    status: 'active',
  }
];

export function Games() {
  const { user } = useTwitchAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 border-b border-yellow-500/20 bg-black/50 ">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/50 glow-gold">
              <Gamepad2 className="w-6 h-6 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold font-arabic tracking-wider text-yellow-500 glow-gold-text">
              iRozQ8
            </h1>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-full border border-yellow-500/30">
            <img 
              src={user.profile_image_url} 
              alt={user.display_name} 
              className="w-8 h-8 rounded-full border border-yellow-500/50"
            />
            <span className="font-medium text-zinc-200">{user.display_name}</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="mb-12 text-center md:text-right">
          <h2 className="text-4xl font-bold font-arabic mb-4 text-white">
            اختر <span className="text-yellow-500 glow-gold-text">لعبتك</span>
          </h2>
          <p className="text-zinc-400 font-arabic text-lg">
            مجموعة من الألعاب التفاعلية الممتعة للعب مع متابعينك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group rounded-2xl border ${
                game.status === 'active' 
                  ? 'bg-zinc-900/50 border-yellow-500/30 hover:border-yellow-500 cursor-pointer' 
                  : 'bg-zinc-900/20 border-zinc-800 opacity-60 cursor-not-allowed'
              } p-6 transition-all duration-300  overflow-hidden`}
              onClick={() => game.status === 'active' && navigate(game.path)}
            >
              {game.status === 'active' && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">{game.icon}</div>
                  {game.status === 'coming_soon' && (
                    <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      قريباً
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold font-arabic text-white mb-3 text-right">
                  {game.title}
                </h3>
                
                <p className="text-zinc-400 font-arabic text-right mb-8 flex-1 leading-relaxed">
                  {game.description}
                </p>

                {game.status === 'active' && (
                  <div className="flex justify-end">
                    <button className="bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black px-6 py-2 rounded-full font-bold font-arabic transition-colors flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      العب الآن
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
