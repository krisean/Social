import BackgroundAnimation from '../ui/BackgroundAnimation'
import Navbar from '../ui/Navbar'
import Footer from '../ui/Footer'

interface PageLayoutProps {
  children: React.ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <BackgroundAnimation show={true} />
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}
