import React, { useEffect, useState } from 'react';
import './AchievementNotification.scss';
import { useStorage } from '@src/hooks/useStorage';
import achievements from '@src/achievements/achievements.json';
import { Achievement } from '@providers/AchievementProvider';
import Polygon from '../Polygon';

interface AchievementNotificationProps {
  id: string;
  duration?: number;
  onDismiss?: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  id,
  duration = 5000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const image_server = useStorage();

  const fetchAchievement = async (id: string | null) => {
    const achievement = achievements.achievements.find(
      (achievement) => achievement.id === id
    ) as Achievement;

    setAchievement(achievement);
  };

  useEffect(() => {
    fetchAchievement(id);
  }, [id]);

  useEffect(() => {
    const fetchImageUrl = async (image: string | null) => {
      console.log(`getting image url for image "${image}"`);
      if (!image) return 'https://via.placeholder.com/256';

      return await image_server
        .getDownloadURL(`assets/${image}`)
        .catch((err) => {
          console.error(err);
          return 'https://via.placeholder.com/256';
        })
        .then((url) => {
          if (achievement) setImageUrl(url);
        });
    };

    fetchImageUrl(achievement?.image ?? null);
  }, [achievement]);

  useEffect(() => {
    setVisible(true);

    const showTimeout = setTimeout(() => {
      setVisible(false);
    }, duration);

    const dismissTimeout = setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, duration + 500); // Add 500ms for the slide-out transition

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(dismissTimeout);
    };
  }, [duration, onDismiss]);

  return (
    <div
      className={`achievement-notification ${
        visible ? 'achievement-visible' : 'achievement-hidden'
      } fixed bottom-4 right-4 w-80 rounded-lg border border-gray-800 bg-gray-900 p-4`}
    >
      <div className='flex items-center'>
        <div className='mr-4 h-16 w-16 rounded-lg bg-gray-800 p-2'>
          <img
            className='h-full w-full'
            src={imageUrl}
            alt='Achievement icon'
          />
        </div>
        <div>
          <h3 className='text-lg font-bold text-green-500'>
            Achievement Unlocked
          </h3>
          <h4 className='text-xl font-semibold text-white'>
            {achievement?.title}
          </h4>
          <p className='text-sm text-gray-300'>{achievement?.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;

{
  /* <Polygon
  points={[
    [0, 0],
    [0, 100],
    [100, 100],
    [100, 0],
  ]}
  fill='blue'
></Polygon>; */
}
