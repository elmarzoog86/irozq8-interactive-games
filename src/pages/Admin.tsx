import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { ShieldAlert, Zap, Ghost, Siren, Volume2, Users } from 'lucide-react';

interface StreamerInfo {
  socketId: string;
  username: string;
}

export default function AdminControlBoard() {
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [streamers, setStreamers] = useState<StreamerInfo[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const handleStreamersList = (list: StreamerInfo[]) => {
        setStreamers(list);
      };
      
      socket.emit('get_streamers');
      socket.on('streamers_list', handleStreamersList);
      
      return () => {
        socket.off('streamers_list', handleStreamersList);
      };
    }
  }, [isAuthenticated]);

  // Very simple auth to prevent accidential access if streamers find the URL
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center font-arabic p-4">
              <div className="bg-zinc-900 border border-red-500/30 p-8 rounded-3xl text-center space-y-6 max-w-md w-full">
                  <ShieldAlert className="w-20 h-20 text-red-500 mx-auto animate-pulse" />
                  <h1 className="text-3xl font-black text-white">لوحة تحكم المشرف</h1>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور..." className="w-full bg-black/50 border border-zinc-700 p-4 rounded-xl text-center text-white text-xl outline-none focus:border-red-500 transition-colors" />
                  <button onClick={() => { if(password === '1234') setIsAuthenticated(true); else alert('خطأ'); }} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all">
                      دخول
                  </button>
              </div>
          </div>
      )
  }

  const triggerEvent = (preset: string) => {
    let payload: any = { actionType: 'overlay', targetStreamerId: selectedTarget };

    switch (preset) {
        case 'scare':
            payload = {
                ...payload,
                title: '💀 هجمــة مباغتـــة 💀',
                message: 'اكمل اللعب إن استطعت',
                style: 'bg-black/95',
                borderStyle: 'border-purple-600',
                duration: 5000
            };
            break;
        case 'troll':
            payload = {
                ...payload,
                title: '🤡 عذراً... تم سرقة اللعبة 🤡',
                message: 'هاهاهاها...',
                style: 'bg-green-600/90',
                borderStyle: 'border-green-400',
                duration: 4000
            };
            break;
        case 'warning':
            payload = {
                ...payload,
                title: '⚠️ إنـــــذار للمشاهديـــن ⚠️',
                message: 'توقفوا عن الغش!',
                style: 'bg-amber-600/90',
                borderStyle: 'border-amber-400',
                duration: 6000
            };
            break;
        case 'custom':
            payload = {
                ...payload,
                title: customTitle || 'رسالة إدارية',
                message: customMessage,
                style: 'bg-yellow-500/90',
                borderStyle: 'border-yellow-400',
                textStyle: 'text-black',
                duration: 8000
            };
            break;
        case 'sound_jumpscare':
            payload = {
                ...payload,
                actionType: 'sound',
                sound: 'jumpscare',
                duration: 5000
            };
            break;
        case 'sound_crowdlaugh':
            payload = {
                ...payload,
                actionType: 'sound',
                sound: 'crowdlaugh',
                duration: 5000
            };
            break;
    }
    socket.emit('admin_action', payload);
    console.log("Admin action emitted:", payload);
  };

  return (
    <div className="min-h-screen bg-black font-arabic text-white p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-3xl mx-auto flex items-center justify-center">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">لوحة تحكم الأدرينالين</h1>
                <p className="text-zinc-400 font-bold">تحكم في شاشات الاستريمرز بشكل حي ومباشر</p>
            </div>

            <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl space-y-6">
                <h2 className="text-2xl font-black text-red-500 mb-6 border-b border-red-500/20 pb-4 flex items-center gap-3">
                    <ShieldAlert />
                    تحكم اللعبة المباشر
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-black">
                        <input type="text" value={fakeUsername} onChange={e => setFakeUsername(e.target.value)} placeholder="اسم اللاعب المتوقع..." className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-red-500" />
                        <input type="text" value={fakeMessage} onChange={e => setFakeMessage(e.target.value)} placeholder="الرسالة / الإجابة / الأمر (!join)..." className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-red-500" />
                    </div>
                    <button onClick={() => triggerEvent('fake_chat')} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        إرسال رسالة وهمية 💬
                    </button>
                    <button onClick={() => triggerEvent('end_game')} className="w-full bg-red-900 hover:bg-red-800 border border-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] mt-4">
                        إنهاء اللعبة الحالية 🛑
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                   <Users className="text-blue-500" />
                   <h2 className="text-2xl font-black text-white">اختر الاستريمر</h2>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                     onClick={() => setSelectedTarget(null)}
                     className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedTarget === null ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                  >
                     الجميع (Global)
                  </button>
                  {streamers.map(s => (
                    <button 
                       key={s.socketId}
                       onClick={() => setSelectedTarget(s.socketId)}
                       className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedTarget === s.socketId ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                       {s.username}
                    </button>
                  ))}
                  {streamers.length === 0 && (
                    <span className="text-zinc-500 py-3">لا يوجد استريمر متصل حاليا...</span>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => triggerEvent('scare')} className="bg-black border border-purple-500/30 hover:border-purple-500 p-8 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105 group hover:bg-purple-900/10">
                    <Ghost size={48} className="text-purple-500 group-hover:animate-bounce" />
                    <span className="text-2xl font-black text-white">رعب مفاجئ</span>
                </button>
                <button onClick={() => triggerEvent('troll')} className="bg-black border border-green-500/30 hover:border-green-500 p-8 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105 group hover:bg-green-900/10">
                    <Zap size={48} className="text-green-500 group-hover:rotate-12" />
                    <span className="text-2xl font-black text-white">استفزاز</span>
                </button>
                <button onClick={() => triggerEvent('warning')} className="bg-black border border-amber-500/30 hover:border-amber-500 p-8 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105 group hover:bg-amber-900/10">
                    <Siren size={48} className="text-amber-500 group-hover:animate-pulse" />
                    <span className="text-2xl font-black text-white">إنذار الشات</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => triggerEvent('sound_jumpscare')} className="bg-black border border-red-500/30 hover:border-red-500 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105 group hover:bg-red-900/10">
                    <Volume2 size={40} className="text-red-500 group-hover:scale-110" />
                    <span className="text-xl font-black text-white">صوت رعب</span>
                </button>
                <button onClick={() => triggerEvent('sound_crowdlaugh')} className="bg-black border border-yellow-500/30 hover:border-yellow-500 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105 group hover:bg-yellow-900/10">
                    <Volume2 size={40} className="text-yellow-500 group-hover:scale-110" />
                    <span className="text-xl font-black text-white">صوت ضحك جمهور</span>
                </button>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
                <h2 className="text-2xl font-black text-white mb-6 border-b border-zinc-800 pb-4">رسالة مخصصة (تطبع على الشاشة)</h2>
                <div className="space-y-4">
                    <input type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="العنوان الرئيسي" className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />
                    <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} placeholder="الرسالة الفرعية..." className="w-full h-32 bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-yellow-500 resize-none" />
                    <button onClick={() => triggerEvent('custom')} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        إرسال الإشعار للشاشات 🚀
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}