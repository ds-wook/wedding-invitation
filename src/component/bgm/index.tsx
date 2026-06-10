import { useEffect, useRef, useState } from "react"

export const BGM = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    audioRef.current?.play().then(() => setPlaying(true)).catch(() => {})
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // 즉시 재생 시도 — 브라우저가 허용하면 바로 재생됨
    audio.play().then(() => setPlaying(true)).catch(() => {
      // 브라우저가 막으면 첫 상호작용 시 재생
      const handleFirstInteraction = () => {
        play()
      }
      window.addEventListener("touchstart", handleFirstInteraction, { once: true })
      window.addEventListener("click", handleFirstInteraction, { once: true })
    })
  }, [])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      play()
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="https://github.com/ds-wook/wedding-invitation/releases/download/bgm/bgm.mp3"
        loop
        preload="auto"
      />
      <button className={`bgm-button${playing ? " playing" : ""}`} onClick={toggle}>
        ♪
      </button>
    </>
  )
}
