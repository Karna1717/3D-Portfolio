import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Float, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { useAudio } from '../../hooks/useAudio'

export const ContactNetwork = ({ position, onClick, active }) => {
    const group = useRef()
    const [hovered, setHover] = useState(false)
    const { playHover } = useAudio()

    const handlePointerOver = () => {
        document.body.style.cursor = 'pointer'
        setHover(true)
        playHover()
    }

    // Create random points for the neural network
    const count = 15
    const points = useMemo(() => {
        return new Array(count).fill(0).map(() => (
            new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(1) // Project to sphere surface then scale
        ))
    }, [])

    // Create connections between points
    const lines = useMemo(() => {
        const l = []
        points.forEach((p1, i) => {
            points.slice(i + 1).forEach(p2 => {
                if (p1.distanceTo(p2) < 1.2) {
                    l.push([p1, p2])
                }
            })
        })
        return l
    }, [points])

    useFrame((state, delta) => {
        if (group.current) {
            group.current.rotation.y -= delta * 0.1
            group.current.rotation.x += delta * 0.05

            // Pulse effect
            const scale = active ? 1.5 : (hovered ? 1.2 : 1) + Math.sin(state.clock.elapsedTime * 2) * 0.02
            easing.damp3(group.current.scale, scale, 0.2, delta)
        }
    })

    return (
        <group position={position} onClick={onClick}
            onPointerOver={handlePointerOver}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
        >
            <group ref={group}>
                {/* Nodes */}
                {points.map((p, i) => (
                    <mesh key={i} position={p}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshBasicMaterial color="#ff0055" />
                    </mesh>
                ))}

                {/* Connections */}
                {lines.map((line, i) => (
                    <Line
                        key={i}
                        points={line}
                        color="#ff0055"
                        transparent
                        opacity={0.3}
                        lineWidth={1}
                    />
                ))}

                {/* Core Energy */}
                <mesh>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshBasicMaterial color="#ff0055" transparent opacity={0.05} wireframe />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.6, 32, 32]} />
                    <meshBasicMaterial color="#ff0055" transparent opacity={0.1} />
                </mesh>
            </group>

            <Text
                position={[0, -1.8, 0]}
                fontSize={0.4}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                anchorX="center"
                anchorY="middle"
                color="white"
                outlineWidth={0.02}
                outlineColor="#ff0055"
                visible={!active}
            >
                CONTACT
            </Text>
        </group>
    )
}
