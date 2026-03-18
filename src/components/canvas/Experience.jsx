import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Stars as DreiStars, Sparkles, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, Glitch, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { easing } from 'maath'
import { Nodes } from './Nodes'
import { SpaceBlaster } from './SpaceBlaster'
import { useStore } from '../../store'

const SceneController = () => {
    const { activeNode, gameMode } = useStore()
    const { camera, viewport } = useThree()
    const isMobile = viewport.width < 7

    useFrame((state, delta) => {
        if (gameMode) {
            easing.damp3(camera.position, [0, 0, 10], 0.4, delta)
            return
        }

        if (activeNode) {
            const targetPos = isMobile ? [0, 0, 12] : [0, 0, 8]
            easing.damp3(camera.position, targetPos, 0.4, delta)
        } else {
            const targetPos = isMobile ? [0, 0, 28] : [0, 0, 15]
            easing.damp3(camera.position, targetPos, 0.4, delta)
        }
    })
    return null
}

export const Experience = () => {
    const { universe, gameMode } = useStore()
    const isCyberpunk = universe === 'cyberpunk'

    return (
        <>
            <SceneController />
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={35} />
            <OrbitControls
                enablePan={false}
                enableZoom={false}
                enabled={!gameMode}
                maxPolarAngle={Math.PI / 1.6}
                minPolarAngle={Math.PI / 3}
            />

            {/* DYNAMIC BACKGROUND & FOG */}
            <color attach="background" args={[gameMode ? '#000000' : (isCyberpunk ? '#050011' : '#050510')]} />
            <fog attach="fog" args={[gameMode ? '#000000' : (isCyberpunk ? '#200020' : '#050510'), 10, 50]} />
            <Environment preset={gameMode ? "night" : (isCyberpunk ? "warehouse" : "city")} />

            {/* DYNAMIC PARTICLES */}
            <DreiStars
                radius={100} depth={50} count={5000} factor={4} saturation={0}
                fade speed={isCyberpunk || gameMode ? 5 : 1}
            />

            {(isCyberpunk || gameMode) ? (
                <>
                    <Grid
                        infiniteGrid
                        fadeDistance={30}
                        sectionColor="#ff00ff"
                        cellColor="#00ffff"
                        position={[0, -5, 0]}
                    />
                    <Sparkles count={500} scale={20} size={5} speed={0.8} opacity={0.8} color="#ff00ff" />
                </>
            ) : (
                <Sparkles count={300} scale={15} size={3} speed={0.4} opacity={0.6} color="#00ffff" />
            )}

            {/* POST PROCESSING */}
            {/* POST PROCESSING - Disabled in Game Mode for clarity */}
            {!gameMode && (
                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={1}
                        mipmapBlur
                        intensity={isCyberpunk ? 2.5 : 1.5}
                        radius={0.8}
                    />
                    <Noise opacity={isCyberpunk ? 0.05 : 0.02} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    {isCyberpunk && <ChromaticAberration offset={[0.002, 0.002]} />}
                </EffectComposer>
            )}

            <group position={[0, 0, 0]}>
                {gameMode ? <SpaceBlaster /> : <Nodes />}
            </group>
        </>
    )
}
