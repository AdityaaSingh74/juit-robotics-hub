import { motion } from 'framer-motion';
import { useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
// REPLACE: All equipment images below
import droneImg from '@/assets/drone.jpg';
import roboticDogImg from '@/assets/robotic-dog.jpg';
import roboticArmImg from '@/assets/robotic-arm.jpg';
import roboticHandsImg from '@/assets/robotic-hands.jpg';
import arduinoImg from '@/assets/arduino.jpg';
import jetsonNanoImg from '@/assets/jetson-nano.jpg';

interface Equipment {
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
}

const EquipmentShowcase = () => {
  const [api, setApi] = useState<any>();

  const equipment: Equipment[] = [
    {
      // REPLACE: Equipment details and image
      title: 'Professional Quadcopter Drone',
      category: 'Aerial Robotics',
      description: 'Advanced autonomous flight platform with GPS navigation, obstacle avoidance, and high-resolution FPV camera for aerial research and mapping projects.',
      image: droneImg,
      imageAlt: 'Quadcopter Drone',
    },
    {
      // REPLACE: Equipment details and image
      title: 'Quadruped Robotic Dog',
      category: 'Bio-Inspired Robotics',
      description: 'State-of-the-art four-legged robot for studying dynamic locomotion, terrain adaptation, and advanced gait control using machine learning.',
      image: roboticDogImg,
      imageAlt: 'Robotic Dog',
    },
    {
      // REPLACE: Equipment details and image
      title: 'Industrial 6-Axis Robotic Arm',
      category: 'Robotic Manipulation',
      description: 'Precision industrial arm for assembly automation, pick-and-place operations, and advanced manipulation research with sub-millimeter accuracy.',
      image: roboticArmImg,
      imageAlt: 'Robotic Arm',
    },
    {
      // REPLACE: Equipment details and image
      title: 'Anthropomorphic Robotic Hand',
      category: 'Dexterous Manipulation',
      description: 'Human-inspired robotic hand with individual finger actuation, force feedback sensors, and adaptive grasping capabilities for HRI studies.',
      image: roboticHandsImg,
      imageAlt: 'Robotic Hand',
    },
    {
      // REPLACE: Equipment details and image
      title: 'Arduino Development Ecosystem',
      category: 'Embedded Systems',
      description: 'Complete Arduino prototyping platform with 50+ sensors, actuators, and development boards for rapid robotics project development.',
      image: arduinoImg,
      imageAlt: 'Arduino Kits',
    },
    {
      // REPLACE: Equipment details and image
      title: 'NVIDIA Jetson Nano AI Platform',
      category: 'Edge AI Computing',
      description: 'Powerful edge AI computing platform with GPU acceleration for computer vision, deep learning, and autonomous systems development.',
      image: jetsonNanoImg,
      imageAlt: 'Jetson Nano',
    },
  ];

  return (
    <section id="equipment" className="py-24 bg-secondary/30">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gold-underline inline-block">Our Facilities</h2>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            State-of-the-art robotics equipment available for innovative research and learning
          </p>
        </motion.div>

        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent>
            {equipment.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-2"
                >
                  <div className="bg-card rounded-xl shadow-lg overflow-hidden h-full flex flex-col card-hover">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      {/* REPLACE: Equipment image above if needed */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-md">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center gap-4 mt-8">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default EquipmentShowcase;
