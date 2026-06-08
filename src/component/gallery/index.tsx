import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ArrowLeft from "../../icons/angle-left-sm.svg?react"
import { LazyDiv } from "../lazyDiv"
import { Button } from "../button"
import { useModal } from "../modal"
import { WEDDING_IMAGES, SNAP_IMAGES } from "../../images"

const WEDDING_CAROUSEL_ITEMS = WEDDING_IMAGES.map((item, idx) => (
  <div className="carousel-item" key={`w-${idx}`}>
    <img src={item} draggable={false} alt={`wedding-${idx}`} />
  </div>
))

const SNAP_CAROUSEL_ITEMS = SNAP_IMAGES.map((item, idx) => (
  <div className="carousel-item" key={`s-${idx}`}>
    <img src={item} draggable={false} alt={`snap-${idx}`} />
  </div>
))

const DRAG_SENSITIVITY = 15

type Tab = "wedding" | "snap"

type Status =
  | "stationary"
  | "clicked"
  | "clickCanceled"
  | "dragging"
  | "dragEnding"
  | "moving-left"
  | "moving-right"

type DragOption = {
  startingClientX: number
  startingClientY: number
  currentTranslateX: number
}

type ClickMove = "left" | "right" | null

export const Gallery = () => {
  const { openModal, closeModal } = useModal()
  const carouselRef = useRef<HTMLDivElement>({} as HTMLDivElement)

  useEffect(() => {
    // preload images
    ;[...WEDDING_IMAGES, ...SNAP_IMAGES].forEach((image) => {
      const img = new Image()
      img.src = image
    })
  }, [])

  const [tab, setTab] = useState<Tab>("wedding")
  const carouselItems = tab === "wedding" ? WEDDING_CAROUSEL_ITEMS : SNAP_CAROUSEL_ITEMS
  const currentImages = tab === "wedding" ? WEDDING_IMAGES : SNAP_IMAGES

  const [slide, _setSlide] = useState(0)
  const slideRef = useRef(0)
  const setSlide = (slide: number) => {
    _setSlide(slide)
    slideRef.current = slide
  }

  const [status, _setStatus] = useState<Status>("stationary")
  const statusRef = useRef<Status>("stationary")
  const setStatus = (status: Status) => {
    _setStatus(status)
    statusRef.current = status
  }

  const [dragOption, _setDragOption] = useState<DragOption>({
    startingClientX: 0,
    startingClientY: 0,
    currentTranslateX: 0,
  })
  const dragOptionRef = useRef<DragOption>({
    startingClientX: 0,
    startingClientY: 0,
    currentTranslateX: 0,
  })
  const setDragOption = (dragOption: DragOption) => {
    _setDragOption(dragOption)
    dragOptionRef.current = dragOption
  }

  const [moveOption, setMoveOption] = useState({
    srcIdx: 0,
    dstIdx: 0,
  })

  const clickMoveRef = useRef<ClickMove>(null)
  const setClickMove = (clickMove: ClickMove) => {
    clickMoveRef.current = clickMove
  }

  const switchTab = (newTab: Tab) => {
    if (newTab === tab || statusRef.current !== "stationary") return
    setTab(newTab)
    setSlide(0)
    setStatus("stationary")
  }

  const click = (
    status: Status,
    clientX: number,
    clientY: number,
    carouselWidth: number,
  ) => {
    if (status !== "stationary") return
    setDragOption({
      startingClientX: clientX,
      startingClientY: clientY,
      currentTranslateX: -carouselWidth,
    })
    setStatus("clicked")
  }

  const dragging = useCallback(
    (dragOption: DragOption, clientX: number, carouselWidth: number) => {
      let moveTranslateX = clientX - dragOption.startingClientX

      if (moveTranslateX > carouselWidth) {
        moveTranslateX = carouselWidth
      } else if (moveTranslateX < -carouselWidth) {
        moveTranslateX = -carouselWidth
      }

      setDragOption({
        ...dragOption,
        currentTranslateX: moveTranslateX - carouselWidth,
      })
    },
    [],
  )

  const dragEnd = useCallback(
    (slide: number, dragOption: DragOption, carouselWidth: number) => {
      let move = 0
      if (dragOption.currentTranslateX < -carouselWidth * 1.1) {
        move = 1
      } else if (dragOption.currentTranslateX > -carouselWidth * 0.9) {
        move = -1
      }

      setDragOption({
        ...dragOption,
        currentTranslateX: -carouselWidth * (move + 1),
      })

      setStatus("dragEnding")

      setTimeout(() => {
        setDragOption({
          ...dragOption,
          currentTranslateX: -carouselWidth,
        })
        setStatus("stationary")
        setSlide((slide + move + carouselItems.length) % carouselItems.length)
      }, 300)
    },
    [carouselItems.length],
  )

  const move = useCallback((srcIdx: number, dstIdx: number) => {
    setSlide(dstIdx)
    if (srcIdx < dstIdx) {
      setStatus("moving-right")
    } else {
      setStatus("moving-left")
    }

    setMoveOption({ srcIdx, dstIdx })

    setTimeout(() => {
      setClickMove(null)
      setStatus("stationary")
    }, 300)
  }, [])

  /* Events */
  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const status = statusRef.current

      if (status === "clicked") {
        setStatus("dragging")
      } else if (status === "dragging") {
        e.preventDefault()
        dragging(
          dragOptionRef.current,
          e.clientX,
          carouselRef.current.clientWidth,
        )
      }
    },
    [dragging],
  )

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const status = statusRef.current

      if (status === "clicked") {
        e.preventDefault()
        const xMove =
          e.targetTouches[0].clientX - dragOptionRef.current.startingClientX
        const yMove =
          e.targetTouches[0].clientY - dragOptionRef.current.startingClientY
        if (Math.abs(xMove) > DRAG_SENSITIVITY) {
          setStatus("dragging")
        } else if (Math.abs(yMove) > DRAG_SENSITIVITY) {
          setStatus("clickCanceled")
        }
      } else if (status === "dragging") {
        e.preventDefault()
        dragging(
          dragOptionRef.current,
          e.targetTouches[0].clientX,
          carouselRef.current.clientWidth,
        )
      }
    },
    [dragging],
  )

  const onMouseTouchUp = useCallback(() => {
    const status = statusRef.current
    const clickMove = clickMoveRef.current
    const slide = slideRef.current

    if (status === "clicked") {
      if (clickMove === "left") {
        move(slide, (slide + carouselItems.length - 1) % carouselItems.length)
      } else if (clickMove === "right") {
        move(slide, (slide + 1) % carouselItems.length)
      } else {
        setStatus("stationary")
      }
    } else if (status === "dragging") {
      dragEnd(slide, dragOptionRef.current, carouselRef.current.clientWidth)
    } else if (status === "clickCanceled") {
      setStatus("stationary")
    }
  }, [dragEnd, move, carouselItems.length])

  useEffect(() => {
    const carouselElement = carouselRef.current

    window.addEventListener("mousemove", onMouseMove)
    carouselElement.addEventListener("touchmove", onTouchMove)
    window.addEventListener("mouseup", onMouseTouchUp)
    window.addEventListener("touchend", onMouseTouchUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      carouselElement.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("mouseup", onMouseTouchUp)
      window.removeEventListener("touchend", onMouseTouchUp)
    }
  }, [onMouseMove, onTouchMove, onMouseTouchUp])

  const onIndicatorClick = useCallback(
    (status: Status, srcIdx: number, dstIdx: number) => {
      if (status !== "stationary" || srcIdx === dstIdx) return
      move(srcIdx, dstIdx)
    },
    [move],
  )

  const transformStyle = useMemo(() => {
    switch (status) {
      case "dragging":
      case "dragEnding":
        return { transform: `translateX(${dragOption.currentTranslateX}px)` }
      default:
        return {}
    }
  }, [status, dragOption])

  const transformClass = useMemo(() => {
    const className = "carousel-list"
    switch (status) {
      case "dragEnding":
        return className + " transitioning"
      case "moving-left":
        return className + " moving-left"
      case "moving-right":
        return className + " moving-right"
      default:
        return className
    }
  }, [status])

  return (
    <LazyDiv className="card gallery">
      <h2 className="english">Gallery</h2>
      <div className="tab-switcher">
        <button
          className={tab === "wedding" ? "active" : ""}
          onClick={() => switchTab("wedding")}
        >
          웨딩
        </button>
        <button
          className={tab === "snap" ? "active" : ""}
          onClick={() => switchTab("snap")}
        >
          스냅
        </button>
      </div>
      <div className="carousel-wrapper">
        <div
          className="carousel"
          ref={carouselRef}
          onMouseDown={(e) =>
            click(
              statusRef.current,
              e.clientX,
              e.clientY,
              e.currentTarget.clientWidth,
            )
          }
          onTouchStart={(e) =>
            click(
              statusRef.current,
              e.targetTouches[0].clientX,
              e.targetTouches[0].clientY,
              e.currentTarget.clientWidth,
            )
          }
        >
          <div className={transformClass} style={transformStyle}>
            {["dragging", "dragEnding"].includes(status) && [
              ...(slide === 0
                ? [carouselItems[carouselItems.length - 1]]
                : []),
              ...carouselItems.slice(slide === 0 ? 0 : slide - 1, slide + 2),
              ...(slide === carouselItems.length - 1
                ? [carouselItems[0]]
                : []),
            ]}
            {status === "moving-right" &&
              carouselItems.slice(moveOption.srcIdx, moveOption.dstIdx + 1)}
            {status === "moving-left" &&
              carouselItems.slice(moveOption.dstIdx, moveOption.srcIdx + 1)}
            {["stationary", "clicked", "clickCanceled"].includes(status) &&
              carouselItems[slide]}
          </div>
          <div className="carousel-control">
            <div
              className="control left"
              onMouseDown={() => {
                if (statusRef.current === "stationary") setClickMove("left")
              }}
              onTouchStart={() => {
                if (statusRef.current === "stationary") setClickMove("left")
              }}
            >
              <ArrowLeft className="arrow" />
            </div>
            <div
              className="control right"
              onMouseDown={() => {
                if (statusRef.current === "stationary") setClickMove("right")
              }}
              onTouchStart={() => {
                if (statusRef.current === "stationary") setClickMove("right")
              }}
            >
              <ArrowLeft className="arrow right" />
            </div>
          </div>
        </div>
        <div className="carousel-indicator">
          {carouselItems.map((_, idx) => (
            <button
              key={idx}
              className={`indicator${idx === slide ? " active" : ""}`}
              onClick={() =>
                onIndicatorClick(statusRef.current, slideRef.current, idx)
              }
            />
          ))}
        </div>
      </div>

      <div className="break" />

      <Button
        onClick={() =>
          openModal({
            className: "all-photo-modal",
            closeOnClickBackground: true,
            header: (
              <div className="title">
                {tab === "wedding" ? "웨딩" : "스냅"} 사진 전체보기
              </div>
            ),
            content: (
              <>
                <div className="photo-list">
                  {currentImages.map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`${idx}`}
                      draggable={false}
                      onClick={() => {
                        if (statusRef.current === "stationary") {
                          if (idx !== slideRef.current) {
                            move(slideRef.current, idx)
                          }
                          closeModal()
                        }
                      }}
                    />
                  ))}
                </div>
                <div className="break" />
              </>
            ),
            footer: (
              <Button
                buttonStyle="style2"
                className="bg-light-grey-color text-dark-color"
                onClick={closeModal}
              >
                닫기
              </Button>
            ),
          })
        }
      >
        사진 전체보기
      </Button>
    </LazyDiv>
  )
}
