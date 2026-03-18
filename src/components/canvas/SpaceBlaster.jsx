import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useHandTracking } from '../../hooks/useHandTracking'
import { useStore } from '../../store'
import { useAudio } from '../../hooks/useAudio'

const Explosion = ({ position }) => {
    // Improved particle burst
    const particles = useMemo(() => {
        return new Array(15).fill(0).map(() => ({
            velocity: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10],
            color: Math.random() > 0.5 ? 'orange' : 'red',
            size: Math.random() * 0.3 + 0.1
        }))
    }, [])

    return (
        <group position={position}>
            <Flash />
            {particles.map((p, i) => (
                <ExplosionParticle key={i} {...p} />
            ))}
        </group>
    )
}

const Flash = () => {
    const ref = useRef()
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.scale.multiplyScalar(1.0 + delta * 5)
            ref.current.material.opacity = Math.max(0, ref.current.material.opacity - delta * 4)
        }
    })
    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="white" transparent opacity={1} />
        </mesh>
    )
}

const ExplosionParticle = ({ velocity, color, size }) => {
    const ref = useRef()
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.add(new THREE.Vector3(...velocity).multiplyScalar(delta))
            ref.current.scale.multiplyScalar(0.92) // Fade out
            ref.current.rotation.x += delta * 5
            ref.current.rotation.y += delta * 5
        }
    })
    return (
        <mesh ref={ref}>
            <dodecahedronGeometry args={[size, 0]} />
            <meshBasicMaterial color={color} />
        </mesh>
    )
}

const Starfighter = ({ shipRef }) => {
    return (
        <group ref={shipRef} rotation={[0, Math.PI, 0]}>
            <group rotation={[Math.PI / 2, 0, 0]} scale={[0.6, 0.6, 0.6]}>
                {/* Main Body */}
                <mesh position={[0, 0, 0]}>
                    <coneGeometry args={[0.3, 1.2, 8]} />
                    <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Wings */}
                <mesh position={[0, -0.2, -0.2]} scale={[2.5, 0.1, 1]}>
                    <boxGeometry />
                    <meshStandardMaterial color="#a0a0ff" metalness={0.6} />
                </mesh>
                {/* Engines */}
                <mesh position={[0.4, -0.4, 0]}>
                    <cylinderGeometry args={[0.1, 0.15, 0.4]} />
                    <meshBasicMaterial color="cyan" />
                </mesh>
                <mesh position={[-0.4, -0.4, 0]}>
                    <cylinderGeometry args={[0.1, 0.15, 0.4]} />
                    <meshBasicMaterial color="cyan" />
                </mesh>
                {/* Cockpit */}
                <mesh position={[0, 0.2, 0.2]}>
                    <boxGeometry args={[0.2, 0.4, 0.3]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            </group>
        </group>
    )
}

const Laser = ({ data }) => {
    const ref = useRef()
    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(data.position)
        }
    })
    return (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
            <meshBasicMaterial color="#00ff00" />
            <pointLight distance={3} intensity={2} color="#00ff00" />
        </mesh>
    )
}

const Lasers = ({ lasers }) => {
    return (
        <group>
            {lasers.map((l) => (
                <Laser key={l.id} data={l} />
            ))}
        </group>
    )
}

const Asteroid = ({ data }) => {
    const ref = useRef()
    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(data.position)
            ref.current.rotation.x = data.rotX
            ref.current.rotation.y = data.rotY
        }
    })
    return (
        <mesh ref={ref}>
            <dodecahedronGeometry args={[data.scale, 0]} />
            <meshStandardMaterial
                color="#b0c4de"
                emissive="#334455"
                roughness={0.8}
                metalness={0.2}
                flatShading
            />
        </mesh>
    )
}

const Asteroids = ({ asteroids }) => {
    return (
        <group>
            {asteroids.map((a) => (
                <Asteroid key={a.id} data={a} />
            ))}
        </group>
    )
}

const Mine = ({ data }) => {
    const ref = useRef()
    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(data.position)
        }
    })
    return (
        <mesh ref={ref} scale={data.scale || 1}>
            <icosahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="red" emissive="#ff0000" emissiveIntensity={2} roughness={0} metalness={1} />
        </mesh>
    )
}

const Mines = ({ mines }) => {
    return (
        <group>
            {mines.map((m) => (
                <Mine key={m.id} data={m} />
            ))}
        </group>
    )
}

export const SpaceBlaster = () => {
    const { getHandData } = useHandTracking()
    const { score, setScore, incrementScore, setGameMode, difficulty, setDifficulty } = useStore()
    const { playCollision, playClick } = useAudio()
    const { viewport } = useThree()
    const isMobile = viewport.width < 7

    const shipRef = useRef()
    const [lasers, setLasers] = useState([])
    const [asteroids, setAsteroids] = useState([])
    const [mines, setMines] = useState([])
    const [explosions, setExplosions] = useState([]) // { id, position, time }
    const [gameOver, setGameOver] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)

    const lasersRef = useRef([])
    const asteroidsRef = useRef([])
    const minesRef = useRef([])
    const explosionsRef = useRef([])
    const lastPinch = useRef(false)
    const lastSpawn = useRef(0)
    const lastMineSpawn = useRef(0)
    const isMouseDown = useRef(false)

    useEffect(() => {
        setScore(0)
        const handleDown = () => isMouseDown.current = true
        const handleUp = () => isMouseDown.current = false

        window.addEventListener('mousedown', handleDown)
        window.addEventListener('mouseup', handleUp)
        window.addEventListener('touchstart', handleDown)
        window.addEventListener('touchend', handleUp)

        return () => {
            window.removeEventListener('mousedown', handleDown)
            window.removeEventListener('mouseup', handleUp)
            window.removeEventListener('touchstart', handleDown)
            window.removeEventListener('touchend', handleUp)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useFrame((state, delta) => {
        if (gameOver) return

        // Idle Animation before start
        if (!gameStarted) {
            if (shipRef.current) {
                shipRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1
                shipRef.current.rotation.x = Math.cos(state.clock.elapsedTime) * 0.1
            }
            return
        }

        const { x, y, isPinching, available } = getHandData()

        let targetX = 0, targetY = 0
        let firing = false

        if (available) {
            targetX = x * 10
            targetY = y * 6
            firing = isPinching
        } else {
            // Mouse/Touch fallback
            // Adjust sensitivity based on device
            const sensitivtyX = isMobile ? 6 : 10
            const sensitivtyY = isMobile ? 8 : 6

            targetX = (state.pointer.x) * sensitivtyX
            targetY = (state.pointer.y) * sensitivtyY
            firing = isMouseDown.current
        }

        // 1. Ship Movement with Tilt
        if (shipRef.current) {
            shipRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), 0.1)

            // Banking (Tilt) effect
            shipRef.current.rotation.z = (shipRef.current.position.x - targetX) * 0.5
            shipRef.current.rotation.x = (shipRef.current.position.y - targetY) * 0.2
        }

        // 2. Shooting
        if (firing && !lastPinch.current) {
            playClick()
            const startPos = shipRef.current ? shipRef.current.position.clone() : new THREE.Vector3()

            // Adjust spawn position for mobile scaling
            if (isMobile) {
                startPos.multiplyScalar(0.25)
            }

            startPos.z -= 1.5
            // Dual laser Logic
            lasersRef.current.push({ id: Date.now() + 'L', position: startPos.clone().add(new THREE.Vector3(0.4, 0, 0)) })
            lasersRef.current.push({ id: Date.now() + 'R', position: startPos.clone().add(new THREE.Vector3(-0.4, 0, 0)) })
            setLasers([...lasersRef.current]) // Trigger Render for new laser
        }
        lastPinch.current = firing

        // 3. Move Lasers
        lasersRef.current.forEach(l => {
            l.position.z -= 40 * delta // Faster lasers
        })
        const preLaserCount = lasersRef.current.length
        lasersRef.current = lasersRef.current.filter(l => l.position.z > -50)
        if (lasersRef.current.length !== preLaserCount) setLasers([...lasersRef.current]) // Trigger render for removal

        // 4. Spawn Asteroids
        const spawnRate = difficulty === 0 ? 1.5 : (difficulty === 1 ? 1.0 : 0.5)
        if (state.clock.elapsedTime - lastSpawn.current > spawnRate) { // Difficulty based spawn
            const spawnX = (Math.random() - 0.5) * (isMobile ? 10 : 20) // Narrower spawn on mobile
            const spawnY = (Math.random() - 0.5) * 12
            asteroidsRef.current.push({
                id: Date.now(),
                position: new THREE.Vector3(spawnX, spawnY, -60),
                scale: (0.5 + Math.random() * 0.8) * (isMobile ? 0.6 : 1), // Smaller asteroids on mobile
                rotX: Math.random() * Math.PI,
                rotY: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 2
            })
            setAsteroids([...asteroidsRef.current]) // Trigger render
            lastSpawn.current = state.clock.elapsedTime
        }

        // 4b. Spawn Mines
        if (state.clock.elapsedTime - lastMineSpawn.current > 3.0) {
            if (Math.random() > 0.4) {
                minesRef.current.push({
                    id: Date.now() + 'M',
                    position: new THREE.Vector3((Math.random() - 0.5) * (isMobile ? 8 : 15), (Math.random() - 0.5) * 8, -60),
                    scale: isMobile ? 0.6 : 1 // Add scale property to mine data
                })
                setMines([...minesRef.current]) // Trigger render
            }
            lastMineSpawn.current = state.clock.elapsedTime
        }

        // 5. Move & Rotate Asteroids
        // Calculate dynamic speed based on difficulty and score
        const baseSpeed = difficulty === 0 ? 15 : (difficulty === 1 ? 25 : 40)
        const scoreBonus = Math.floor(score / 1000) * 5
        const currentAsteroidSpeed = baseSpeed + scoreBonus

        asteroidsRef.current.forEach(a => {
            a.position.z += (currentAsteroidSpeed + (Math.random() * 5)) * delta
            a.rotX += a.rotSpeed * delta
            a.rotY += a.rotSpeed * delta
        })

        minesRef.current.forEach(m => {
            m.position.z += 8 * delta
            if (shipRef.current) {
                // Homing
                const dir = shipRef.current.position.clone().sub(m.position).normalize()
                m.position.add(dir.multiplyScalar(4 * delta))
            }
        })

        // 6. Collision & Explosions
        let hit = false
        const survivingAsteroids = []
        const survivingMines = []

        // Remove old explosions
        const now = state.clock.elapsedTime
        explosionsRef.current = explosionsRef.current.filter(e => now - e.time < 0.5)

        asteroidsRef.current.forEach(asteroid => {
            let destroyed = false

            lasersRef.current.forEach((laser, lIdx) => {
                if (laser.position.distanceTo(asteroid.position) < asteroid.scale + 0.5) {
                    destroyed = true
                    lasersRef.current.splice(lIdx, 1) // Bullet absorbed
                    hit = true
                }
            })

            if (shipRef.current && shipRef.current.position.distanceTo(asteroid.position) < 0.8) {
                destroyed = true
                playCollision(3)
                setGameOver(true)
            }

            if (asteroid.position.z > 5) destroyed = true

            if (destroyed && hit) {
                // Add explosion
                explosionsRef.current.push({ id: Date.now() + Math.random(), position: asteroid.position.clone(), time: now })
            }

            if (!destroyed) survivingAsteroids.push(asteroid)
        })

        minesRef.current.forEach(mine => {
            let destroyed = false
            lasersRef.current.forEach((laser, lIdx) => {
                if (laser.position.distanceTo(mine.position) < 1.0) {
                    destroyed = true
                    lasersRef.current.splice(lIdx, 1)
                    hit = true
                }
            })
            if (shipRef.current && shipRef.current.position.distanceTo(mine.position) < 0.8) {
                destroyed = true
                playCollision(3)
                setGameOver(true)
            }
            if (mine.position.z > 5) destroyed = true

            if (destroyed && hit) {
                explosionsRef.current.push({ id: Date.now() + Math.random(), position: mine.position.clone(), time: now })
            }
            if (!destroyed) survivingMines.push(mine)
        })

        if (asteroidsRef.current.length !== survivingAsteroids.length) {
            asteroidsRef.current = survivingAsteroids
            setAsteroids([...asteroidsRef.current])
        }

        if (minesRef.current.length !== survivingMines.length) {
            minesRef.current = survivingMines
            setMines([...minesRef.current])
        }

        if (hit) {
            incrementScore()
            playCollision(0.8)
            setLasers([...lasersRef.current]) // Lasers also removed
        }

        // Update explosions if time expired
        const prevExplosions = explosionsRef.current.length
        // (Removal logic was done at start of loop, we just need to ensure sync)
        if (explosions.length !== explosionsRef.current.length) {
            setExplosions([...explosionsRef.current])
        } else if (hit && explosionsRef.current.length !== prevExplosions) {
            setExplosions([...explosionsRef.current])
        }
    })

    return (
        <group>
            {/* Scale down ship on mobile */}
            <group scale={isMobile ? 0.25 : 1}>
                <Starfighter shipRef={shipRef} />
            </group>
            <Lasers lasers={lasers} />
            <Asteroids asteroids={asteroids} />
            <Mines mines={mines} />

            {/* Render Explosions */}
            {explosions.map(e => (
                <Explosion key={e.id} position={e.position} />
            ))}

            {/* HUD */}
            <group position={[0, isMobile ? 6 : 0, -5]}>
                {/* Push HUD higher on mobile so it clears the game area */}
                <Text position={[0, 4, 0]} color="#00ff00" fontSize={isMobile ? 0.3 : 0.8}>
                    SCORE: {score}
                </Text>
                <Text position={[0, -4, 0]} color="red" fontSize={isMobile ? 0.15 : 0.3} onClick={() => setGameMode(false)}>
                    EXIT MISSION
                </Text>
            </group>

            {/* Difficulty Slider UI */}
            {/* Difficulty Slider UI */}
            {/* Difficulty Slider UI */}
            {gameStarted && !gameOver && (
                <Html>
                    <div className="difficulty-panel">
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', textShadow: '0 0 5px #00ff00' }}>
                            THREAT LEVEL
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="1"
                            value={difficulty}
                            onChange={(e) => setDifficulty(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                cursor: 'pointer',
                                accentColor: '#00ff00',
                                marginBottom: '5px'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7em', textTransform: 'uppercase' }}>
                            <span style={{ color: difficulty >= 0 ? 'white' : '#444' }}>Low</span>
                            <span style={{ color: difficulty >= 1 ? 'yellow' : '#444' }}>Med</span>
                            <span style={{ color: difficulty >= 2 ? 'red' : '#444' }}>High</span>
                        </div>
                    </div>
                </Html>
            )}


            {/* Mission Briefing Overlay */}
            {
                !gameStarted && !gameOver && (
                    <Html center>
                        <div className="mission-briefing">
                            <h1 style={{ fontSize: '2.5em', margin: '0 0 20px 0', textShadow: '0 0 10px #00ff00' }}>MISSION BRIEFING</h1>

                            <div className="mission-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', textAlign: 'left' }}>
                                <div style={{ borderRight: isMobile ? 'none' : '1px solid rgba(0,255,0,0.3)', paddingRight: '10px' }}>
                                    <h3 style={{ borderBottom: '1px solid #00ff00', paddingBottom: '10px' }}>
                                        {isMobile ? '📱 TOUCH CONTROL' : '👋 HAND CONTROL'}
                                    </h3>
                                    <p><strong>MOVE:</strong> {isMobile ? 'Drag Finger' : 'Open Hand'}</p>
                                    <p><strong>FIRE:</strong> {isMobile ? 'Tap/Hold' : 'Pinch Fingers'}</p>
                                </div>
                                <div>
                                    <h3 style={{ borderBottom: '1px solid #00ff00', paddingBottom: '10px' }}>🖱️ MOUSE CONTROL</h3>
                                    <p><strong>MOVE:</strong> Cursor Position</p>
                                    <p><strong>FIRE:</strong> Click Left Button</p>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.9em', color: '#aaffaa', marginBottom: '30px' }}>
                                OBJECTIVE: Destroy asteroids and mines. Survive as long as possible.
                            </div>

                            <button
                                onClick={() => setGameStarted(true)}
                                className="ui-button"
                                style={{
                                    fontSize: '1.2em',
                                    padding: '15px 40px',
                                    fontWeight: 'bold',
                                    background: '#003300',
                                    border: '1px solid #00ff00',
                                    color: '#00ff00'
                                }}
                            >
                                LAUNCH MISSION
                            </button>
                        </div>
                    </Html>
                )
            }

            {
                gameOver && (
                    <Html center>
                        <div className="game-over-panel">
                            <h1 style={{ fontSize: '3em', margin: 0, textShadow: '0 0 10px red' }}>GAME OVER</h1>
                            <p style={{ fontSize: '1.5em' }}>SCORE: {score}</p>
                            <button
                                onPointerDown={() => {
                                    setGameOver(false)
                                    setScore(0)
                                    setLasers([])
                                    setAsteroids([])
                                    setMines([])
                                    setExplosions([])
                                    asteroidsRef.current = []
                                    minesRef.current = []
                                    lasersRef.current = []
                                    explosionsRef.current = []
                                }}
                                className="ui-button"
                                style={{
                                    padding: '15px 30px',
                                    fontSize: '1.2em',
                                    background: 'red',
                                    border: 'none',
                                    color: 'white',
                                    marginTop: '20px',
                                    pointerEvents: 'auto'
                                }}>
                                RESTART MISSION
                            </button>
                        </div>
                    </Html>
                )
            }
        </group >
    )
}
