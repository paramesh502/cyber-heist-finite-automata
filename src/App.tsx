import { useState } from 'react';
import { GameProvider } from './store/GameContext';
import LandingScreen from './components/screens/LandingScreen';
import MissionSelect from './components/screens/MissionSelect';
import GameScreen from './components/screens/GameScreen';
import JFLAPLab from './components/screens/JFLAPLab';
import HowToPlay from './components/screens/HowToPlay';

type Screen = 'landing' | 'missions' | 'game' | 'jflap' | 'howtoplay' | 'results';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [activeLevel, setActiveLevel] = useState<number>(1);

  const navigate = (s: Screen, levelId?: number) => {
    if (levelId !== undefined) setActiveLevel(levelId);
    setScreen(s);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {screen === 'landing'   && <LandingScreen onNavigate={navigate} />}
      {screen === 'missions'  && <MissionSelect  onNavigate={navigate} />}
      {screen === 'game'      && <GameScreen     levelId={activeLevel} onNavigate={navigate} />}
      {screen === 'jflap'     && <JFLAPLab       onNavigate={navigate} />}
      {screen === 'howtoplay' && <HowToPlay      onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
