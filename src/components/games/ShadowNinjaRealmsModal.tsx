import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudRain,
  Compass,
  Crown,
  Flame,
  Hammer,
  Heart,
  Pause,
  Play,
  Settings,
  Sparkles,
  Sword,
  Volume2,
  X
} from 'lucide-react';
import { ShadowNinjaRealmsAudio } from '../../games/shadowNinjaRealms/AudioEngine';
import { selectRealmsQuestions } from '../../games/shadowNinjaRealms/questionBank';
import {
  MobileRealmsInput,
  ShadowNinjaRealmsCanvas
} from '../../games/shadowNinjaRealms/ShadowNinjaRealmsCanvas';
import {
  AdventureMode,
  GraphicsTier,
  LiveRealmsHud,
  MinecraftBiomeId,
  NINJA_CHARACTERS,
  NinjaCharacterId,
  NinjaRealmId,
  PlacedBlockKind,
  RealmsAnswerOutcome,
  RealmsInventory,
  VOXEL_CHARACTERS,
  VoxelCharacterId,
  WeatherType
} from '../../games/shadowNinjaRealms/types';
import { enterElementFullscreen } from '../../utils/fullscreenGame';
import {
  QuestionProgressionMachine,
  detectRecommendedGraphicsQuality
} from '../../games/ProgressionController';

export interface ShadowNinjaRealmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialSubject?: string;
}

export const ShadowNinjaRealmsModal: React.FC<ShadowNinjaRealmsModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  initialSubject
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<'menu' | 'playing' | 'paused'>('menu');
  const [mode, setMode] = useState<AdventureMode>('shadow_ninja');
  const [graphicsTier, setGraphicsTier] = useState<GraphicsTier>(() => detectRecommendedGraphicsQuality());
  const [levelNum, setLevelNum] = useState(1);
  const progressionRef = useRef(new QuestionProgressionMachine({ questionsPerLevel: 4 }));
  const feedbackTimerRef = useRef<number | null>(null);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [ninjaChar, setNinjaChar] = useState<NinjaCharacterId>('kage_obsidian');
  const [voxelChar, setVoxelChar] = useState<VoxelCharacterId>('builder_steve');
  const [ninjaRealm, setNinjaRealm] = useState<NinjaRealmId>('bamboo_temple');
  const [minecraftBiome, setMinecraftBiome] = useState<MinecraftBiomeId>('emerald_forest');
  const [blockKind, setBlockKind] = useState<PlacedBlockKind>('oak_wood');
  const [musicVol, setMusicVol] = useState(0.45);
  const [sfxVol, setSfxVol] = useState(0.75);
  const [showSettings, setShowSettings] = useState(false);

  const [hp, setHp] = useState(100);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [inventory, setInventory] = useState<RealmsInventory>({
    wood: 0,
    stone: 0,
    crystal: 0,
    scrolls: 0,
    blocksPlaced: 0
  });
  const [feedbackBanner, setFeedbackBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const [quickCastSignal, setQuickCastSignal] = useState<{ index: number; seq: number } | null>(null);
  const [abilitySignal, setAbilitySignal] = useState(0);
  const [buildSignal, setBuildSignal] = useState(0);

  const questions = useMemo(
    () => selectRealmsQuestions(initialSubject, initialTopic),
    [initialSubject, initialTopic]
  );
  const [qIndex, setQIndex] = useState(0);
  const currentQuestion = questions[qIndex % questions.length];

  const [hud, setHud] = useState<LiveRealmsHud>({
    mode: 'shadow_ninja',
    zoneName: 'Sakura Shrine Courtyard',
    weather: 'clear',
    timeOfDayLabel: 'Sunlit Day',
    nearbyPrompt: null,
    targetedShrineIndex: null,
    targetedOptionId: null,
    shrineOptions: [],
    activeEnemiesCount: 3,
    fpsEstimate: 60
  });

  const audioRef = useRef<ShadowNinjaRealmsAudio | null>(null);
  if (!audioRef.current) {
    audioRef.current = new ShadowNinjaRealmsAudio();
  }

  useEffect(() => {
    audioRef.current?.setMusicVolume(musicVol);
  }, [musicVol]);

  useEffect(() => {
    audioRef.current?.setSfxVolume(sfxVol);
  }, [sfxVol]);

  useEffect(() => {
    if (!isOpen) {
      audioRef.current?.stopAmbience();
    }
    return () => {
      audioRef.current?.dispose();
    };
  }, [isOpen]);

  const mobileInputRef = useRef<MobileRealmsInput>({
    moveX: 0,
    moveY: 0,
    jump: false,
    interact: false,
    ability: false,
    buildBlock: false
  });

  const handleAnswerEvaluated = useCallback((outcome: RealmsAnswerOutcome) => {
    const evalResult = progressionRef.current.submitAnswer({
      questionId: outcome.question.id,
      selectedAnswerId: outcome.isCorrect ? outcome.question.correctOptionId : '__wrong__',
      correctAnswerId: outcome.question.correctOptionId,
      basePoints: 120
    });
    if (!evalResult.accepted) return;

    if (outcome.isCorrect) {
      setXp((v) => v + evalResult.pointsAwarded);
      setStreak((s) => s + 1);
      setFeedbackBanner({ ok: true, text: `Correct! ${outcome.question.explanation}` });
    } else {
      setStreak(0);
      setHp((h) => Math.max(10, h - 8));
      setFeedbackBanner({ ok: false, text: `Hint: ${outcome.question.hint}` });
    }

    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      feedbackTimerRef.current = null;
      setFeedbackBanner(null);
      const nextState = progressionRef.current.advance();
      if (nextState === 'LEVEL_COMPLETE') {
        const nextLvl = progressionRef.current.startNextLevel();
        setLevelNum(nextLvl);
        const realmOrder: NinjaRealmId[] = ['bamboo_temple', 'sakura_sanctuary', 'misty_waterfall_peaks'];
        setNinjaRealm((prev) => realmOrder[(realmOrder.indexOf(prev) + 1) % realmOrder.length]);
        const biomeOrder: MinecraftBiomeId[] = ['emerald_forest', 'alpine_snow_peaks', 'desert_oasis'];
        setMinecraftBiome((prev) => biomeOrder[(biomeOrder.indexOf(prev) + 1) % biomeOrder.length]);
      }
      const nextIdx = qIndex + 1;
      const nextQ = questions[nextIdx % questions.length];
      if (nextQ) {
        progressionRef.current.activateQuestion(nextQ.id);
      }
      setQIndex(nextIdx);
    }, 1100);
  }, [qIndex, questions]);

  const handleItemCollected = useCallback((kind: 'wood' | 'stone' | 'crystal' | 'scroll') => {
    setXp((v) => v + 35);
    setInventory((prev) => ({
      ...prev,
      wood: prev.wood + (kind === 'wood' ? 1 : 0),
      stone: prev.stone + (kind === 'stone' ? 1 : 0),
      crystal: prev.crystal + (kind === 'crystal' ? 1 : 0),
      scrolls: prev.scrolls + (kind === 'scroll' ? 1 : 0)
    }));
  }, []);

  const handleBlockPlaced = useCallback(() => {
    setXp((v) => v + 15);
    setInventory((prev) => ({ ...prev, blocksPlaced: prev.blocksPlaced + 1 }));
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#020617',
        color: '#F8FAFC',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden'
      }}
    >
      {phase !== 'menu' && (
        <ShadowNinjaRealmsCanvas
          paused={phase === 'paused'}
          mode={mode}
          graphicsTier={graphicsTier}
          weather={weather}
          ninjaCharacter={ninjaChar}
          voxelCharacter={voxelChar}
          ninjaRealm={ninjaRealm}
          minecraftBiome={minecraftBiome}
          selectedBlockKind={blockKind}
          currentQuestion={currentQuestion}
          audio={audioRef.current}
          quickCastSignal={quickCastSignal}
          abilitySignal={abilitySignal}
          buildSignal={buildSignal}
          mobileInputRef={mobileInputRef}
          onHudUpdate={setHud}
          onAnswerEvaluated={handleAnswerEvaluated}
          onItemCollected={handleItemCollected}
          onBlockPlaced={handleBlockPlaced}
          onEnemyBanished={() => setXp((v) => v + 80)}
          onPlayerHit={(dmg) => setHp((h) => Math.max(0, h - dmg))}
          onPortalSwitch={() => setMode((m) => (m === 'shadow_ninja' ? 'minecraft_realms' : 'shadow_ninja'))}
          onPauseRequested={() => setPhase((p) => (p === 'playing' ? 'paused' : 'playing'))}
        />
      )}

      {phase === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl border border-cyan-400/30 bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> STUDY RUSH 3D — AAA VISUAL MASTERPIECE ENGINE
                </div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                  SHADOW NINJA : MINECRAFT REALMS
                </h1>
                <p className="text-slate-300 text-sm mt-1">
                  Two interconnected 3D worlds — explore ancient temples & waterfalls as a Shadow Ninja, or build & gather in Minecraft Realms.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                aria-label="Close game"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setMode('shadow_ninja')}
                className={`text-left p-4 rounded-2xl border-2 transition ${
                  mode === 'shadow_ninja'
                    ? 'border-cyan-400 bg-cyan-950/50 shadow-lg shadow-cyan-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg mb-1">
                  <Sword className="w-5 h-5" /> MODE A: SHADOW NINJA
                </div>
                <p className="text-xs text-slate-300">
                  Articulated shinobi hero, Pagoda Temple, Torii Gate, Bamboo Grove, Sakura trees, flowing waterfall & arcane abilities.
                </p>
              </button>

              <button
                onClick={() => setMode('minecraft_realms')}
                className={`text-left p-4 rounded-2xl border-2 transition ${
                  mode === 'minecraft_realms'
                    ? 'border-emerald-400 bg-emerald-950/50 shadow-lg shadow-emerald-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-lg mb-1">
                  <Hammer className="w-5 h-5" /> MODE B: MINECRAFT REALMS
                </div>
                <p className="text-xs text-slate-300">
                  Expansive voxel biomes, crystal caves, block villages, resource mining & real-time 3D voxel block building!
                </p>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                <div className="text-xs font-bold uppercase text-slate-400 mb-2">Hero</div>
                {mode === 'shadow_ninja'
                  ? NINJA_CHARACTERS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setNinjaChar(c.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs mb-1.5 ${
                          ninjaChar === c.id ? 'bg-cyan-500/25 border border-cyan-400 text-white' : 'bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold">{c.name}</div>
                      </button>
                    ))
                  : VOXEL_CHARACTERS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setVoxelChar(c.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs mb-1.5 ${
                          voxelChar === c.id ? 'bg-emerald-500/25 border border-emerald-400 text-white' : 'bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold">{c.name}</div>
                      </button>
                    ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                <div className="text-xs font-bold uppercase text-slate-400 mb-2">
                  {mode === 'shadow_ninja' ? 'Ninja Realm' : 'Minecraft Biome'}
                </div>
                {mode === 'shadow_ninja' ? (
                  <div className="space-y-1.5">
                    {(['bamboo_temple', 'sakura_sanctuary', 'misty_waterfall_peaks'] as NinjaRealmId[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setNinjaRealm(r)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold capitalize ${
                          ninjaRealm === r ? 'bg-cyan-500/25 border border-cyan-400 text-white' : 'bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        {r.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {(['emerald_forest', 'alpine_snow_peaks', 'desert_oasis'] as MinecraftBiomeId[]).map((b) => (
                      <button
                        key={b}
                        onClick={() => setMinecraftBiome(b)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold capitalize ${
                          minecraftBiome === b ? 'bg-emerald-500/25 border border-emerald-400 text-white' : 'bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        {b.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1.5">Graphics Tier</div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['low', 'medium', 'high', 'ultra'] as GraphicsTier[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setGraphicsTier(t)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold uppercase ${
                          graphicsTier === t ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1.5">Sky & Weather</div>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value as WeatherType)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="clear">Sunlit Day & Moving Clouds</option>
                    <option value="golden_sunset">Golden Sunset</option>
                    <option value="misty">Misty Valley</option>
                    <option value="rain">Monsoon Rain</option>
                    <option value="starry_night">Starry Night</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Controls: <b>WASD/Arrows</b> Move • <b>Space</b> Jump • <b>Drag Mouse</b> Camera • <b>E</b> Collect/Answer • <b>F</b> Ninja Pulse • <b>B</b> Build Block
              </div>
              <button
                onClick={() => {
                  audioRef.current?.unlock();
                  progressionRef.current.reset(1);
                  setLevelNum(1);
                  if (questions[0]) {
                    progressionRef.current.activateQuestion(questions[0].id);
                  }
                  setPhase('playing');
                  enterElementFullscreen(rootRef.current);
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25"
              >
                <Play className="w-4 h-4 fill-current" /> ENTER 3D REALM (LVL {levelNum})
              </button>
            </div>
          </div>
        </div>
      )}

      {phase !== 'menu' && (
        <>
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
            <div className="flex items-center gap-2.5 pointer-events-auto bg-slate-950/75 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                <Heart className="w-4 h-4 fill-current" /> {hp}
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Crown className="w-4 h-4" /> {xp} XP
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-xs">
                <Compass className="w-4 h-4" /> {hud.zoneName}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-300 text-xs">
                • {hud.timeOfDayLabel} • {hud.fpsEstimate} FPS
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-auto pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-cyan-400/40 rounded-2xl px-4 py-2.5 shadow-xl">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-cyan-300 mb-0.5">
                <span>{currentQuestion.subject} • {currentQuestion.topic}</span>
                <span>Streak {streak}🔥</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white mb-2">
                {currentQuestion.question}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => setQuickCastSignal({ index: idx, seq: Date.now() })}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold text-left truncate border transition ${
                      hud.targetedShrineIndex === idx
                        ? 'bg-amber-500/30 border-amber-400 text-amber-100'
                        : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-cyan-400'
                    }`}
                  >
                    <span className="font-black text-cyan-300 mr-1">{idx + 1}.</span>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => {
                  const list: WeatherType[] = ['clear', 'golden_sunset', 'misty', 'rain', 'starry_night'];
                  setWeather((w) => list[(list.indexOf(w) + 1) % list.length]);
                }}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-cyan-300"
                title="Cycle Weather & Sky"
              >
                <CloudRain className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings((s) => !s)}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-slate-200"
                title="Audio & Graphics Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPhase((p) => (p === 'playing' ? 'paused' : 'playing'))}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-slate-200"
                title="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 text-rose-200"
                title="Exit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {feedbackBanner && (
            <div
              className={`absolute top-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg border ${
                feedbackBanner.ok
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                  : 'bg-amber-950/90 border-amber-400 text-amber-200'
              }`}
            >
              {feedbackBanner.text}
            </div>
          )}

          {/* Mission Objectives & Level Tracker */}
          <div className="hidden md:block absolute top-20 left-3 w-64 bg-slate-950/75 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3 text-xs pointer-events-none">
            <div className="flex items-center justify-between font-bold text-cyan-300 mb-1.5">
              <span>Level {Math.floor(xp / 250) + 1} Explorer</span>
              <span className="text-amber-300">{xp % 250}/250 XP</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div>• {mode === 'shadow_ninja' ? 'Collect Scrolls/Crystals' : 'Gather Wood/Stone/Crystals'}: {inventory.scrolls + inventory.crystal + inventory.wood + inventory.stone}/3</div>
              <div>• Answer Knowledge Shrines: {streak > 0 ? `${streak} Streak` : 'Approach & Press [E]'}</div>
              <div>• {mode === 'minecraft_realms' ? `Build Voxel Blocks [B]: ${inventory.blocksPlaced}/3` : 'Use Realm Portal (-13, 9) to switch worlds'}</div>
            </div>
          </div>

          {hud.nearbyPrompt && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400/50 text-cyan-200 text-xs font-bold">
              {hud.nearbyPrompt}
            </div>
          )}

          {/* Mobile Virtual Joystick */}
          <div
            className="md:hidden absolute bottom-16 left-4 w-24 h-24 rounded-full bg-slate-900/70 border-2 border-cyan-400/40 flex items-center justify-center touch-none"
            onTouchMove={(e) => {
              const t = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const dx = (t.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
              const dy = (t.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
              mobileInputRef.current.moveX = Math.max(-1, Math.min(1, dx));
              mobileInputRef.current.moveY = Math.max(-1, Math.min(1, dy));
            }}
            onTouchEnd={() => {
              mobileInputRef.current.moveX = 0;
              mobileInputRef.current.moveY = 0;
            }}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-400/75 shadow-lg" />
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
            <div className="pointer-events-auto bg-slate-950/75 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3.5 py-2 flex items-center gap-3 text-xs">
              <span>🪵 {inventory.wood}</span>
              <span>🪨 {inventory.stone}</span>
              <span>💎 {inventory.crystal}</span>
              <span>📜 {inventory.scrolls}</span>
              {mode === 'minecraft_realms' && <span>🧱 {inventory.blocksPlaced}</span>}
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              {mode === 'minecraft_realms' && (
                <>
                  <select
                    value={blockKind}
                    onChange={(e) => setBlockKind(e.target.value as PlacedBlockKind)}
                    className="rounded-xl bg-slate-950/85 border border-emerald-400/50 px-2.5 py-2 text-xs text-white"
                  >
                    <option value="oak_wood">Oak Block</option>
                    <option value="stone_brick">Stone Brick</option>
                    <option value="glow_crystal">Glow Crystal</option>
                    <option value="sakura_plank">Sakura Plank</option>
                  </select>
                  <button
                    onClick={() => setBuildSignal((s) => s + 1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    <Hammer className="w-3.5 h-3.5" /> Place [B]
                  </button>
                </>
              )}
              <button
                onClick={() => setAbilitySignal((s) => s + 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                <Flame className="w-3.5 h-3.5" /> Arcane Pulse [F]
              </button>
              <button
                onClick={() => {
                  mobileInputRef.current.interact = true;
                }}
                className="md:hidden px-3 py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs"
              >
                Use [E]
              </button>
              <button
                onClick={() => {
                  mobileInputRef.current.jump = true;
                }}
                className="md:hidden px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Jump
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="absolute top-16 right-4 w-72 rounded-2xl bg-slate-900/95 border border-slate-700 p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4" /> Audio & Graphics</span>
                <button onClick={() => setShowSettings(false)}><X className="w-4 h-4" /></button>
              </div>
              <label className="block text-xs text-slate-300">
                Music Volume ({Math.round(musicVol * 100)}%)
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVol}
                  onChange={(e) => setMusicVol(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </label>
              <label className="block text-xs text-slate-300">
                SFX Volume ({Math.round(sfxVol * 100)}%)
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={sfxVol}
                  onChange={(e) => setSfxVol(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </label>
              <div>
                <div className="text-xs text-slate-300 mb-1">Graphics Tier</div>
                <div className="grid grid-cols-4 gap-1">
                  {(['low', 'medium', 'high', 'ultra'] as GraphicsTier[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setGraphicsTier(t)}
                      className={`py-1 rounded text-[10px] font-bold uppercase ${
                        graphicsTier === t ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === 'paused' && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-center space-y-3">
                <h2 className="text-xl font-black text-white">Game Paused</h2>
                <button
                  onClick={() => setPhase('playing')}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm"
                >
                  Resume Adventure
                </button>
                <button
                  onClick={() => setPhase('menu')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm"
                >
                  Switch Mode / Character
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-rose-950/80 text-rose-200 font-semibold text-sm"
                >
                  Exit to STUDYAI
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
