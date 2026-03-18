import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { useAudio } from '../../hooks/useAudio'

export const AboutSculpture = ({ position, onClick, active }) => {
    const mesh = useRef()
    const [hovered, setHover] = useState(false)
    const { playHover } = useAudio()

    const handlePointerOver = () => {
        document.body.style.cursor = 'pointer'
        setHover(true)
        playHover()
    }

    useFrame((state, delta) => {
        if (mesh.current) {
            // Continuous rotation
            mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2)
            mesh.current.rotation.y += delta * 0.2

            // Interactive Scale
            const targetScale = active ? 1.4 : (hovered ? 1.2 : 1)
            easing.damp3(mesh.current.scale, targetScale, 0.2, delta)
        }
    })

    return (
        <group position={position} onClick={onClick}>
            <Float speed={2} rotationIntensity={2} floatIntensity={1}>
                <mesh
                    ref={mesh}
                    onPointerOver={handlePointerOver}
                    onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
                >
                    <sphereGeometry args={[1, 64, 64]} />
                    <MeshDistortMaterial
                        color="#7000ff"
                        envMapIntensity={1}
                        clearcoat={1}
                        clearcoatRoughness={0}
                        metalness={0.5}
                        roughness={0.2}
                        distort={active ? 0.3 : (hovered ? 0.6 : 0.4)} // Less distortion when reading (active)
                        speed={hovered ? 5 : 2} // Fast ripples on hover
                    />
                </mesh>

                {/* Wireframe shell for extra depth */}
                <mesh scale={[1.1, 1.1, 1.1]}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color="#a022ff" wireframe transparent opacity={0.1} />
                </mesh>
                <Text
                    position={[0, -1.8, 0]}
                    fontSize={0.4}
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                    anchorX="center"
                    anchorY="middle"
                    color="white"
                    outlineWidth={0.02}
                    outlineColor="#7000ff"
                    visible={!active}
                >
                    ABOUT ME
                </Text>
            </Float>
        </group>
    )
}
