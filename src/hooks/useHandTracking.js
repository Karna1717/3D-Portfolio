import { useRef, useEffect, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

export const useHandTracking = () => {
  const landmarksRef = useRef(null)
  const videoRef = useRef(null)
  const landmarkerRef = useRef(null)
  const requestRef = useRef(null)

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
          const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
          )
          
          if (!active) return

          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
          })
          
          startCamera()
      } catch (err) {
          console.error("Failed to init hand tracking:", err)
      }
    }
    
    init()

    return () => {
       active = false
       if (videoRef.current && videoRef.current.srcObject) {
           const tracks = videoRef.current.srcObject.getTracks()
           tracks.forEach(t => t.stop())
       }
       if (requestRef.current) cancelAnimationFrame(requestRef.current)
       if (videoRef.current) videoRef.current.remove()
    }
  }, [])

  const startCamera = () => {
      if (videoRef.current) return // Already started

      const video = document.createElement('video')
      video.style.display = 'none'
      video.autoplay = true
      video.playsInline = true
      videoRef.current = video
      document.body.appendChild(video)

      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          video.srcObject = stream
          video.addEventListener('loadeddata', predictWebcam)
        })
        .catch(err => console.error("Webcam blocked/failed:", err))
  }

  const predictWebcam = () => {
      requestRef.current = requestAnimationFrame(predictWebcam)

      if (landmarkerRef.current && videoRef.current && videoRef.current.currentTime !== 0) {
          if (videoRef.current.paused || videoRef.current.ended) return

          const startTime = performance.now()
          const result = landmarkerRef.current.detectForVideo(videoRef.current, startTime)
          
          if (result.landmarks && result.landmarks.length > 0) {
              landmarksRef.current = result.landmarks[0]
          } else {
              landmarksRef.current = null
          }
      }
  }

  const getHandData = () => {
      if (!landmarksRef.current) {
           return { x: 0, y: 0, isPinching: false, available: false }
      }

      const thumb = landmarksRef.current[4]
      const index = landmarksRef.current[8]

      // Mirror x for natural feeling
      const x = (index.x * 2 - 1) * -1 
      const y = (index.y * 2 - 1) * -1 

      const distance = Math.sqrt(
          Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
      )
      const isPinching = distance < 0.05

      return { x, y, isPinching, available: true }
  }

  return { getHandData }
}
