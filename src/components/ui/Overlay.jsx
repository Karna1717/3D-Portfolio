import { useStore } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'

export const Overlay = () => {
    const { activeNode, setActiveNode } = useStore()

    // Content Data (Placeholder)
    const content = {
        resume: {
            title: "RESUME",
            subtitle: "Full-Stack Developer",
            text: "EDUCATION:\n• Zeal College of Engineering, Pune (BE, 2026)\n\nEXPERIENCE:\n• Web Dev Intern @ Edunet Foundation (Feb-Mar 2025)\n• Python & Django Trainee @ Rubicon (Feb 2025)\n\nSKILLS:\n• Languages: Java, Python\n• Frameworks/Tools: Node.js, Express, React, Bootstrap, MySQL, MongoDB",
            actionText: "DOWNLOAD RESUME",
            actionLink: "/karan_tathe_resume.pdf"
        },
        projects: {
            title: "PROJECTS",
            subtitle: "Engineering Highlights",
            text: "1. Interactive 3D Portfolio (This Website)\n   • React Three Fiber, Custom Physics, Zustand State.\n   • Integrated Google MediaPipe Machine Learning for real-time webcam hand-tracking.\n\n2. Enterprise Expense Manager\n   • Full-Stack MERN Application (MongoDB, Express, React, Node).\n   • Interactive financial dashboards with automated budget monitoring algorithms.\n\n3. Java Record Management System\n   • Highly reliable backend services utilizing Core Java & JDBC.\n   • Architected with strict OOP patterns for scalability."
        },
        about: {
            title: "ABOUT ME",
            subtitle: "Full-Stack Engineer & Vibe Coder",
            text: "I specialize in both robust backend architectures and deeply immersive 3D frontend experiences.\n\nI consider myself a true 'Vibe Coder' — I believe that great software shouldn't just be functional, it should feel magical. Whether I'm building scalable APIs in Java or writing custom physics engines in React Three Fiber, my goal is to blend deep technical precision with premium, highly-interactive experiences."
        },
        contact: {
            title: "CONTACT",
            subtitle: "Open Frequencies",
            text: "My comm-link is always open. I am actively seeking Software Engineering roles where I can push the boundaries of web technology.",
            links: [
                { icon: "📧", text: "Email Me", url: "mailto:karan.tathe777@gmail.com" },
                { icon: "💼", text: "LinkedIn", url: "https://www.linkedin.com/in/karan-tathe-3aa84a33b" },
                { icon: "💻", text: "GitHub", url: "https://github.com/Karna1717" }
            ]
        }
    }

    const data = activeNode ? content[activeNode] : null

    return (
        <AnimatePresence>
            {activeNode && data && (
                <motion.div
                    className="overlay-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="overlay-content"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <button className="close-btn" onClick={() => setActiveNode(null)}>×</button>
                        <h1>{data.title}</h1>
                        <h3>{data.subtitle}</h3>
                        <p style={{ whiteSpace: 'pre-line', marginBottom: '2rem' }}>{data.text}</p>
                        {data.actionLink && (
                            <a
                                href={data.actionLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resume-download-btn"
                            >
                                {data.actionText} →
                            </a>
                        )}
                        {data.links && (
                            <div className="contact-links-container">
                                {data.links.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="contact-action-btn">
                                        <span className="contact-icon">{link.icon}</span>
                                        <span className="contact-text">{link.text}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
