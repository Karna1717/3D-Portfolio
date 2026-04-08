import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { Loader } from '@react-three/drei'
import { Experience } from './components/canvas/Experience'
import { UI } from './components/ui/UI'
import { Overlay } from './components/ui/Overlay'
import './components/ui/Overlay.css'

function App() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      <Canvas
        shadows
        camera={{
          position: [0, 0, isMobile ? 18 : 15],
          fov: isMobile ? 35 : 30
        }}
        dpr={[1, 2]}
        gl={{ antialias: false, pixelRatio: window.devicePixelRatio }}
      >
        <color attach="background" args={['#050510']} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Loader
        containerStyles={{ background: '#000' }}
        innerStyles={{ width: isMobile ? '80%' : '400px', maxWidth: '400px' }}
        barStyles={{ height: '5px', background: '#00ffff' }}
        dataStyles={{ color: '#00ffff', fontSize: isMobile ? '10px' : '12px' }}
        dataInterpolation={(p) => `Loading Ecosystem ${p.toFixed(0)}%`}
      />
      <UI />
      <Overlay />
    </>
  )
}

export default App
