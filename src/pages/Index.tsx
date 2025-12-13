import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import EquipmentShowcase from '@/components/EquipmentShowcase';
import FacilitiesParallax from '@/components/FacilitiesParallax';
import Faculty from '@/components/Faculty';
import ProjectForm from '@/components/ProjectForm';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <EquipmentShowcase />
      <FacilitiesParallax />
      <Faculty />
      <ProjectForm />
      <Footer />
    </div>
  );
};

export default Index;
