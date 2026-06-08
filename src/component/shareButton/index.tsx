import { useState } from "react"
import { LazyDiv } from "../lazyDiv"

const baseUrl = import.meta.env.BASE_URL

export const ShareButton = () => {
  const [copied, setCopied] = useState(false)

  const url = window.location.protocol + "//" + window.location.host + baseUrl

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <LazyDiv className="footer share-button">
      <button className="ktalk-share" onClick={handleCopy}>
        {copied ? "✓ 복사되었습니다" : "🔗 링크 복사하기"}
      </button>
    </LazyDiv>
  )
}
