import { useRef, useState } from "react"
import { BRIDE_FIRSTNAME, GROOM_FIRSTNAME } from "../../const"

const BGM_URL =
  "https://github.com/ds-wook/wedding-invitation/releases/download/bgm/bgm.mp3"

export const BGM = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [entered, setEntered] = useState(false)
  const [fading, setFading] = useState(false)

  const handleEnter = () => {
    setFading(true)
    audioRef.current?.play().then(() => setPlaying(true)).catch(() => {})
  }

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={BGM_URL}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {!entered && (
        <div
          className={`intro-overlay${fading ? " fading" : ""}`}
          onClick={handleEnter}
          onAnimationEnd={() => setEntered(true)}
        >
          <div className="intro-names">
            {GROOM_FIRSTNAME} ♥ {BRIDE_FIRSTNAME}
          </div>
          <div className="intro-hint">화면을 터치하세요</div>
        </div>
      )}

      {entered && (
        <button
          className={`bgm-button${playing ? " playing" : ""}`}
          onClick={toggle}
        >
          ♪
        </button>
      )}
    </>
  )
}
