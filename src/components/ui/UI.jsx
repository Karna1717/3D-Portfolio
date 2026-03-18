import React from 'react'
import { motion } from 'framer-motion'
import './UI.css'
import { useStore } from '../../store'

export const UI = () => {
    const { sound, toggleSound, gameMode, setGameMode } = useStore()

    return (
        <main className="ui-container">
            <header className="header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="logo"
                >
                    KARAN TATHE
                </motion.div>
                <nav className="nav">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        style={{ display: 'flex', gap: '2rem', pointerEvents: 'auto' }}
                    >
                        <span></span>
                        <button onClick={toggleSound} className="ui-button">
                            SOUND: {sound ? 'ON' : 'OFF'}
                        </button>
                        <button onClick={() => setGameMode(!gameMode)} className="ui-button game-button">
                            GAME: {gameMode ? 'STOP' : 'START'}
                        </button>
                    </motion.div>
                </nav>
            </header>

            <footer className="footer">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="helper-text"
                >
                    Explore the Ecosystem
                </motion.div>
            </footer>
        </main>
    )
}
