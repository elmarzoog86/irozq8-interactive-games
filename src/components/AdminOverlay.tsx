import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { socket } from '../socket';
import { useTwitchAuth } from '../contexts/TwitchAuthContext';

export function AdminOverlay() {
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const { user } = useTwitchAuth();
  
  const jumpScareAudio = useRef(new Audio('/jumpscare.mp3'));
  const crowdLaughAudio = useRef(new Audio('/crowdlaugh.mp3'));

  useEffect(() => {
    if (user) {
      socket.emit('streamer_online', user.display_name || user.login);
    }
  }, [user]);

  useEffect(() => {
    const handleAdminEvent = (payload: any) => {
      console.log('Received admin event:', payload);

      if (payload.actionType === 'sound') {
        if (payload.sound === 'jumpscare') {
          jumpScareAudio.current.currentTime = 0;
          jumpScareAudio.current.play().catch(e => console.log('Audio play failed:', e));
        } else if (payload.sound === 'crowdlaugh') {
          crowdLaughAudio.current.currentTime = 0;
          crowdLaughAudio.current.play().catch(e => console.log('Audio play failed:', e));
        }

        if (!payload.title) return; // If it's just a sound without overlay, return
      }

      setActiveEvent(payload);

      if (payload.duration) {
        setTimeout(() => setActiveEvent(null), payload.duration);
      }
    };

    socket.on('admin_event', handleAdminEvent);

    return () => {
      socket.off('admin_event', handleAdminEvent);
    };
  }, []);return (
    <AnimatePresence>
      {activeEvent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className={`fixed top-1/4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none ${activeEvent.style || 'bg-red-600/90'} ${activeEvent.textStyle || 'text-white'} p-8 rounded-3xl shadow-[0_0_100px_rgba(255,0,0,0.5)] border-4 ${activeEvent.borderStyle || 'border-red-500'} text-center min-w-[500px] flex flex-col items-center justify-center`}
        >
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <h1 className="text-7xl font-black mb-4 uppercase drop-shadow-2xl font-arabic text-center">
              {activeEvent.title}
            </h1>
            {activeEvent.message && (
               <p className="text-4xl font-bold font-arabic text-center">{activeEvent.message}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
