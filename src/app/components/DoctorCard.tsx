import React, { useState } from "react";
import Image from "next/image";

interface DoctorCardProps {
  name: string;
  specialty: string;
  image: string;
  status: string;
  bio: string;
  time: string;
  rating?: number;
  experience?: string;
  selected?: boolean;
  onClick?: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ 
  name, 
  specialty, 
  image, 
  status, 
  bio, 
  time, 
  rating = 4.8, 
  experience = "5+ years", 
  selected, 
  onClick 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'busy':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'offline':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div
      className={`group relative cursor-pointer bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] ${
        selected 
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onClick}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-scale-in">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Doctor Image */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
              {!imageError ? (
                <Image 
                  src={image} 
                  alt={name} 
                  width={80} 
                  height={80} 
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Online status indicator */}
            {status.toLowerCase() === 'available' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>

          {/* Card Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 leading-tight truncate group-hover:text-blue-600 transition-colors duration-200">
                  {name}
                </h3>
                <p className="text-sm font-medium text-blue-600 leading-tight mb-1 truncate">
                  {specialty}
                </p>
                
                {/* Rating and Experience */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{experience}</span>
                </div>
              </div>
              
              {/* Favorite Button */}
              <button 
                className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isFavorite 
                    ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-400'
                }`}
                onClick={handleFavoriteClick}
              >
                <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364L12 4.636 4.318 6.318z" />
                </svg>
              </button>
            </div>
            
            {/* Bio */}
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
              {bio}
            </p>
            
            {/* Status and Time */}
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  status.toLowerCase() === 'available' ? 'bg-green-500' :
                  status.toLowerCase() === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                {status}
              </span>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {time}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default DoctorCard;