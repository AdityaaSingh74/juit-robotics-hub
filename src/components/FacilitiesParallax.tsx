import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
// REPLACE: All facility images below
import droneImg from '@/assets/Drone1.jpeg';
import roboticDogImg from '@/assets/RoboDog2.jpg';
import roboticArmImg from '@/assets/RoboHandKit.jpeg';
import roboticHandsImg from '@/assets/robotic-arm.jpg';
import arduinoImg from '@/assets/ArdinoMotor.png';
import jetsonNanoImg from '@/assets/JetsonNano.png';

interface Facility {
  title: string;
  category: string;
  description: string;
  specs: string[];
  image: string;
  imageAlt: string;
}

const facilities: Facility[] = [
  {
    title: 'Quadruped Robotic Dog',
    category: 'Legged Locomotion',
    description: 'Advanced four-legged robot platform for studying dynamic movement, balance, and terrain adaptation using reinforcement learning.',
    specs: ['12 DOF', 'Real-time gait control', 'IMU sensors'],
    image: roboticDogImg,
    imageAlt: 'Quadruped Robotic Dog',
  },
  {
    // REPLACE: Facility details and image
    title: 'Quadcopter Drone',
    category: 'Aerial Robotics',
    description: 'Lightweight quadcopter for autonomous flight experiments, featuring GPS and an FPV camera. Suited for student projects in aerial imaging and navigation.',
    specs: ['Light weight', 'Attachments Editable', 'HD Camera for ariel imaging'],
    image: droneImg,
    imageAlt: 'Quadcopter Drone',
  },
  {
    // REPLACE: Facility details and image
    title: 'Robotic Arm Kit',
    category: 'Learning & Assembly',
    description: 'Learning-grade robotic kit for pick-and-place operations, and assembly automation research.',
    specs: ['Programable on Ardiuno', '6-axis movment', 'Claw gripper'],
    image: roboticArmImg,
    imageAlt: 'Robotic Arm',
  },
  {
    // REPLACE: Facility details and image
    title: '3D Printer (FDM)',
    category: 'Additive Manufacturing',
    description: '3D printer for rapid prototyping and fabrication of mechanical parts, enclosures, and functional models.',
    specs: ['Build volume: 220 × 220 × 250 mm', 'Layer resolution: 0.1–0.3 mm', 'Materials: PLA, PETG, TPU'],
    image: roboticHandsImg,
    imageAlt: 'Robotic Hand',
  },
  {
    // REPLACE: Facility details and image
    title: 'Arduino Development Kits',
    category: 'Embedded Systems',
    description: 'Comprehensive Arduino ecosystem with sensors, actuators, and shields for rapid prototyping of robotics projects.',
    specs: ['Multiple boards (Uno, Mega, Nano)', '50+ sensor modules', 'Complete starter kits'],
    image: arduinoImg,
    imageAlt: 'Arduino Kits',
  },
  {
    // REPLACE: Facility details and image
    title: 'NVIDIA Jetson Nano AI Platform',
    category: 'Edge AI Computing',
    description: 'Powerful AI computing platform for computer vision, deep learning inference, and autonomous systems at the edge.',
    specs: ['128 CUDA cores', '4GB RAM', 'TensorFlow/PyTorch support'],
    image: jetsonNanoImg,
    imageAlt: 'Jetson Nano',
  },
];

const ParallaxFacilityItem = ({ item, index }: { item: Facility; index: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-32 ${
        isEven ? '' : 'md:direction-rtl'
      }`}
    >
      {/* Image */}
      <motion.div
        style={{ y: imageY }}
        className={`parallax-item ${isEven ? '' : 'md:order-2'}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative group overflow-hidden rounded-2xl shadow-xl"
        >
          <img
            src={item.image}
            alt={item.imageAlt}
            className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
          />
          {/* REPLACE: Facility image above if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className={`parallax-item ${isEven ? '' : 'md:order-1'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold">
            {item.category}
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-primary">{item.title}</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">{item.description}</p>
          <ul className="space-y-2">
            {item.specs.map((spec, i) => (
              <li key={i} className="flex items-start">
                <span className="text-accent mr-2">✓</span>
                <span className="text-foreground">{spec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

const FacilitiesParallax = () => {
  return (
    <section id="facilities-parallax" className="py-24 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="section-title gold-underline inline-block">Our Robotics Resources</h2>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            Cutting-edge equipment and projects available for student innovation
          </p>
        </motion.div>

        {/* Parallax Facility Items */}
        <div className="space-y-0">
          {facilities.map((item, index) => (
            <ParallaxFacilityItem key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesParallax;
