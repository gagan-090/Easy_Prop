import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, X, Play, Pause, Volume2, VolumeX, 
  Maximize, RotateCcw, Home, Bed, Bath, Car,
  ChevronLeft, ChevronRight, MapPin
} from 'lucide-react';

const VirtualTour = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(0);

  // Mock property data
  const property = {
    id: parseInt(id),
    title: "Luxury Penthouse with Panoramic City Views",
    location: "Marine Drive, Mumbai",
    virtualTourVideo: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", // Placeholder
    rooms: [
      { id: 0, name: "Living Room", icon: Home, timestamp: 0 },
      { id: 1, name: "Master Bedroom", icon: Bed, timestamp: 30 },
      { id: 2, name: "Kitchen", icon: Home, timestamp: 60 },
      { id: 3, name: "Bathroom", icon: Bath, timestamp: 90 },
      { id: 4, name: "Balcony", icon: Home, timestamp: 120 },
      { id: 5, name: "Parking", icon: Car, timestamp: 150 }
    ]
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const jumpToRoom = (roomIndex) => {
    const video = videoRef.current;
    const room = property.rooms[roomIndex];
    video.currentTime = room.timestamp;
    setCurrentRoom(roomIndex);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('virtual-tour-container');
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextRoom = () => {
    const nextIndex = (currentRoom + 1) % property.rooms.length;
    jumpToRoom(nextIndex);
  };

  const prevRoom = () => {
    const prevIndex = currentRoom === 0 ? property.rooms.length - 1 : currentRoom - 1;
    jumpToRoom(prevIndex);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Virtual Tour Container */}
      <div id="virtual-tour-container" className="relative w-full h-screen">
        {/* Video Player */}
        <div className="relative w-full h-full">
          {/* Placeholder for 3D Virtual Tour - Using video as fallback */}
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="h-16 w-16" />
              </div>
              <h2 className="text-3xl font-bold mb-4">360° Virtual Tour</h2>
              <p className="text-xl text-slate-300 mb-8">
                Experience this luxury penthouse in immersive 3D
              </p>
              <div className="text-sm text-slate-400">
                * This is a demo interface. In production, this would integrate with<br />
                a 3D virtual tour platform like Matterport or custom WebGL viewer.
              </div>
            </div>
          </div>

          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-6 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/property/${id}`}
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                  <span>Back to Property</span>
                </Link>
                <div className="text-white">
                  <h1 className="text-xl font-bold">{property.title}</h1>
                  <div className="flex items-center text-sm text-white/80">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Maximize className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Room Navigation */}
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={prevRoom}
              className="w-12 h-12 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors mb-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>

          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={nextRoom}
              className="w-12 h-12 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors mb-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Room Selector */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                {property.rooms.map((room, index) => {
                  const IconComponent = room.icon;
                  return (
                    <button
                      key={room.id}
                      onClick={() => jumpToRoom(index)}
                      className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-300 ${
                        currentRoom === index
                          ? 'bg-blue-600 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-xs font-medium">{room.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => jumpToRoom(0)}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Restart Tour"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
                <Link
                  to={`/schedule-tour/${id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Schedule Physical Tour
                </Link>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Current Room Indicator */}
          <div className="absolute top-24 left-6 z-20">
            <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-xl">
              <div className="flex items-center space-x-2">
                {React.createElement(property.rooms[currentRoom].icon, { className: "h-5 w-5" })}
                <span className="font-semibold">{property.rooms[currentRoom].name}</span>
              </div>
            </div>
          </div>

          {/* Tour Features */}
          <div className="absolute top-24 right-6 z-20">
            <div className="bg-black/50 backdrop-blur-sm text-white p-4 rounded-xl space-y-2">
              <div className="text-sm font-semibold mb-2">Tour Features:</div>
              <div className="text-xs space-y-1">
                <div>• 360° Room Views</div>
                <div>• Interactive Hotspots</div>
                <div>• Detailed Measurements</div>
                <div>• HD Quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden video element for audio/controls */}
        <video
          ref={videoRef}
          className="hidden"
          src={property.virtualTourVideo}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default VirtualTour;