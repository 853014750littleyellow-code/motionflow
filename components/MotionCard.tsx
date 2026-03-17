'use client';

import { useState, useRef, useEffect } from 'react';
import { Motion } from '@/lib/supabase';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import { Play, Pause } from 'lucide-react';

interface MotionCardProps {
  motion: Motion;
  onClick?: () => void;
}

export default function MotionCard({ motion, onClick }: MotionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isHovered]);

  const renderMedia = () => {
    const publicUrl = motion.storage_path;

    switch (motion.file_type) {
      case 'mp4':
        return (
          <video
            ref={videoRef}
            src={publicUrl}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        );
      
      case 'webp':
      case 'gif':
        return (
          <img
            src={publicUrl}
            alt={motion.title || 'Motion'}
            className="w-full h-full object-cover"
          />
        );
      
      case 'lottie':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <DotLottiePlayer
              src={publicUrl}
              loop
              autoplay={isHovered}
              className="w-full h-full"
            />
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <span className="text-gray-400">不支持的格式</span>
          </div>
        );
    }
  };

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {renderMedia()}
        
        {motion.file_type === 'mp4' && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm line-clamp-2 flex-1">
            {motion.title || motion.app_name || '未命名动效'}
          </h3>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full whitespace-nowrap">
            {motion.file_type.toUpperCase()}
          </span>
        </div>

        {motion.brand && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {motion.brand.name}
          </div>
        )}

        {motion.motion_type && motion.motion_type.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {motion.motion_type.slice(0, 3).map((type, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
              >
                {type}
              </span>
            ))}
            {motion.motion_type.length > 3 && (
              <span className="text-xs px-2 py-0.5 text-gray-500">
                +{motion.motion_type.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
