import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { DashboardPage } from './components/DashboardPage';
import { ThemeProvider } from './components/ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');
  const [isRecording, setIsRecording] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([
    { id: '1', name: 'Teacher Device', status: 'connected', type: 'teacher', audioLevel: 0 }
  ]);
  const [hasRecordingData, setHasRecordingData] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate audio levels
    const interval = setInterval(() => {
      setConnectedDevices(prev => prev.map(device => ({
        ...device,
        audioLevel: Math.random() * 100
      })));
    }, 100);
    return () => clearInterval(interval);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecordingData(true);
    setConnectedDevices(prev => prev.map(device => ({
      ...device,
      audioLevel: 0
    })));
  };

  const handleAddDevice = (deviceName: string) => {
    const newDevice = {
      id: Date.now().toString(),
      name: deviceName,
      status: 'connected' as const,
      type: 'student' as const,
      audioLevel: 0
    };
    setConnectedDevices([...connectedDevices, newDevice]);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Animated background grid */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Gradient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-600/30 dark:bg-purple-500/20 rounded-full blur-[120px]"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-600/30 dark:bg-pink-500/20 rounded-full blur-[120px]"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/20 dark:bg-cyan-500/20 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <HomePage
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onNavigateToDashboard={() => setCurrentPage('dashboard')}
                connectedDevices={connectedDevices}
                onAddDevice={handleAddDevice}
                hasRecordingData={hasRecordingData}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <DashboardPage
                onNavigateToHome={() => setCurrentPage('home')}
                hasRecordingData={hasRecordingData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}
