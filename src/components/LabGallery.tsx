import { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import heroBg from '@/assets/hero-bg.jpg';

const LabGallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Using hero image as placeholder for gallery images
  // <!-- LABIMG1 to LABIMG9: Various lab views (1200x800px each) -->
  const images = Array(9).fill(heroBg);

  const captions = [
    'Main Workspace View',
    'Equipment Closeup',
    'Team at Work',
    'Research in Progress',
    'Workshop Area',
    'Testing Zone',
    'Student Projects',
    'Lab Event',
    'Facility Overview',
  ];

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  return (
    <section id="gallery" className="py-24 bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gold-underline inline-block">Explore Our Facility</h2>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg card-hover"
            >
              <img
                src={img}
                alt={captions[index]}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-primary-foreground text-lg font-semibold text-center px-4">
                  {captions[index]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={photoIndex}
        slides={images.map((src, i) => ({ src, alt: captions[i] }))}
      />
    </section>
  );
};

export default LabGallery;
