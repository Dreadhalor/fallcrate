import React, { useState, useEffect } from 'react';
import './AchievementsScreen.scss';
import { Achievement } from '@providers/AchievementProvider';
import { useStorage } from '@src/hooks/useStorage';

interface AchievementsScreenProps {
  achievements: Achievement[];
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  achievements,
}) => {
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const image_server = useStorage();

  const getImageUrl = async (image: string | null) => {
    return image_server.getDownloadURL(`assets/${image}`).catch((err) => {
      console.error(err);
      return 'https://via.placeholder.com/256';
    });
  };

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls = await Promise.all(
        achievements.map((achievement) => getImageUrl(achievement.image))
      );
      setImageUrls(urls);
    };

    fetchImageUrls();
  }, [achievements]);

  useEffect(() => {
    console.log(imageUrls);
  }, [imageUrls]);

  const handleClick = (achievement: Achievement) => {
    if (achievement.unlocked) {
      setSelectedAchievement(achievement);
    }
  };

  return (
    <div className='achievements-screen'>
      <div className='achievements-grid'>
        {achievements.map((achievement, index) => (
          <div
            key={achievement.id}
            className={`h-[100px] w-[100px] 
             ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            style={{
              border: '1px solid #ccc',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => handleClick(achievement)}
          >
            <img
              src={achievement.unlocked ? imageUrls[index] : ''}
              alt={achievement.title}
            />
          </div>
        ))}
      </div>
      {selectedAchievement && (
        <div className='achievement-description'>
          <h4>{selectedAchievement.title}</h4>
          <p>{selectedAchievement.description}</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsScreen;
