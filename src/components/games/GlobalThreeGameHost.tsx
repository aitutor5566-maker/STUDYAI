import React from 'react';
import { useLearning } from '../../context/LearningContext';
import { WarOfWordsModal } from './WarOfWordsModal';
import { StudyRush3DModal } from './StudyRush3DModal';
import { KatanaGameModal } from './KatanaGameModal';

export const GlobalThreeGameHost: React.FC = () => {
  const { activeAuthorisedGame, closeAuthorisedGame } = useLearning();

  if (!activeAuthorisedGame) return null;

  return (
    <>
      {activeAuthorisedGame.gameId === 'war_of_words' && (
        <WarOfWordsModal
          isOpen={true}
          onClose={closeAuthorisedGame}
          initialTopic={activeAuthorisedGame.topic}
          initialLanguage={activeAuthorisedGame.language}
          learningObjective={activeAuthorisedGame.learningObjective}
          difficulty={activeAuthorisedGame.difficulty}
        />
      )}
      {activeAuthorisedGame.gameId === 'study_rush_3d' && (
        <StudyRush3DModal
          isOpen={true}
          onClose={closeAuthorisedGame}
          initialTopic={activeAuthorisedGame.topic}
          initialSubject={activeAuthorisedGame.subject}
          difficulty={activeAuthorisedGame.difficulty}
        />
      )}
      {activeAuthorisedGame.gameId === 'katana_wisdom' && (
        <KatanaGameModal
          isOpen={true}
          onClose={closeAuthorisedGame}
          topic={activeAuthorisedGame.topic || 'Photosynthesis'}
          subject={activeAuthorisedGame.subject}
          difficulty={activeAuthorisedGame.difficulty}
        />
      )}
    </>
  );
};
