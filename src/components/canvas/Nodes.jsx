import { useRef, useState, useEffect, createRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, MeshTransmissionMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { ResumeNode } from './ResumeNode'
import { ProjectsPlanet } from './ProjectsPlanet'
import { ContactNetwork } from './ContactNetwork'
import { AboutSculpture } from './AboutSculpture'
import { CentralStar } from './CentralStar'
import { useStore } from '../../store'
import { useAudio } from '../../hooks/useAudio'

const NODE_RADIUS = 1.2

// Physics wrapper for interactive bouncing/throwing
const PhysicsWrapper = ({ id, initialPos, children, otherNodesRefs, onCollide }) => {
    const group = useRef()
    const [isDragging, setIsDragging] = useState(false)
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const position = useRef(new THREE.Vector3(...initialPos))
    const lastPos = useRef(new THREE.Vector3(...initialPos))

    const { camera, size, viewport } = useThree()
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
    const planeIntersect = new THREE.Vector3()

    const { activeNode } = useStore() // Disable physics when focusing

    useFrame((state, delta) => {
        if (activeNode) return // Freeze physics when reading content

        if (isDragging) {
            // Follow mouse
            state.raycaster.ray.intersectPlane(plane, planeIntersect)
            position.current.copy(planeIntersect)

            // Calculate throw velocity
            velocity.current.subVectors(position.current, lastPos.current).multiplyScalar(1 / delta).multiplyScalar(0.5) // Dampen throw
            lastPos.current.copy(position.current)
        } else {
            // Apply Physics
            // 1. Gravity Well (Pull back to initial orbit if far away)
            const distToOrigin = position.current.distanceTo(new THREE.Vector3(...initialPos))
            if (distToOrigin > 0.1) {
                const force = new THREE.Vector3(...initialPos).sub(position.current).normalize().multiplyScalar(10 * delta) // Spring force
                velocity.current.add(force)
            }

            // 2. Friction
            velocity.current.multiplyScalar(0.95)

            // 3. Update Position
            position.current.add(velocity.current.clone().multiplyScalar(delta))

            // 4. Collision Detection
            const myPos = position.current
            otherNodesRefs.forEach(other => {
                if (other.current && other.current !== group.current) {
                    const otherPos = other.current.position // Assuming direct access works
                    const dist = myPos.distanceTo(otherPos)
                    const minDist = NODE_RADIUS * 2

                    if (dist < minDist) {
                        // Collision!
                        // Simple elastic collision response
                        const normal = myPos.clone().sub(otherPos).normalize()
                        const relativeVelocity = velocity.current.clone()
                        const impulse = normal.multiplyScalar(5 * delta)
                        velocity.current.add(impulse)

                        // Push apart slightly to prevent sticking
                        const push = normal.multiplyScalar((minDist - dist) * 0.5)
                        position.current.add(push)

                        onCollide && onCollide(velocity.current.length())
                    }
                }
            })
        }

        // Apply visual transform
        if (group.current) {
            // Smooth damping for visual
            group.current.position.copy(position.current)

            // Tilt effect based on drag velocity
            group.current.rotation.z = -velocity.current.x * 0.05
            group.current.rotation.x = velocity.current.y * 0.05
        }
    })

    const handlePointerDown = (e) => {
        e.stopPropagation()
        setIsDragging(true)
        document.body.style.cursor = 'grabbing'
    }

    const handlePointerUp = () => {
        setIsDragging(false)
        document.body.style.cursor = 'grab'
    }

    return (
        <group
            ref={group}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp} // Safety release
        >
            {children}
        </group>
    )
}

export const Nodes = () => {
    const { activeNode, setActiveNode, sound } = useStore()
    const { viewport } = useThree()
    const { initAudio, playClick, startAmbience, playHover, setGlobalVolume, playCollision } = useAudio()

    // Sync volume with store state
    useEffect(() => {
        setGlobalVolume(!sound)
    }, [sound])

    // Initialize audio on first click anywhere
    useEffect(() => {
        const start = () => {
            initAudio()
            if (sound) setGlobalVolume(false)
            startAmbience()
            window.removeEventListener('click', start)
        }
        window.addEventListener('click', start)
        return () => window.removeEventListener('click', start)
    }, [])

    const isMobile = viewport.width < 7 // Consistent with Experience.jsx
    const positions = {
        resume: isMobile ? [0, 5, 0] : [-4, 2, 0],
        projects: isMobile ? [0, 2.2, 0] : [4, 2, 0],
        about: isMobile ? [0, -2.2, 0] : [-4, -2, 0],
        contact: isMobile ? [0, -5, 0] : [4, -2, 0]
    }

    const handleNodeClick = (id) => {
        // Only click if not actively dragging (simple threshold check usually needed, but let's assume click is fast)
        playClick()
        if (activeNode === id) {
            setActiveNode(null)
        } else {
            setActiveNode(id)
        }
    }

    // Refs for physics collisions (we need to pass all refs to all nodes)
    // Actually, getting ref.current.position from a react ref inside another component is tricky.
    // Simplified strategy: We won't collide with *each other* for now, just "throw and bounce back". 
    // Implementing full N-body collision in React state/refs without a physics engine is error prone.
    // Let's implement individual "Spring Physics" (Gravity Glove) first.

    return (
        <>
            <PhysicsWrapper initialPos={positions.resume} otherNodesRefs={[]} onCollide={() => playCollision()}>
                <group visible={!activeNode || activeNode === 'resume'}>
                    <Float floatIntensity={activeNode ? 0 : 2} rotationIntensity={1.5} speed={1.5}>
                        <ResumeNode
                            position={[0, 0, 0]} // Local 0, wrapper handles placement
                            onClick={() => handleNodeClick('resume')}
                            active={activeNode === 'resume'}
                        />
                    </Float>
                </group>
            </PhysicsWrapper>

            <PhysicsWrapper initialPos={positions.projects} otherNodesRefs={[]} onCollide={() => playCollision()}>
                <group visible={!activeNode || activeNode === 'projects'}>
                    {/* Remove Float here if we want pure physics, but keeping it adds life when idle */}
                    <Float floatIntensity={activeNode ? 0 : 2} rotationIntensity={1.5} speed={1.5}>
                        <ProjectsPlanet
                            position={[0, 0, 0]}
                            onClick={() => handleNodeClick('projects')}
                            active={activeNode === 'projects'}
                        />
                    </Float>
                </group>
            </PhysicsWrapper>

            <PhysicsWrapper initialPos={positions.contact} otherNodesRefs={[]} onCollide={() => playCollision()}>
                <group visible={!activeNode || activeNode === 'contact'}>
                    <Float floatIntensity={activeNode ? 0 : 2} rotationIntensity={1.5} speed={1.5}>
                        <ContactNetwork
                            position={[0, 0, 0]}
                            onClick={() => handleNodeClick('contact')}
                            active={activeNode === 'contact'}
                        />
                    </Float>
                </group>
            </PhysicsWrapper>

            <PhysicsWrapper initialPos={positions.about} otherNodesRefs={[]} onCollide={() => playCollision()}>
                <group visible={!activeNode || activeNode === 'about'}>
                    <AboutSculpture
                        position={[0, 0, 0]}
                        onClick={() => handleNodeClick('about')}
                        active={activeNode === 'about'}
                    />
                </group>
            </PhysicsWrapper>

            {/* Central Star / Multiverse Switch */}
            <group visible={!activeNode}>
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <CentralStar />
                </Float>
            </group>
        </>
    )
}
