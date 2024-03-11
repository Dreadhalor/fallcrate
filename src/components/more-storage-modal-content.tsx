import { Spin } from 'antd';
import { useAchievements } from 'dread-ui';
import { useEffect, useRef, useState } from 'react';

export const MoreStorageModalContent = () => {
  const { unlockAchievementById } = useAchievements();

  const loadingMessages = [
    'Entangling qubits',
    'Compressing space-time continuum',
    'Feeding hamsters for power boost',
    'Enabling interdimensional storage',
    'Summoning digital elves',
    'Borrowing storage from parallel universe',
    'Awakening AI overlords',
    'Sourcing bytes from the Matrix',
    'Reaching escape velocity',
    'Achieving light speed download',
    'Cloning unicorn bytes',
    'Reticulating splines',
    'Inflating internet tubes',
    'Resonating with cloud frequencies',
    'Spinning up the flux turbines',
    'Diverting power from warp engines',
    'Unleashing the power of the singularity',
    'Turning it off and on again',
    'Cranking up the sarcasm meter',
    'Flipping the quantum bit',
    'Spooling the hyperspace thread',
    'Deploying swarm of storage nanobots',
    'Calibrating tachyon transmitters',
    'Buffering the buffer',
    'Waiting for the stars to align',
    'Refilling coffee pot for programmers',
    'Deploying photon torpedo storage',
    'Initiating intergalactic handshake',
    'Counting backwards from infinity',
    'Decoding the storage genome',
    'Probing quantum uncertainty',
    'Recruiting data gnomes',
    'Switching to ludicrous speed',
    'Searching for space in the cloud',
    'Taming wild terabytes',
    'Downloading more RAM',
    'Waking up sleeping servers',
    'Mining for extra bytes',
    'Activating alternate reality storage',
    'Bribing the network gremlins',
    'Hitching a ride on a comet',
    'Quantum teleporting data',
    'Inflating the cloud',
    'Shaking the magic 8-ball',
    'Ordering more data from Amazon',
    'Polishing the space-time lens',
    'Uploading to the 5th dimension',
    'Increasing baud rate to infinity',
    'Training carrier pigeons',
    'Baking cookies for the internet',
    'Enlisting pack mules for data transport',
    'Distracting the cyber-squirrels',
    'Dusting off old floppy disks',
    'Consulting the elder tech gods',
    'Shrinking data using a micro-black hole',
    'Asking nicely for more space',
    'Measuring the circumference of the internet',
    'Duplicating the space-time fabric',
    'Reaching peak data density',
    'Gathering cosmic data particles',
    'Initiating data wormhole',
    'Engaging storage replicator',
  ];

  const n = 4;
  const randomMessagesRef = useRef<string[]>(
    loadingMessages.sort(() => Math.random() - Math.random()).slice(0, n),
  );

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (loadingMessageIndex >= n) {
      unlockAchievementById('request_more_storage', 'fallcrate');
      return;
    }
    const timeout = setTimeout(() => {
      setLoadingMessageIndex((prev) => prev + 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [loadingMessageIndex]);

  const loadingContent = (
    <>
      <span className='font-bold'>
        {randomMessagesRef.current[loadingMessageIndex]}
      </span>
      <Spin />
    </>
  );

  return (
    <div className='flex flex-col items-center gap-[25px] p-[20px]'>
      {loadingMessageIndex < n ? loadingContent : 'Lol, no'}
    </div>
  );
};
