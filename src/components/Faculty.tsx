import { motion } from 'framer-motion';
import { FaLinkedin } from 'react-icons/fa';

interface FacultyMember {
  name: string;
  designation: string;
  specialization: string;
  linkedin: string;
  image: string;
}

const Faculty = () => {
  // <!-- PROFIMG1 to PROFIMG4: Professional headshots (400x400px, circular crop) -->
  const faculty: FacultyMember[] = [
    {
      name: 'Dr. Aman Kumar',
      designation: 'Associate Professor & Lab Director',
      specialization: 'Autonomous Systems',
      linkedin: 'https://linkedin.com/in/placeholder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    {
      name: 'Dr. Bagal Singh',
      designation: 'Assistant Professor',
      specialization: 'Robotic Manipulation',
      linkedin: 'https://linkedin.com/in/placeholder',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    },
    {
      name: 'Dr. Raiv Sharma',
      designation: 'Assistant Professor',
      specialization: 'Computer Vision & AI',
      linkedin: 'https://linkedin.com/in/placeholder',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    },
    {
      name: 'Priya Verma',
      designation: 'Student Coordinator',
      specialization: 'Lab Management',
      linkedin: 'https://linkedin.com/in/placeholder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
  ];

  return (
    <section id="faculty" className="py-24 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gold-underline inline-block">Meet Our Team</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {faculty.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 text-center card-hover"
            >
              <div className="mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-accent/20"
                />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">{member.designation}</p>
              <p className="text-sm text-foreground/70 mb-4">{member.specialization}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-full transition-colors"
                aria-label={`LinkedIn profile of ${member.name}`}
              >
                <FaLinkedin size={20} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faculty;
