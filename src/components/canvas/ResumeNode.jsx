import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { useAudio } from '../../hooks/useAudio'

export const ResumeNode = ({ position, onClick, active }) => {
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
            mesh.current.rotation.x += delta * 0.2
            mesh.current.rotation.y += delta * 0.3

            const targetScale = hovered || active ? 1.2 : 1
            easing.damp3(mesh.current.scale, targetScale, 0.1, delta)
        }
    })

    return (
        <group position={position}>
            {/* The Crystal */}
            <mesh
                ref={mesh}
                onClick={onClick}
                onPointerOver={handlePointerOver}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
            >
                <icosahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={2}
                    chromaticAberration={0.5}
                    anisotropy={0.3}
                    distortion={hovered ? 0.8 : 0.4}
                    distortionScale={0.4}
                    temporalDistortion={0.1}
                    iridescence={1}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    color="#00ffff"
                    resolution={512}
                />
            </mesh>

            <Text
                position={[0, -1.8, 0]}
                fontSize={0.4}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                anchorX="center"
                anchorY="middle"
                color="white"
                outlineWidth={0.02}
                outlineColor="#00ffff"
                visible={!active}
            >
                RESUME
            </Text>
        </group>
    )
}
