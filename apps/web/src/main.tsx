import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './shared/providers/ThemeProvider';
import Navbar from './components/ui/Navbar';
import Hero from './components/landing/Hero';
import HowItWorks from './components/landing/HowItWorks';
import WhyChoose from './components/landing/WhyChoose';
import Pricing from './components/landing/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Footer from './components/ui/Footer';
import FinalCTA from './components/landing/FinalCTA';
import BackgroundAnimation from './components/ui/BackgroundAnimation';
import { useEffect } from 'react';

function AppContent() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location])

  return (
    <>
      <BackgroundAnimation show={true} />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <main className="container">
                <Hero />
              </main>
              <HowItWorks />
              <WhyChoose />
              <Pricing />
              <FinalCTA />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <About />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Contact />
            </>
          }
        />
        <Route
          path="/privacy"
          element={
            <>
              <Privacy />
            </>
          }
        />
        <Route
          path="/terms"
          element={
            <>
              <Terms />
            </>
          }
        />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

