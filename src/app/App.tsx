import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Crosshair, Rocket, Shield, Stars } from 'lucide-react';

import boardImage from '../assets/25780483ac4f5733fac21e26ea45819896520696.png';

type BoardPoint = {
  left: number;
  top: number;
  angle: number;
  scale?: number;
};

type CardEffect =
  | { type: 'move'; steps: number }
  | { type: 'skip'; turns: number }
  | { type: 'extraTurn' }
  | { type: 'shield' }
  | { type: 'none' };

type GameCard = {
  title: string;
  description: string;
  effect: CardEffect;
};

type Player = {
  id: number;
  name: string;
  position: number;
  skipTurns: number;
  shield: boolean;
};

const BOARD_PATH: BoardPoint[] = [
  { left: 98.2, top: 88.8, angle: -98, scale: 0.92 },
  { left: 96.3, top: 76.5, angle: -98, scale: 0.92 },
  { left: 94.2, top: 64.3, angle: -108, scale: 0.94 },
  { left: 90.6, top: 56.1, angle: -142, scale: 0.96 },
  { left: 84.7, top: 53.1, angle: -160, scale: 0.98 },
  { left: 79.4, top: 51.1, angle: -164, scale: 0.98 },
  { left: 74.1, top: 49.1, angle: -162, scale: 0.99 },
  { left: 68.3, top: 53.4, angle: 176, scale: 1 },
  { left: 62.8, top: 60.2, angle: 176, scale: 1 },
  { left: 55.6, top: 60.3, angle: 178, scale: 1 },
  { left: 47.8, top: 60.3, angle: 178, scale: 1 },
  { left: 40.1, top: 60.2, angle: -168, scale: 1 },
  { left: 33.7, top: 65.4, angle: -150, scale: 0.99 },
  { left: 26.8, top: 71.2, angle: -146, scale: 0.98 },
  { left: 19.6, top: 77.3, angle: -146, scale: 0.96 },
  { left: 12.6, top: 83.7, angle: -122, scale: 0.94 },
  { left: 8.4, top: 73.8, angle: -88, scale: 0.94 },
  { left: 7.4, top: 61.3, angle: -88, scale: 0.94 },
  { left: 9.4, top: 49.3, angle: -66, scale: 0.94 },
  { left: 15.9, top: 43.6, angle: -18, scale: 0.96 },
  { left: 23.4, top: 42.7, angle: -2, scale: 0.97 },
  { left: 29.3, top: 42.9, angle: 8, scale: 0.98 },
  { left: 35.2, top: 45.1, angle: 22, scale: 0.99 },
  { left: 42.3, top: 49.8, angle: 8, scale: 1 },
  { left: 49.4, top: 48.8, angle: -18, scale: 1 },
  { left: 55.3, top: 41.8, angle: -52, scale: 1 },
  { left: 60.2, top: 33.4, angle: -58, scale: 1 },
  { left: 65.1, top: 24.4, angle: -58, scale: 1 },
  { left: 70.4, top: 15.8, angle: -34, scale: 1 },
  { left: 78.3, top: 9.2, angle: 4, scale: 1 },
  { left: 87.5, top: 10.4, angle: 36, scale: 1 },
  { left: 93.1, top: 19.3, angle: 80, scale: 1 },
  { left: 94.1, top: 31.1, angle: 98, scale: 1 },
  { left: 90.9, top: 41.5, angle: 132, scale: 1 },
  { left: 83.6, top: 44.4, angle: 168, scale: 1 },
  { left: 75.7, top: 42.3, angle: -156, scale: 1 },
  { left: 68.6, top: 38.4, angle: -152, scale: 1 },
  { left: 61.1, top: 34.3, angle: -152, scale: 1 },
  { left: 53.8, top: 29.9, angle: -152, scale: 1 },
  { left: 46.4, top: 25.6, angle: -152, scale: 0.99 },
  { left: 39.1, top: 21.4, angle: -154, scale: 0.98 },
  { left: 31.8, top: 17.3, angle: -160, scale: 0.97 },
  { left: 23.6, top: 12.7, angle: 176, scale: 0.96 },
  { left: 15.6, top: 10.9, angle: 176, scale: 0.95 },
  { left: 9.1, top: 12.1, angle: 156, scale: 0.94 },
  { left: 5.4, top: 20.4, angle: 108, scale: 0.93 },
];

const FINAL_APPROACH: BoardPoint[] = [
  { left: 8.2, top: 18.3, angle: 50, scale: 0.92 },
  { left: 11.4, top: 17.1, angle: 18, scale: 0.9 },
  { left: 15.2, top: 17.8, angle: -12, scale: 0.88 },
  { left: 18.5, top: 20.1, angle: -38, scale: 0.84 },
  { left: 18.8, top: 24.4, angle: -76, scale: 0.78 },
  { left: 16.9, top: 27.7, angle: -116, scale: 0.72 },
];

const CARD_DECK: GameCard[] = [
  {
    title: 'Meteor Shower',
    description: 'Thrusters flare and the ship surges ahead through the debris.',
    effect: { type: 'move', steps: 2 },
  },
  {
    title: 'Gravity Well',
    description: 'A dark pull drags the crew backward through open space.',
    effect: { type: 'move', steps: -2 },
  },
  {
    title: 'Zorgon Ambush',
    description: 'Incoming fire forces the pilot to lose the next turn.',
    effect: { type: 'skip', turns: 1 },
  },
  {
    title: 'Robot Repair',
    description: 'A repair bot boosts the engines and grants another turn.',
    effect: { type: 'extraTurn' },
  },
  {
    title: 'Defense Shields',
    description: 'A glowing shield blocks the next harmful card effect.',
    effect: { type: 'shield' },
  },
  {
    title: 'Wormhole',
    description: 'The board folds space and launches the ship ahead three spaces.',
    effect: { type: 'move', steps: 3 },
  },
  {
    title: 'Drifting Debris',
    description: 'The crew slips slightly off course but regains control.',
    effect: { type: 'move', steps: -1 },
  },
  {
    title: 'Silent Sector',
    description: 'No hazard this round. Maintain heading.',
    effect: { type: 'none' },
  },
];

const createInitialPlayers = (): Player[] => [
  {
    id: 1,
    name: 'Scout Ship',
    position: 0,
    skipTurns: 0,
    shield: false,
  },
];

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const clampPosition = (value: number) => Math.max(0, Math.min(BOARD_PATH.length - 1, value));

const getCardSummary = (effect: CardEffect) => {
  switch (effect.type) {
    case 'move':
      return effect.steps > 0 ? `Move forward ${effect.steps}` : `Move back ${Math.abs(effect.steps)}`;
    case 'skip':
      return `Lose ${effect.turns} turn`;
    case 'extraTurn':
      return 'Take another turn';
    case 'shield':
      return 'Gain shield';
    case 'none':
      return 'No effect';
  }
};

const getPlayerCoords = (player: Player) => {
  const point = BOARD_PATH[player.position];

  return {
    left: `${point.left}%`,
    top: `${point.top}%`,
    scale: point.scale ?? 1,
  };
};

function RocketPawn({ shield }: { shield: boolean }) {
  return (
    <div className="relative h-[42px] w-[96px] sm:h-[52px] sm:w-[120px]">
      <svg
        viewBox="0 0 240 110"
        className="h-full w-full drop-shadow-[0_5px_10px_rgba(0,0,0,0.55)]"
        aria-hidden="true"
      >
        <path
          d="M12 56 C34 24, 88 10, 153 15 L220 8 C231 7, 236 11, 236 17 C236 23, 232 27, 220 28 L188 31 L216 43 C227 48, 230 53, 228 58 C226 64, 219 66, 209 63 L175 54 L190 84 C193 91, 188 98, 179 97 L152 93 C106 92, 57 85, 19 68 C8 63, 5 61, 12 56 Z"
          fill="#d71f28"
          stroke="#25161a"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M70 29 C100 20, 129 19, 168 24 L173 74 C129 77, 101 77, 61 69 C61 56, 64 43, 70 29 Z"
          fill="#d9e6fb"
          stroke="#25161a"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M72 60 C96 51, 122 47, 170 48"
          fill="none"
          stroke="#6d6c74"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M74 59 C83 46, 92 43, 102 48"
          fill="none"
          stroke="#5b5961"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M101 56 C110 41, 122 38, 134 46"
          fill="none"
          stroke="#5b5961"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M130 54 C139 42, 148 40, 159 46"
          fill="none"
          stroke="#5b5961"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M52 24 C66 7, 95 2, 116 16 C103 16, 92 18, 77 21 C69 23, 60 25, 52 24 Z"
          fill="#cfd4de"
          stroke="#25161a"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <ellipse cx="79" cy="17" rx="12" ry="7" fill="#2b252d" opacity="0.88" />
        <path d="M177 32 L207 17 L193 39 Z" fill="#d71f28" stroke="#25161a" strokeWidth="3.5" />
        <path d="M176 72 L207 89 L190 68 Z" fill="#d71f28" stroke="#25161a" strokeWidth="3.5" />
        <path d="M210 35 L230 30 L232 56 L208 58 Z" fill="#312c35" stroke="#25161a" strokeWidth="3.5" />
      </svg>
      {shield && (
        <Shield className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-slate-950/90 p-[3px] text-cyan-200" />
      )}
    </div>
  );
}

export default function App() {
  const [players, setPlayers] = useState(createInitialPlayers);
  const [isRolling, setIsRolling] = useState(false);
  const [isResolvingTurn, setIsResolvingTurn] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [turnMessage, setTurnMessage] = useState('Press GO to launch the first ship.');
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [finaleStep, setFinaleStep] = useState<number | null>(null);
  const [isBlackout, setIsBlackout] = useState(false);

  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playersRef = useRef(players);

  const activePlayer = players[0];

  const runFinalSequence = async () => {
    setIsResolvingTurn(true);
    setCurrentCard(null);
    setTurnMessage('Zathura reached. Entering the final spiral...');

    for (let step = 0; step < FINAL_APPROACH.length; step += 1) {
      setFinaleStep(step);
      await sleep(520);
    }

    setTurnMessage('The ship disappears into the Zathura core.');
    setWinnerId(playersRef.current[0].id);
    await sleep(350);
    setIsBlackout(true);
    setIsResolvingTurn(false);
  };

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
    };
  }, []);

  const updatePlayer = (playerIndex: number, updater: (player: Player) => Player) => {
    setPlayers((previous) =>
      previous.map((player, index) => (index === playerIndex ? updater(player) : player)),
    );
  };

  const movePlayer = async (playerIndex: number, steps: number) => {
    if (steps === 0) {
      return;
    }

    const direction = steps > 0 ? 1 : -1;

    for (let traveled = 0; traveled < Math.abs(steps); traveled += 1) {
      let reachedEnd = false;

      setPlayers((previous) =>
        previous.map((player, index) => {
          if (index !== playerIndex) {
            return player;
          }

          const nextPosition = clampPosition(player.position + direction);

          if (nextPosition === BOARD_PATH.length - 1) {
            reachedEnd = true;
          }

          return {
            ...player,
            position: nextPosition,
          };
        }),
      );

      await sleep(240);

      if (reachedEnd) {
        return;
      }
    }
  };

  const runCardEffect = async (playerIndex: number, card: GameCard) => {
    let samePlayerAgain = false;

    switch (card.effect.type) {
      case 'move': {
        const harmful = card.effect.steps < 0;
        const player = playersRef.current[playerIndex];

        if (harmful && player.shield) {
          updatePlayer(playerIndex, (pilot) => ({ ...pilot, shield: false }));
          setTurnMessage(`${player.name} blocked ${card.title} with the shield.`);
          return samePlayerAgain;
        }

        if (harmful) {
          setTurnMessage(`${player.name} was pushed backward ${Math.abs(card.effect.steps)} spaces.`);
        } else {
          setTurnMessage(`${player.name} surged ahead ${card.effect.steps} spaces.`);
        }

        await movePlayer(playerIndex, card.effect.steps);
        return samePlayerAgain;
      }

      case 'skip': {
        const player = playersRef.current[playerIndex];

        if (player.shield) {
          updatePlayer(playerIndex, (pilot) => ({ ...pilot, shield: false }));
          setTurnMessage(`${player.name} blocked the turn loss with the shield.`);
          return samePlayerAgain;
        }

        updatePlayer(playerIndex, (pilot) => ({
          ...pilot,
          skipTurns: pilot.skipTurns + card.effect.turns,
        }));
        setTurnMessage(`${player.name} will miss the next turn.`);
        return samePlayerAgain;
      }

      case 'extraTurn':
        samePlayerAgain = true;
        setTurnMessage(`${playersRef.current[playerIndex].name} gets another launch immediately.`);
        return samePlayerAgain;

      case 'shield':
        updatePlayer(playerIndex, (pilot) => ({ ...pilot, shield: true }));
        setTurnMessage(`${playersRef.current[playerIndex].name} is now protected by a shield.`);
        return samePlayerAgain;

      case 'none':
        setTurnMessage(`${playersRef.current[playerIndex].name} holds course with no extra effect.`);
        return samePlayerAgain;
    }
  };

  const handleGoPress = async () => {
    if (isRolling || isResolvingTurn || winnerId !== null || isBlackout) {
      return;
    }

    const player = playersRef.current[0];

    if (player.skipTurns > 0) {
      updatePlayer(0, (pilot) => ({
        ...pilot,
        skipTurns: Math.max(0, pilot.skipTurns - 1),
      }));
      setCurrentCard(null);
      setDisplayNumber(null);
      setTurnMessage(`${player.name} is stalled this round. Recharge and try again.`);
      return;
    }

    setIsResolvingTurn(true);
    setIsRolling(true);
    setCurrentCard(null);
    setFinaleStep(null);
    setTurnMessage(`${player.name} is rolling for launch distance...`);

    let ticks = 0;
    const maxTicks = 14;

    const finalNumber = await new Promise<number>((resolve) => {
      rollIntervalRef.current = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 6) + 1);
        ticks += 1;

        if (ticks >= maxTicks) {
          if (rollIntervalRef.current) {
            clearInterval(rollIntervalRef.current);
          }

          const roll = Math.floor(Math.random() * 6) + 1;
          setDisplayNumber(roll);
          resolve(roll);
        }
      }, 90);
    });

    setIsRolling(false);
    setTurnMessage(`${player.name} rolled a ${finalNumber}.`);

    await sleep(250);
    await movePlayer(0, finalNumber);

    const movedPlayer = playersRef.current[0];
    if (movedPlayer.position >= BOARD_PATH.length - 1) {
      await runFinalSequence();
      return;
    }

    const card = CARD_DECK[Math.floor(Math.random() * CARD_DECK.length)];
    setCurrentCard(card);

    await sleep(450);

    await runCardEffect(0, card);

    if (playersRef.current[0].position >= BOARD_PATH.length - 1) {
      await runFinalSequence();
      return;
    }

    setIsResolvingTurn(false);
  };

  const handleReset = () => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
    }

    setPlayers(createInitialPlayers());
    setIsRolling(false);
    setIsResolvingTurn(false);
    setDisplayNumber(null);
    setCurrentCard(null);
    setTurnMessage('Board reset. Press GO to launch the first ship.');
    setWinnerId(null);
    setFinaleStep(null);
    setIsBlackout(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050b14] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <div className="relative flex flex-1 items-center justify-center rounded-[32px] border border-amber-300/20 bg-[radial-gradient(circle_at_top,rgba(250,235,162,0.25),transparent_30%),radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_45%)] p-4 shadow-[0_0_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.12),transparent_30%)]" />
          <div className="relative w-full max-w-6xl">
            <div className="pointer-events-none absolute -left-2 top-6 rounded-full border border-cyan-300/40 bg-slate-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.3)] sm:left-4 sm:text-xs">
              Launch
            </div>
            <div className="pointer-events-none absolute right-0 top-6 rounded-full border border-amber-200/40 bg-slate-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-100 shadow-[0_0_24px_rgba(250,204,21,0.25)] sm:right-6 sm:text-xs">
              Zathura
            </div>

            <div className="relative overflow-hidden rounded-[28px] border-[6px] border-amber-900/40 shadow-[0_0_50px_rgba(0,0,0,0.75)]">
              <img
                src={boardImage}
                alt="Zathura board"
                className="block w-full rounded-[20px] object-contain"
              />

              <div className="absolute inset-0">
                {players.map((player) => {
                  const coords =
                    finaleStep === null
                      ? getPlayerCoords(player)
                      : {
                          left: `${FINAL_APPROACH[finaleStep].left}%`,
                          top: `${FINAL_APPROACH[finaleStep].top}%`,
                          scale: FINAL_APPROACH[finaleStep].scale ?? 1,
                        };

                  return (
                    <motion.div
                      key={player.id}
                      animate={coords}
                      transition={{ duration: finaleStep === null ? 0.22 : 0.5, ease: 'linear' }}
                      className="absolute z-20"
                      style={{ x: '-50%', y: '-50%' }}
                    >
                      <RocketPawn shield={player.shield} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex w-full justify-center">
          <div className="relative flex w-full max-w-7xl flex-col gap-5 rounded-[38px] border-x-[8px] border-t-[12px] border-[#6b707a] bg-[#8c929c] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] px-4 pb-6 pt-6 shadow-[inset_0_30px_50px_rgba(0,0,0,0.45),inset_0_2px_5px_rgba(255,255,255,0.45),0_-10px_50px_rgba(0,0,0,0.75)] sm:px-6 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="absolute left-6 top-4 h-4 w-4 rounded-full border border-[#5a5f68] bg-[#8c929c] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.6)]" />
            <div className="absolute right-6 top-4 h-4 w-4 rounded-full border border-[#5a5f68] bg-[#8c929c] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.6)]" />

            <div className="flex min-w-[180px] flex-1 flex-col items-center justify-center gap-5 pt-2">
              <div className="relative flex h-32 w-28 items-center justify-center overflow-hidden rounded-xl border-[6px] border-[#3a3d42] bg-[#111] shadow-[inset_0_0_20px_rgba(0,0,0,1),0_2px_5px_rgba(255,255,255,0.3)] sm:h-36 sm:w-32">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.05)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0))] bg-[length:100%_4px]" />
                <span
                  className={`relative z-10 font-mono text-6xl font-black ${
                    displayNumber === null ? 'text-[#2a2a2a]' : 'text-[#ff3b30]'
                  }`}
                  style={{
                    textShadow:
                      displayNumber === null ? 'none' : '0 0 10px rgba(255,59,48,0.95), 0 0 22px rgba(255,59,48,0.5)',
                  }}
                >
                  {displayNumber ?? '-'}
                </span>
              </div>

              <div className="text-center">
                <div className="font-mono text-[11px] font-bold tracking-[0.35em] text-zinc-800 opacity-85">
                  ROLL NUMBER
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700">
                  {isBlackout ? 'Signal Lost' : winnerId ? 'Mission Complete' : `${activePlayer.name} on course`}
                </div>
              </div>

              <div className="relative flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#3a3d42] bg-[#4a4d54] shadow-[inset_0_4px_10px_rgba(0,0,0,0.8),0_2px_5px_rgba(255,255,255,0.3)]">
                  <button
                    type="button"
                    onClick={handleGoPress}
                    disabled={isRolling || isResolvingTurn || winnerId !== null || isBlackout}
                    className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-black tracking-[0.2em] text-white transition-all duration-150 ${
                      isRolling || isResolvingTurn || winnerId !== null || isBlackout
                        ? 'translate-y-1 cursor-not-allowed border-b-0 bg-red-800 shadow-inner'
                        : 'border-b-[6px] border-[#8a1c1c] bg-[#cc2929] shadow-[0_6px_10px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(255,255,255,0.3)] hover:bg-[#e62e2e] active:translate-y-1 active:border-b-0 active:shadow-inner'
                    }`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}
                  >
                    GO
                  </button>
                </div>
                <div className="mt-3 font-mono text-[11px] font-bold tracking-[0.35em] text-zinc-800 opacity-80">
                  INITIATE
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-zinc-700 bg-zinc-900/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-zinc-100 transition hover:bg-zinc-800"
              >
                Reset Game
              </button>
            </div>

            <div className="relative flex flex-[1.4] flex-col items-center justify-end overflow-hidden rounded-[28px] border border-black/20 bg-[#767d88]/40 px-3 pb-3 pt-10">
              <div className="pointer-events-none absolute top-4 flex items-center gap-2 rounded-full border border-amber-100/30 bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-100">
                <Stars className="h-3.5 w-3.5" />
                Card Dispenser
              </div>

              <div className="absolute bottom-4 left-1/2 z-20 h-4 w-[85%] max-w-[360px] -translate-x-1/2 rounded-full border-b border-[#a0a4ab] border-t border-[#111] bg-[#050505] shadow-[inset_0_3px_10px_rgba(0,0,0,1),0_1px_2px_rgba(255,255,255,0.3)]" />

              <div className="relative flex h-[250px] w-full items-end justify-center overflow-hidden pb-5 sm:h-[290px]">
                <AnimatePresence mode="wait">
                  {currentCard ? (
                    <motion.div
                      key={currentCard.title}
                      initial={{ y: '110%', rotateX: -30 }}
                      animate={{ y: '0%', rotateX: 0 }}
                      exit={{ y: '110%', transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', damping: 16, stiffness: 110 }}
                      className="relative z-10 flex min-h-[190px] w-[220px] origin-bottom flex-col rounded-t-2xl border-x-4 border-t-4 border-[#8b7355] bg-[#fdf5e6] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] p-5 text-[#3a2818] shadow-[0_-10px_30px_rgba(0,0,0,0.55)] sm:w-[280px]"
                    >
                      <div className="border-b-2 border-[#8b7355] pb-3 text-center">
                        <div className="font-serif text-sm font-bold uppercase tracking-[0.35em] text-[#4a3621]">
                          Zathura
                        </div>
                        <div className="mt-2 text-xl font-black">{currentCard.title}</div>
                      </div>
                      <p className="mt-4 flex-1 text-center font-serif text-base leading-relaxed sm:text-lg">
                        {currentCard.description}
                      </p>
                      <div className="mt-4 rounded-full border border-[#8b7355] px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.25em] text-[#5b4329]">
                        {getCardSummary(currentCard.effect)}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="mb-5 rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.22em] text-zinc-300">
                      Roll to dispense a card
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex min-w-[220px] flex-1 flex-col gap-4">
              <div className="rounded-[24px] border-[5px] border-[#1a1c1f] bg-[#2c2f33] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_4px_8px_rgba(0,0,0,0.45),0_1px_2px_rgba(255,255,255,0.2)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full border-2 border-[#1a1c1f] bg-[#111] p-2 shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
                    <Crosshair className="h-5 w-5 text-[#7dd3fc]" />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-400">
                      Flight Status
                    </div>
                    <div className="text-sm font-semibold text-zinc-100">
                      {isBlackout ? 'Visual feed terminated' : winnerId ? 'Winning ship locked in' : 'Single ship run'}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border-[4px] border-[#151719] bg-[#0a120a] p-3 shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
                  <div className="font-mono text-sm leading-relaxed tracking-[0.12em] text-[#5af78e] [text-shadow:0_0_8px_rgba(90,247,142,0.5)]">
                    {turnMessage}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border-[5px] border-[#1a1c1f] bg-[#2c2f33] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_4px_8px_rgba(0,0,0,0.45),0_1px_2px_rgba(255,255,255,0.2)]">
                <div className="mb-3 flex items-center gap-2 text-zinc-100">
                  <Rocket className="h-5 w-5 text-amber-200" />
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-400">
                    Crew Positions
                  </div>
                </div>

                <div className="space-y-3">
                  {players.map((player) => {
                    return (
                      <div
                        key={player.id}
                        className="rounded-2xl border border-amber-200/50 bg-amber-100/10 px-4 py-3 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-16 items-center justify-center">
                              <RocketPawn shield={false} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-zinc-100">{player.name}</div>
                              <div className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                                Space {player.position + 1} / {BOARD_PATH.length}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs uppercase tracking-[0.22em] text-zinc-400">
                            {player.shield ? 'Shield Up' : 'Open Hull'}
                          </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
                          <motion.div
                            animate={{ width: `${(player.position / (BOARD_PATH.length - 1)) * 100}%` }}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #d71f28, #f97316)' }}
                          />
                        </div>

                        <div className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {player.skipTurns > 0 ? `Skipping ${player.skipTurns} turn` : 'Ready for launch'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBlackout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-black"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
