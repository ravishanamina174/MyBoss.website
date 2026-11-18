"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CheckCheck, CirclePlay, LayoutDashboard, ListTodo, Pause, Play, Store, Users } from "lucide-react";

const phoneQuery = "(max-width: 620px)";

function subscribeToWidth(update: () => void) {
  const query = window.matchMedia(phoneQuery);
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
}

function getFilmPath() {
  return window.matchMedia(phoneQuery).matches ? "/media/opening-checklist-mobile" : "/media/opening-checklist";
}

export function HeroFilm() {
  const path = useSyncExternalStore(subscribeToWidth, getFilmPath, () => null);
  const film = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const element = film.current;
    if (!element || !path) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    function sync() {
      if (!element) return;
      if (visible && !userPaused.current && !motion.matches) void element.play().catch(() => {});
      else element.pause();
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    motion.addEventListener("change", sync);
    return () => { observer.disconnect(); motion.removeEventListener("change", sync); };
  }, [path]);

  return (
    <figure className="tour" id="tour">
      <div className="tour-window">
        <div className="tour-bar">
          <span className="window-lights" aria-hidden="true"><i /><i /><i /></span>
          <span>Workspace preview</span><span className="tour-film-label"><CirclePlay size={13} /> Product film</span>
        </div>
        <div className="tour-body">
          <div className="tour-sidebar" aria-hidden="true">
            <b><Store /> Maple Street</b>
            <span><LayoutDashboard /> Overview</span><span className="tour-selected"><ListTodo /> Tasks</span><span><Users /> Staff</span>
          </div>
          <div className="tour-content">
            <div className="tour-crumb"><CheckCheck size={16} /> Tasks <span>/</span> Maple Street Market</div>
            <video ref={film} src={path ? `${path}.mp4` : undefined} poster={path ? `${path}.webp` : undefined}
              muted loop playsInline preload="metadata" aria-label="Example opening checklist. Jules completes the till count and the total updates to two of three tasks."
              onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
          </div>
        </div>
      </div>
      <figcaption>
        <span>Inside MyBoss <span className="tour-caption-detail">/ &nbsp; A morning at Maple Street Market</span></span>
        {!failed && <button type="button" aria-label={playing ? "Pause product film" : "Play product film"} onClick={() => {
          const element = film.current;
          if (!element) return;
          userPaused.current = !element.paused;
          if (element.paused) void element.play().catch(() => {});
          else element.pause();
        }}>{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? "Pause" : "Play"}</button>}
      </figcaption>
    </figure>
  );
}
