import React, { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

function VoiceMessage({ src }) {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [duration, setDuration] = useState(0);
  const [playback, setPlayback] = useState(0);

  const waveRef = useRef(null);
  const waveForm = useRef(null);

  useEffect(() => {
    waveForm.current = WaveSurfer.create({
      container: waveRef.current,
      waveColor: "#ddd",
      progressColor: "#333",
      cursorColor: "#333",
      barWidth: 3,
      height: 30,
      responsive: true,
    });

    waveForm.current.on("finish", () => {
      setPlaying(false);
    });

    return () => waveForm.current.destroy();
  }, []);

  useEffect(() => {
    const audioMessage = new Audio(src);
    setAudio(audioMessage);
    waveForm.current.load(src);
    waveForm.current.on("ready", () => {
      setDuration(Math.floor(waveForm.current.getDuration()));
    });
  }, [src]);

  useEffect(() => {
    if (audio) {
      const updatePlaybackTime = () => {
        setPlayback(audio.currentTime);
      };
      audio.addEventListener("timeupdate", updatePlaybackTime);

      return () => {
        audio.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [audio]);

  const handlePlay = () => {
    if (audio) {
      waveForm.current.stop();
      waveForm.current.play();
      audio.play();
      setPlaying(true);
    }
  };
  const handlePause = () => {
    if (audio) {
      waveForm.current.stop();
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="h-10 w-72 relative flex-1 flex items-center gap-4 px-4">
      {audio && (
        <button onClick={playing ? handlePause : handlePlay}>
          {playing ? <FaPause /> : <FaPlay />}
        </button>
      )}
      <div className="relative flex-1">
        <span className="absolute top-1/2 inset-x-0 h-px bg-[#ddd]" />
        <div className="w-full h-full" ref={waveRef} />
      </div>
      {audio && playing ? (
        <span>{formatTime(playback)}</span>
      ) : (
        <span>{formatTime(duration)}</span>
      )}
    </div>
  );
}

export default VoiceMessage;
