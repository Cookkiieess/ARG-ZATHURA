import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key } from 'lucide-react';

// Use the image provided by the user
import boardImage from '../assets/25780483ac4f5733fac21e26ea45819896520696.png';

const ZATHURA_CARDS = [
  "Meteor shower, take evasive action.",
  "Robot malfunction. Cannot repair.",
  "Zorgons attacking! Defend the ship!",
  "Gravity well, lose a turn.",
  "You are promoted to Fleet Admiral.",
  "Rescue stranded astronaut.",
  "Reprogramming sequence initiated.",
  "Asteroid field approaching.",
  "Wormhole detected. Roll again.",
  "Cryogenic sleep pod breached."
];

export default function App() {
  const [isRolling, setIsRolling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleGoPress = () => {
    if (isRolling) return;

    setIsRolling(true);
    setCurrentCard(null); // Hide current card

    let rolls = 0;
    const maxRolls = 20;

    rollIntervalRef.current = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 6) + 1);
      rolls++;

      if (rolls >= maxRolls) {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        const finalNumber = Math.floor(Math.random() * 6) + 1;
        setDisplayNumber(finalNumber);
        setIsRolling(false);
        
        // Pick a random card after rolling finishes
        setTimeout(() => {
          const randomCard = ZATHURA_CARDS[Math.floor(Math.random() * ZATHURA_CARDS.length)];
          setCurrentCard(randomCard);
        }, 500);
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-between font-sans overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      
      {/* Top Section: The Game Board */}
      <div className="flex-1 w-full flex items-center justify-center p-6 sm:p-12 z-0 relative">
         {/* Subtle space glow behind board */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-900/20 blur-[100px] rounded-full z-0"></div>
         
         <img 
            src={boardImage} 
            alt="Zathura Board" 
            className="w-full max-w-5xl h-auto rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border-8 border-amber-900/30 object-contain max-h-[55vh] relative z-10"
         />
      </div>

      {/* Bottom Section: The Emulator Console */}
      <div className="w-full relative z-8 flex justify-center">
        {/* Made the console noticeably bigger (h-88 sm:h-[400px]) */}
        <div className="w-full max-w-7xl h-88 sm:h-[400px] bg-[#8c929c] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] rounded-t-[40px] border-t-[12px] border-x-[8px] border-[#6b707a] shadow-[inset_0_30px_50px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.5),0_-10px_50px_rgba(0,0,0,0.8)] flex relative">
          
          {/* Machine Rivets & Details */}
          <div className="absolute top-4 left-8 w-4 h-4 rounded-full bg-[#8c929c] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.6)] border border-[#5a5f68]"></div>
          <div className="absolute top-4 right-8 w-4 h-4 rounded-full bg-[#8c929c] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.6)] border border-[#5a5f68]"></div>

          {/* Left Column: Digital Display & Small GO Button */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center gap-6 sm:gap-10 pt-4 z-20">
            
            {/* Digital Display Box (Moved to Left) */}
            <div className="w-20 sm:w-28 h-24 sm:h-32 bg-[#111] rounded-lg border-4 sm:border-[6px] border-[#3a3d42] shadow-[inset_0_0_20px_rgba(0,0,0,1),0_2px_5px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden relative">
               {/* Scanline overlay */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.05)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0))] bg-[length:100%_4px] pointer-events-none z-10"></div>
               
               <span 
                 className={`font-mono text-5xl sm:text-7xl font-bold transition-all duration-75 relative z-20
                   ${displayNumber === null ? 'text-[#2a2a2a]' : 'text-[#ff3333]'} 
                 `}
                 style={{ 
                   textShadow: displayNumber !== null ? '0 0 10px rgba(255,51,51,0.8), 0 0 20px rgba(255,51,51,0.4)' : 'none',
                   fontFamily: "'Courier New', Courier, monospace" 
                 }}
               >
                 {displayNumber !== null ? displayNumber : '8'}
               </span>
            </div>

            {/* Small GO Button */}
            <div className="relative group flex flex-col items-center">
              {/* Outer button bezel */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#4a4d54] rounded-full flex items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.8),0_2px_5px_rgba(255,255,255,0.3)] border-[3px] sm:border-4 border-[#3a3d42]">
                {/* The actual pressable button (Made smaller) */}
                <button 
                  onClick={handleGoPress}
                  disabled={isRolling}
                  className={`
                    w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center 
                    text-white font-black text-lg sm:text-2xl tracking-widest cursor-pointer
                    transition-all duration-150 ease-out
                    ${isRolling 
                      ? 'bg-red-800 translate-y-1 border-b-0 shadow-inner' 
                      : 'bg-[#cc2929] border-b-[4px] sm:border-b-[6px] border-[#8a1c1c] shadow-[0_6px_10px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(255,255,255,0.3)] hover:bg-[#e62e2e] active:translate-y-1 active:border-b-0 active:shadow-inner'
                    }
                  `}
                >
                  <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>GO</span>
                </button>
              </div>
              <div className="mt-3 text-zinc-800 font-mono text-[9px] sm:text-[11px] font-bold tracking-[0.2em] opacity-80" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.4)' }}>INITIATE</div>
            </div>
          </div>

          {/* Center Column: Dispenser */}
          <div className="flex-[2] min-w-[200px] flex flex-col items-center justify-end relative h-full z-10">
            
            {/* Card Animation Area - Extended tall to overlap the board completely */}
            <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[340px] h-[500px] flex justify-center items-end overflow-hidden z-20 pointer-events-none pb-1">
              <AnimatePresence mode="wait">
                {currentCard && (
                  <motion.div 
                    key={currentCard}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%", transition: { duration: 0.2 } }}
                    transition={{ type: "spring", damping: 15, stiffness: 100, duration: 0.8 }}
                    className="w-48 sm:w-64 h-auto min-h-[160px] sm:min-h-[200px] bg-[#fdf5e6] rounded-t border-x-[4px] border-t-[4px] border-[#8b7355] p-4 sm:p-5 flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.6)] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-auto origin-bottom mb-2"
                  >
                    <div className="w-full text-center border-b-2 border-[#8b7355] pb-2 sm:pb-3 mb-3 sm:mb-4">
                       <span className="font-serif font-bold text-[#4a3621] uppercase tracking-widest text-xs sm:text-sm">Zathura</span>
                    </div>
                    <p className="font-serif text-[#3a2818] text-sm sm:text-lg text-center leading-relaxed font-bold">
                      {currentCard}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The Dispenser Slot */}
            <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-3 sm:h-4 bg-[#050505] rounded-full shadow-[inset_0_3px_10px_rgba(0,0,0,1),0_1px_2px_rgba(255,255,255,0.3)] border-t border-[#111] border-b border-[#a0a4ab] z-30"></div>
            
            <div className="absolute bottom-2 sm:bottom-4 text-zinc-800 font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] opacity-80" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.4)' }}>DISPENSER</div>
          </div>

          {/* Right Column: Retro Electronic Password Entry */}
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center pt-8 z-20">
            <div className="bg-[#2c2f33] p-4 sm:p-6 rounded-lg border-t-[4px] border-l-[4px] border-b-[6px] border-r-[6px] border-[#1a1c1f] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_4px_8px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.2)] flex flex-col items-center w-full max-w-[200px]">
              
              {/* Key Icon - acting as an electronic emblem above */}
              <div className="mb-4 bg-[#111] p-2 rounded-full border-2 border-[#1a1c1f] shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
                 <Key className="w-5 h-5 sm:w-6 sm:h-6 text-[#556b2f]" />
              </div>

              {/* Retro Screen Input */}
              <div className="relative w-full rounded border-[4px] border-[#151719] bg-[#0a120a] shadow-[0_2px_0_rgba(255,255,255,0.1)] overflow-hidden">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••" 
                  maxLength={6}
                  className="bg-transparent text-[#33ff33] font-mono text-xl sm:text-2xl p-3 w-full text-center outline-none transition-colors tracking-[0.2em] placeholder:text-[#1a3a1a] relative z-20"
                  style={{ 
                    textShadow: password ? '0 0 8px rgba(51,255,51,0.8)' : 'none',
                    fontFamily: "'Courier New', Courier, monospace" 
                  }}
                />
                {/* Scanline overlay for screen */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.03)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0))] bg-[length:100%_4px] pointer-events-none z-30"></div>
                {/* Inner screen shadow */}
                <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,1)] pointer-events-none z-30"></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
