import AchievementNotification from '@components/utilities/AchievementNotification/AchievementNotification';
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  image: string | null;
}

interface AchievementContextProps {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
}

const AchievementContext = createContext<AchievementContextProps>({
  achievements: [],
  unlockAchievement: () => {},
});

export const useAchievements = () => useContext(AchievementContext);

interface AchievementProviderProps {
  children: React.ReactNode;
  initialAchievements: Achievement[];
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  children,
  initialAchievements,
}) => {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [activeNotification, setActiveNotification] =
    useState<Achievement | null>(null);

  const unlockAchievement = useCallback(
    (id: string) => {
      console.log(`unlocking achievement with id "${id}"`);
      const achievement = achievements.find((a) => a.id === id);
      console.log(`achievement: ${JSON.stringify(achievement)}`);

      if (!achievement) {
        console.warn(`Achievement with id "${id}" not found.`);
        return;
      }

      //if (!achievement.unlocked) {
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a))
      );
      setActiveNotification(achievement);
      //}
    },
    [achievements]
  );

  const handleNotificationDismiss = () => {
    setActiveNotification(null);
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        unlockAchievement,
      }}
    >
      {children}
      {activeNotification && (
        <AchievementNotification
          id={activeNotification.id}
          onDismiss={handleNotificationDismiss}
        />
      )}
    </AchievementContext.Provider>
  );
};
