import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Banknote, Bomb, CheckCircle2, Shield, Siren, Lock, Users, XCircle } from 'lucide-react';

export default function BankRobberyController() {
  const { roomId } = useParams<{ roomId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [myRoleData, setMyRoleData] = useState<any>(null);
  
  useEffect(() => {
    // If not in a browser environment, return early
    if (typeof window === 'undefined') return;
    
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('br_state_update', (state) => {
      setGameState(state);
    });

    newSocket.on('br_private_role', (roleData) => {
      setMyRoleData(roleData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (!name.trim() || !socket) return;
    socket.emit('br_join_game', { roomId, name });
    setJoined(true);
  };

  const handleReady = () => {
    if (!socket) return;
    socket.emit('br_ready_next', { roomId });
  };

  const handleVote = (vote: 'approve' | 'reject') => {
    if (!socket) return;
    socket.emit('br_submit_vote', { roomId, vote });
  };

  const handleHeistAction = (action: 'steal' | 'alarm') => {
    if (!socket) return;
    socket.emit('br_submit_heist_action', { roomId, action });
  };

  const handleAssassinate = (targetId: string) => {
    if (!socket) return;
    socket.emit('br_assassinate', { roomId, targetId });
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 text-white font-sans dir-rtl" dir="rtl">
        <div className="max-w-md w-full bg-neutral-800 rounded-2xl p-6 shadow-xl border border-neutral-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-red-500 mb-2">سرقة البنك 🏦</h1>
            <p className="text-neutral-400">أدخل اسمك للانضمام للعصابة</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك هنا..."
            className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-red-500 transition-colors mb-4 text-center"
            maxLength={15}
          />
          <button
            onClick={handleJoin}
            disabled={!name.trim()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xl py-4 rounded-xl transition-all shadow-lg active:scale-95"
          >
            ادخل اللعبة
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 text-white">
        <div className="animate-spin text-red-500"><Lock size={48} /></div>
      </div>
    );
  }

  const me = gameState.players?.find((p: any) => p.id === socket?.id);
  const isMastermind = gameState.mastermindId === socket?.id;
  const amIOnTeam = gameState.currentTeam?.includes(socket?.id);
  const myVote = gameState.votes?.[socket?.id || ''];
  const [selectedForTeam, setSelectedForTeam] = useState<string[]>([]);

  const submitProposedTeam = () => {
    if (!socket) return;
    socket.emit('br_propose_team', { roomId, proposedTeamIds: selectedForTeam });
  };

  const getRoleHeader = () => {
    if (!myRoleData) return null;
    const { role } = myRoleData;
    if (role === 'cop') return {
      title: 'شرطي متخفي 👮‍♂️',
      desc: 'خرب السرقات ولا تخليهم يصيدونك!',
      color: 'bg-blue-600'
    };
    if (role === 'boss') return {
      title: 'العراب (الزعيم) 🕴️',
      desc: 'أنت تعرف الشرطة! وجه فريقك بدون لا ينكشف أمرك.',
      color: 'bg-purple-600'
    };
    return {
      title: 'حرامي عادي 🦹‍♂️',
      desc: 'حاول تعرف منو الشرطة وشارك بالسرقة.',
      color: 'bg-neutral-600'
    };
  };

  const headerDetails = getRoleHeader();

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans p-4 pb-24" dir="rtl">
      {/* Top Bar indicating role */}
      {headerDetails && (
        <div className={`fixed top-0 left-0 right-0 \${headerDetails.color} p-4 shadow-lg z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">{headerDetails.title}</h2>
              <p className="text-xs opacity-90">{headerDetails.desc}</p>
            </div>
          </div>
          {myRoleData?.role === 'boss' && myRoleData.copList?.length > 0 && (
            <div className="mt-2 text-xs bg-black/30 p-2 rounded-lg">
              <span className="font-bold text-red-300">🚨 الشرطة هم:</span> 
              {gameState.players.filter((p: any) => myRoleData.copList.includes(p.id)).map((p: any) => p.name).join(', ')}
            </div>
          )}
          {myRoleData?.role === 'cop' && myRoleData.copList?.length > 1 && (
            <div className="mt-2 text-xs bg-black/30 p-2 rounded-lg">
              <span className="font-bold text-blue-300">👮 زملاؤك الشرطة:</span> 
              {gameState.players.filter((p: any) => myRoleData.copList.includes(p.id) && p.id !== socket?.id).map((p: any) => p.name).join(', ')}
            </div>
          )}
        </div>
      )}

      <div className="mt-24 space-y-6 max-w-md mx-auto">
        
        {/* LOBBY */}
        {gameState.status === 'lobby' && (
          <div className="bg-neutral-800 rounded-xl p-6 text-center border-2 border-red-500/20">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">أنت في اللوبي</h2>
            <p className="text-neutral-400">انظر إلى الشاشة الكبيرة بانتظار بدء اللعبة!</p>
          </div>
        )}

        {/* ROLE REVEAL */}
        {gameState.status === 'role_reveal' && (
           <div className="bg-neutral-800 rounded-xl p-6 text-center shadow-xl border border-neutral-700">
             <h2 className="text-2xl font-bold mb-4">هذه شخصيتك السرية!</h2>
             <div className={`p-6 rounded-xl mb-6 \${headerDetails?.color}`}>
                <h1 className="text-3xl font-black mb-2">{headerDetails?.title}</h1>
                <p>{headerDetails?.desc}</p>
             </div>
             <button
                onClick={handleReady}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 rounded-xl transition-all"
             >
                جاهز 👍
             </button>
           </div>
        )}

        {/* PLANNING - MASTERMIND */}
        {gameState.status === 'planning' && isMastermind && (
          <div className="bg-neutral-800 rounded-xl p-6 border-2 border-amber-500">
            <h2 className="text-xl font-bold mb-2 text-amber-500">أنت الزعيم هالجولة 👑</h2>
            <p className="text-sm text-neutral-400 mb-4">اختر أعضاء الفريق للذهاب للخزنة.</p>
            
            <div className="space-y-2 mb-6">
              {gameState.players.map((p: any) => (
                <div 
                  key={p.id}
                  onClick={() => {
                    if (selectedForTeam.includes(p.id)) {
                      setSelectedForTeam(selectedForTeam.filter(id => id !== p.id));
                    } else {
                      setSelectedForTeam([...selectedForTeam, p.id]);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all cursor-pointer \${
                    selectedForTeam.includes(p.id) 
                      ? 'border-amber-500 bg-amber-500/20' 
                      : 'border-neutral-700 bg-neutral-900'
                  }`}
                >
                  <span className="font-bold">{p.name} {p.id === socket?.id ? '(أنت)' : ''}</span>
                  {selectedForTeam.includes(p.id) && <CheckCircle2 className="text-amber-500" />}
                </div>
              ))}
            </div>

            <button
              onClick={submitProposedTeam}
              disabled={selectedForTeam.length === 0}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xl py-4 rounded-xl transition-all"
            >
              طرح الفريق للتصويت!
            </button>
          </div>
        )}

        {/* PLANNING - WAITING */}
        {gameState.status === 'planning' && !isMastermind && (
          <div className="bg-neutral-800 rounded-xl p-6 text-center border-2 border-neutral-700">
            <div className="animate-pulse mb-4 text-amber-500 flex justify-center">
              <Users size={48} />
            </div>
            <h2 className="text-xl font-bold mb-2">الزعيم يختار الفريق...</h2>
            <p className="text-neutral-400">انظر إلى الشاشة الكبيرة لمعرفة من هو الزعيم.</p>
          </div>
        )}

        {/* VOTING */}
        {gameState.status === 'voting' && (
          <div className="bg-neutral-800 rounded-xl p-6 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <h2 className="text-2xl font-bold mb-2 text-center text-blue-400">وقت التصويت!</h2>
            <p className="text-center text-neutral-400 mb-6">هل توافق على هذا الفريق؟</p>
            
            <div className="flex gap-4">
              <button
                onClick={() => handleVote('approve')}
                disabled={!!myVote}
                className={`flex-1 py-6 rounded-xl font-bold text-xl flex flex-col items-center gap-2 transition-all \${
                  myVote === 'approve' ? 'bg-green-600 ring-4 ring-green-300' : 
                  myVote ? 'bg-neutral-700 opacity-50' : 'bg-green-600 hover:bg-green-500 active:scale-95'
                }`}
              >
                <CheckCircle2 size={32} />
                موافق
              </button>
              
              <button
                onClick={() => handleVote('reject')}
                disabled={!!myVote}
                className={`flex-1 py-6 rounded-xl font-bold text-xl flex flex-col items-center gap-2 transition-all \${
                  myVote === 'reject' ? 'bg-red-600 ring-4 ring-red-300' : 
                  myVote ? 'bg-neutral-700 opacity-50' : 'bg-red-600 hover:bg-red-500 active:scale-95'
                }`}
              >
                <XCircle size={32} />
                أرفض
              </button>
            </div>
            {myVote && <p className="text-center mt-4 text-neutral-400">تم تسجيل تصويتك بانتظار البقية!</p>}
          </div>
        )}

        {/* HEIST ACTION (IF ON TEAM) */}
        {gameState.status === 'heist' && amIOnTeam && (
          <div className="bg-neutral-800 rounded-xl p-6 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            <h2 className="text-3xl font-black mb-2 text-center text-white">الخزنة أمـامـك!</h2>
            <p className="text-center text-neutral-400 mb-8">اختر بحذر...</p>
            
            <div className="space-y-4">
              <button
                onClick={() => handleHeistAction('steal')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-2xl flex items-center justify-center gap-4 py-8 rounded-2xl transition-all active:scale-95 border-b-4 border-emerald-800"
              >
                <Banknote size={40} />
                اسرق الفلوس 💵
              </button>
              
              {myRoleData?.role === 'cop' && (
                <button
                  onClick={() => handleHeistAction('alarm')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-2xl flex items-center justify-center gap-4 py-8 rounded-2xl transition-all active:scale-95 border-b-4 border-red-800"
                >
                  <Siren size={40} />
                  دُق الإنذار 🚨
                </button>
              )}
            </div>
          </div>
        )}

        {/* HEIST ACTION (IF NOT ON TEAM) */}
        {gameState.status === 'heist' && !amIOnTeam && (
          <div className="bg-neutral-800 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold mb-4">الفريق في الخزنة الآن...</h2>
            <div className="animate-pulse flex justify-center text-red-500">
              <Lock size={64} />
            </div>
            <p className="text-neutral-400 mt-4">انظر للشاشة الكبيرة لتعرف النتيجة!</p>
          </div>
        )}

        {/* ASSASSINATION PHASE (COPS ONLY) */}
        {gameState.status === 'assassination' && myRoleData?.role === 'cop' && (
          <div className="bg-neutral-800 rounded-xl p-6 border-2 border-purple-500 text-center">
            <h2 className="text-2xl font-black text-purple-400 mb-2">الفرصة الأخيرة!</h2>
            <p className="mb-6">حاولوا معرفة من هو "العرّاب" لاغتياله وسرقة الفوز!</p>
            
            <div className="space-y-2">
              {gameState.players.filter((p: any) => p.role !== 'cop').map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => handleAssassinate(p.id)}
                  className="w-full bg-neutral-700 hover:bg-purple-600 text-white font-bold text-lg py-4 rounded-xl transition-all"
                >
                  اغتال 🎯 {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

         {gameState.status === 'assassination' && myRoleData?.role !== 'cop' && (
          <div className="bg-neutral-800 rounded-xl p-6 text-center">
             <h2 className="text-2xl font-bold text-red-500 mb-2">انكشف أمرهم!</h2>
             <p>الشرطة يبحثون عن العرّاب لاغتياله... هل خفيتم أثره؟</p>
          </div>
        )}

        {(gameState.status === 'cops_won' || gameState.status === 'cops_won_assassination' || gameState.status === 'robbers_won') && (
           <div className="bg-neutral-800 rounded-xl p-6 text-center">
              <h2 className="text-3xl font-black mb-4">انتهت اللعبة!</h2>
              <p>طالع الشاشة الكبيرة عشان تشوف النتيجة وتفاصيل الخونة!</p>
           </div>
        )}

      </div>
    </div>
  );
}
