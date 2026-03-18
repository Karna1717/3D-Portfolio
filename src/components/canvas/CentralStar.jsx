import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { useStore } from '../../store'
import { useAudio } from '../../hooks/useAudio'

export const CentralStar = () => {
    const mesh = useRef()
    const light = useRef()
    const { universe, setUniverse } = useStore()
    const [warping, setWarping] = useState(false)
    const [hovered, setHover] = useState(false)
    const { playClick, playHover } = useAudio()

    const handlePointerOver = () => {
        document.body.style.cursor = 'pointer'
        setHover(true)
        playHover()
    }

    const handleClick = () => {
        playClick()
        setWarping(true)

        // Trigger "Warp" effect animation
        // After a delay, switch dimension
        setTimeout(() => {
            setUniverse(universe === 'default' ? 'cyberpunk' : 'default')
            setWarping(false)
        }, 500) // Fast transition
    }

    useFrame((state, delta) => {
        if (mesh.current) {
            // Pulse animation
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1

            // Warp Animation: rapid scale up then reset
            const targetScale = warping ? 20 : (hovered ? 1.5 : 1)
            easing.damp3(mesh.current.scale, targetScale * pulse, warping ? 0.1 : 0.2, delta)

            // Rotation
            mesh.current.rotation.y -= delta * 0.5
        }
    })

    // Visuals change based on Universe
    const color = universe === 'default' ? 'white' : '#ff00ff' // White vs Neon Pink

    return (
        <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}>
            <mesh ref={mesh}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial
                    color={color}
                    toneMapped={false} // Make it super bright/bloom
                />
            </mesh>

            {/* Light Source */}
            <pointLight
                ref={light}
                position={[0, 0, 0]}
                intensity={universe === 'default' ? 10 : 20}
                color={color}
                distance={20}
                decay={2}
            />

            {/* Halo / Glow */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.BackSide} />
            </mesh>
        </group>
    )
}
