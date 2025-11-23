import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const stats = [
    { number: '50+', label: 'Projects Completed' },
    { number: '25+', label: 'Research Papers' },
    { number: '100+', label: 'Active Members' },
  ];

  return (
    <section id="about" ref={ref} className="py-24 bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gold-underline inline-block">About the Lab</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg text-foreground/90 leading-relaxed">
              The JUIT Robotics & Automation Lab is a cutting-edge research facility dedicated to advancing robotics technology. Our lab focuses on autonomous systems, human-robot interaction, and industrial automation, providing students with hands-on experience in the latest robotics innovations.
            </p>
            <p className="text-lg text-foreground/90 leading-relaxed">
              We foster a collaborative environment where students and faculty work together on groundbreaking projects, from aerial robotics and legged locomotion to dexterous manipulation and AI-powered edge computing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <p className="text-lg text-foreground/90 leading-relaxed">
              Our state-of-the-art equipment includes professional drones, quadruped robots, robotic arms, and AI development platforms, enabling students to explore various aspects of robotics and automation.
            </p>
            <p className="text-lg text-foreground/90 leading-relaxed">
              The lab serves as an innovation hub, encouraging students to transform their ideas into reality through comprehensive support, mentorship, and access to world-class facilities.
            </p>
          </motion.div>
        </div>

        {/* Statistics */}
        <div className="grid sm:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center card-hover"
            >
              <div className="text-5xl font-bold text-accent mb-2">{stat.number}</div>
              <div className="text-lg text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
