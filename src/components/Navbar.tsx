import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'gallery', label: 'Lab' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'projects', label: 'Projects' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary/95 backdrop-blur-md shadow-lg' : 'bg-primary'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => scrollToSection('home')}
          >
            {/* <!-- LOGO: Replace with juitlogo.png (300x80px recommended) --> */}
            <div className="text-accent text-2xl font-bold">JUIT</div>
            <div className="hidden sm:block text-primary-foreground text-sm font-medium">
              Robotics Lab
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(link.id)}
                className="px-4 py-2 text-primary-foreground hover:text-accent transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </motion.button>
            ))}
            <Link
              to="/admin"
              className="ml-6 btn btn--outline border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary-foreground text-2xl"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary border-t border-accent/20"
          >
            <div className="container-custom py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block w-full text-left px-4 py-3 text-primary-foreground hover:bg-accent/10 hover:text-accent transition-colors rounded"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/admin"
                className="block w-full text-left px-4 py-3 text-accent hover:bg-accent/10 hover:text-accent-foreground transition-colors rounded border-t border-accent/10 mt-4 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
