import { useRef, useState } from "react"
import { BRIDE_FIRSTNAME, GROOM_FIRSTNAME } from "../../const"

const BGM_URL = `${import.meta.env.BASE_URL.replace(/\/?$/, "")}/bgm.mp3`

export const BGM = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [entered, setEntered] = useState(false)

  const handleEnter = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => {})
    setEntered(true)
  }

  const toggle = () => {
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
        onLoadedMetadata={(e) => { (e.currentTarget as HTMLAudioElement).volume = 0.35 }}
      />

      {!entered && (
        <button
          type="button"
          className="intro-overlay"
          onClick={handleEnter}
        >
          <div className="intro-names">
            {GROOM_FIRSTNAME} ♥ {BRIDE_FIRSTNAME}
          </div>
          <div className="intro-hint">화면을 터치하세요</div>
        </button>
      )}

      {entered && (
        <button
          type="button"
          className={`bgm-button${playing ? " playing" : ""}`}
          onClick={toggle}
        >
          ♪
        </button>
      )}
    </>
  )
}
