"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const filmUrl = "https://videos.pexels.com/video-files/7488719/7488719-hd_1280_720_24fps.mp4";

export function HeroFilm() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionEnabled(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const layer = frame.current;
    if (!layer) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(layer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const clip = video.current;
    if (!clip) return;
    if (!visible || paused) {
      clip.pause();
      return;
    }
    void clip.play().catch(() => setPlaying(false));
  }, [visible, paused, motionEnabled]);

  useEffect(() => {
    const layer = frame.current;
    if (!layer || !visible || !motionEnabled || paused) return;
    let request = 0;
    const update = () => {
      if (request) return;
      request = window.requestAnimationFrame(() => {
        const { top, height } = layer.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -top / height));
        layer.style.setProperty("--film-offset", `${progress * 7}%`);
        request = 0;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(request);
      window.removeEventListener("scroll", update);
    };
  }, [motionEnabled, paused, visible]);

  return (
    <>
      <div ref={frame} className="hero-film" aria-hidden="true">
        <div className="hero-film-picture">
          {motionEnabled && !failed && (
            <video
              ref={video}
              className={ready ? "is-ready" : undefined}
              src={filmUrl}
              muted
              loop
              playsInline
              preload="metadata"
              onPlaying={() => {
                setReady(true);
                setPlaying(true);
              }}
              onPause={() => setPlaying(false)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
      {motionEnabled && !failed && (
        <button
          type="button"
          className="hero-film-control"
          aria-label={playing ? "Pause background video" : "Play background video"}
          onClick={() => {
            setPaused(playing);
            if (!playing) void video.current?.play().catch(() => setPlaying(false));
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      )}
    </>
  );
}
