import React from 'react';
import { FirebaseProvider } from '@providers/FirebaseProvider';
import { FilesystemProvider } from '@providers/FilesystemProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { AchievementProvider } from './AchievementProvider';

type Props = {
  children: React.ReactNode;
};

import achievements from '@src/achievements/achievements.json';
import { MilestoneProvider } from 'milestone-components';

export const FallcrateProviders: React.FC<Props> = ({ children }) => {
  return (
    <FirebaseProvider>
      <MilestoneProvider>
        {/* <AchievementProvider initialAchievements={achievements.achievements}> */}
        <FilesystemProvider>
          <DndProvider backend={HTML5Backend}>
            <>{children}</>
          </DndProvider>
        </FilesystemProvider>
        {/* </AchievementProvider> */}
      </MilestoneProvider>
    </FirebaseProvider>
  );
};
