import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, useTexture, Decal, Float, Stars as DreiStars, Text } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { useAudio } from '../../hooks/useAudio'

export const ProjectsPlanet = ({ position, onClick, active }) => {
    const planetRef = useRef()
    const ringRef = useRef()
    const [hovered, setHover] = useState(false)
    const { playHover } = useAudio()

    const handlePointerOver = () => {
        document.body.style.cursor = 'pointer'
        setHover(true)
        playHover()
    }

    // Procedural Buildings (simple boxes)
    const buildings = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2
            const radius = 1.05 // On surface
            const height = 0.1 + Math.random() * 0.4
            return {
                position: [
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    (Math.random() - 0.5) * 0.5
                ],
                rotation: [0, 0, angle + Math.PI / 2],
                scale: [0.1, height, 0.1]
            }
        })
    }, [])

    useFrame((state, delta) => {
        // Planet rotation
        if (planetRef.current) {
            planetRef.current.rotation.y += delta * 0.1
        }
        // Ring rotation
        if (ringRef.current) {
            ringRef.current.rotation.z -= delta * 0.05
            ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
        }

        // Interactive scale
        if (planetRef.current) {
            const targetScale = active ? 1.5 : (hovered ? 1.2 : 1)
            easing.damp3(planetRef.current.scale, targetScale, 0.5, delta)
        }
    })

    return (
        <group
            position={position}
            onClick={onClick}
            onPointerOver={handlePointerOver}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
        >
            {/* The Main Planet Sphere */}
            <group ref={planetRef}>
                <mesh>
                    <sphereGeometry args={[0.7, 64, 64]} />
                    <meshStandardMaterial
                        color="#ff8c00"
                        roughness={0.7}
                        metalness={0.1}
                        emissive="#331100"
                    />
                </mesh>

                {/* Atmosphere/Glow */}
                <mesh scale={[0.85, 0.85, 0.85]}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <meshBasicMaterial
                        color="#ff4400"
                        transparent
                        opacity={0.1}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* City Lights / Buildings */}
                <group rotation={[Math.PI / 2, 0, 0]}>
                    {buildings.map((b, i) => (
                        <mesh key={i} position={[b.position[0] * 0.7, b.position[1] * 0.7, b.position[2]]} rotation={b.rotation}>
                            <boxGeometry args={b.scale} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* Orbital Ring */}
            <group ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
                <mesh>
                    <torusGeometry args={[1.2, 0.02, 16, 100]} />
                    <meshBasicMaterial color="#ff8c00" transparent opacity={0.6} />
                </mesh>
                {/* Particles in orbit */}
                <Sparkles scale={[3, 0.2, 3]} count={40} speed={0.4} opacity={1} size={3} color="#ffffff" />
            </group>

            {/* Satellites */}
            <Float speed={5} rotationIntensity={2} floatIntensity={0}>
                <mesh position={[1.8, 0.5, 0]}>
                    <octahedronGeometry args={[0.1, 0]} />
                    <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={2} />
                </mesh>
            </Float>

            <Text
                position={[0, -1.8, 0]}
                fontSize={0.4}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                anchorX="center"
                anchorY="middle"
                color="white"
                outlineWidth={0.02}
                outlineColor="#ff8c00"
                visible={!active}
            >
                PROJECTS
            </Text>

        </group>
    )
}
