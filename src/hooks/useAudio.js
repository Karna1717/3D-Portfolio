// Singleton Audio Context Module
let audioContext = null
let masterGain = null
let bgmSource = null

export const useAudio = () => {

  const initAudio = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      masterGain = audioContext.createGain()
      masterGain.gain.value = 0.4
      masterGain.connect(audioContext.destination)
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  }

  const setGlobalVolume = (muted) => {
      if (masterGain && audioContext) {
          const target = muted ? 0 : 0.4
          masterGain.gain.setTargetAtTime(target, audioContext.currentTime, 0.2)
      }
  }

  const playHover = () => {
    // Disabled per user request
    return 
    /*
    if (!audioContext) return
    const t = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.frequency.setValueAtTime(800, t)
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05)
    gain.gain.setValueAtTime(0.05, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(t + 0.1)
    */
  }

  const playClick = () => {
    if (!audioContext) initAudio()
    const t = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(200, t)
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.4)
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(t + 0.4)
  }

  // --- REAL AUDIO FILE LOADER ---
  const startAmbience = async () => {
      if (!audioContext) initAudio()
      if (bgmSource) return // Already playing

      try {
          // Attempt to load the file
          // NOTE TO USER: Place your mp3 file at public/audio/cornfield.mp3
          const response = await fetch('/audio/cornfield.mp3')
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          bgmSource = audioContext.createBufferSource()
          bgmSource.buffer = audioBuffer
          bgmSource.loop = true // Loop the track
          
          // Connect to gain node (volume control)
          const musicGain = audioContext.createGain()
          musicGain.gain.value = 0.8 // Adjust mix
          
          bgmSource.connect(musicGain)
          musicGain.connect(masterGain)
          
          bgmSource.start(0)
      } catch (e) {
          console.error("Audio Load Failed. Please ensure 'public/audio/cornfield.mp3' exists.", e)
          // Fallback to drone if file not found?
      }
  }

  // Metallic Collision Sound (Procedural Clank)
  const playCollision = (velocity = 1) => {
      if (!audioContext) initAudio()
      
      const t = audioContext.currentTime
      
      // 1. Metal Ring (High Sine Decay)
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1200 + Math.random() * 500, t) // High pitch
      gain.gain.setValueAtTime(0.1 * velocity, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(t)
      osc.stop(t + 0.5)

      // 2. Impact (Low Noise Burst)
      const bufferSize = audioContext.sampleRate * 0.1
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() - 0.5) * 2
      }
      
      const noise = audioContext.createBufferSource()
      noise.buffer = buffer
      const noiseGain = audioContext.createGain()
      noiseGain.gain.setValueAtTime(0.3 * velocity, t)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      
      noise.connect(noiseGain)
      noiseGain.connect(masterGain)
      noise.start(t)
  }

  return { initAudio, playHover, playClick, startAmbience, setGlobalVolume, playCollision }
}
