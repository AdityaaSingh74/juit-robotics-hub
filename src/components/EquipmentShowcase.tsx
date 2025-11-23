import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
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
  specs: string[];
  image: string;
  imageAlt: string;
}

const equipment: Equipment[] = [
  {
    title: 'Quadcopter Drone',
    category: 'Aerial Robotics',
    description: 'Professional-grade quadcopter for autonomous flight research, equipped with GPS navigation, obstacle avoidance, and FPV camera. Ideal for aerial mapping and surveillance projects.',
    specs: ['Flight time: 25 minutes', 'Programmable with Python/ROS', '4K camera with gimbal stabilization'],
    image: droneImg,
    imageAlt: 'Quadcopter Drone',
  },
  {
    title: 'Quadruped Robotic Dog',
    category: 'Legged Locomotion',
    description: 'Advanced four-legged robot platform for studying dynamic movement, balance, and terrain adaptation using reinforcement learning.',
    specs: ['12 DOF', 'Real-time gait control', 'IMU sensors'],
    image: roboticDogImg,
    imageAlt: 'Quadruped Robotic Dog',
  },
  {
    title: '6-Axis Robotic Arm',
    category: 'Manipulation & Assembly',
    description: 'Industrial-grade robotic arm for precision manipulation, pick-and-place operations, and assembly automation research.',
    specs: ['6 DOF', '1kg payload', '0.1mm repeatability'],
    image: roboticArmImg,
    imageAlt: 'Robotic Arm',
  },
  {
    title: 'Anthropomorphic Robotic Hand',
    category: 'Dexterous Manipulation',
    description: 'Bio-inspired robotic hand with individually actuated fingers for grasping research and human-robot interaction studies.',
    specs: ['5 fingers', 'Force feedback', 'Adaptive grip'],
    image: roboticHandsImg,
    imageAlt: 'Robotic Hand',
  },
  {
    title: 'Arduino Development Kits',
    category: 'Embedded Systems',
    description: 'Comprehensive Arduino ecosystem with sensors, actuators, and shields for rapid prototyping of robotics projects.',
    specs: ['Multiple boards (Uno, Mega, Nano)', '50+ sensor modules', 'Complete starter kits'],
    image: arduinoImg,
    imageAlt: 'Arduino Kits',
  },
  {
    title: 'NVIDIA Jetson Nano AI Platform',
    category: 'Edge AI Computing',
    description: 'Powerful AI computing platform for computer vision, deep learning inference, and autonomous systems at the edge.',
    specs: ['128 CUDA cores', '4GB RAM', 'TensorFlow/PyTorch support'],
    image: jetsonNanoImg,
    imageAlt: 'Jetson Nano',
  },
];

const ParallaxEquipmentItem = ({ item, index }: { item: Equipment; index: number }) => {
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

const EquipmentShowcase = () => {
  return (
    <section id="equipment" className="py-24 bg-background">
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

        {/* Parallax Equipment Items */}
        <div className="space-y-0">
          {equipment.map((item, index) => (
            <ParallaxEquipmentItem key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EquipmentShowcase;
