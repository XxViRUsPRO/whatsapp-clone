import React, { useEffect, useRef, useState } from "react";
import { FaTrash, FaPlay, FaStop, FaMicrophone, FaPause } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import { CREATE_MEDIA_MESSAGE_URL } from "@/utils/ApiRoutes";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/features/messages/messagesSlice";
import { mediaDevices } from "@/utils/MediaDevices";

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

function CaptureAudio({ setVisibility }) {
  const user = useSelector((state) => state.user.user);
  const currentChat = useSelector((state) => state.chat.currentChat);
  const socket = useSelector((state) => state.socket.socket);
  const dispatch = useDispatch();

  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(true);
  const [audio, setAudio] = useState(null);
  const [renderedAudio, setRenderedAudio] = useState(null);
  const [wave, setWave] = useState(null);
  const [duration, setDuration] = useState(0);
  const [playback, setPlayback] = useState(0);
  const [totalduration, setTotalDuration] = useState(0);

  const audioRef = useRef(null);
  const waveRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const waveSurfer = WaveSurfer.create({
      container: waveRef.current,
      waveColor: "#ddd",
      progressColor: "#333",
      cursorColor: "#333",
      barWidth: 3,
      height: 30,
      responsive: true,
    });
    setWave(waveSurfer);

    waveSurfer.on("finish", () => {
      setPlaying(false);
    });

    return () => waveSurfer.destroy();
  }, []);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setDuration((duration) => {
          setTotalDuration(duration);
          return duration + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    if (wave) handleStart();
  }, [wave]);

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

  const handleStart = () => {
    setDuration(0);
    setPlayback(0);
    setTotalDuration(0);
    setRecording(true);
    setAudio(null);
    mediaDevices()
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, {
            type: "audio/ogg; codec=opus",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          setAudio(audio);
          wave.load(audioUrl);
        });
        mediaRecorder.start();
      })
      .catch((err) => console.log(err));
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      wave.stop();

      const audioChunks = [];
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "audio.mp3", {
          type: "audio/mp3",
        });
        setRenderedAudio(audioFile);
      });
    }
  };

  const handlePlay = () => {
    if (audio) {
      wave.stop();
      wave.play();
      audio.play();
      setPlaying(true);
    }
  };
  const handlePause = () => {
    if (audio) {
      wave.stop();
      audio.pause();
      setPlaying(false);
    }
  };

  const sendMessage = async () => {
    try {
      if (renderedAudio === null) return;
      const formData = new FormData();
      formData.append("file", renderedAudio);
      formData.append("from", user?.id);
      formData.append("to", currentChat?.id);
      const { data } = await axios.post(CREATE_MEDIA_MESSAGE_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.status) {
        socket.current.emit("messageOut", data.data);
        dispatch(addMessage(data.data));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex gap-3 items-center h-10 w-full p-2">
      <button onClick={() => setVisibility(false)}>
        <FaTrash className="text-red-500" />
      </button>
      <div className="relative flex-1 flex items-center gap-4 h-10 bg-conversation-panel-background px-4 rounded-full">
        {audio && !recording && (
          <button onClick={playing ? handlePause : handlePlay}>
            {playing ? (
              <FaPause className="text-red-500" />
            ) : (
              <FaPlay className="text-green-500" />
            )}
          </button>
        )}
        <div className="relative flex-1">
          <span
            className="absolute top-1/2 inset-x-0 h-px bg-[#ddd]"
            hidden={recording}
          />
          <div className="w-full h-full" ref={waveRef} hidden={recording} />
        </div>
        {audio && playing ? (
          <span>{formatTime(playback)}</span>
        ) : (
          <span>{formatTime(duration)}</span>
        )}

        {recording && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center font-semibold text-red-500 animate-[pulse_1s_ease-in-out_infinite]">
            Recording
          </span>
        )}
        <audio ref={audioRef} hidden />
      </div>
      <div className="flex gap-3 text-2xl bg-conversation-panel-background p-2 rounded-full">
        <button onClick={recording ? handleStop : handleStart}>
          {recording ? (
            <FaStop className="text-red-500" />
          ) : (
            <FaMicrophone className="text-red-500" />
          )}
        </button>
        <button onClick={sendMessage} disabled={renderedAudio === null}>
          <IoMdSend className="text-green-500" />
        </button>
      </div>
    </div>
  );
}

export default CaptureAudio;
