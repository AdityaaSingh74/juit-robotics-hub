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
  // REPLACE: Professional faculty photos (400x400px, circular crop recommended)
  const faculty: FacultyMember[] = [
    {
      // REPLACE: Faculty member 1 details
      name: 'Dr. Aman Sharma',
      designation: 'Assistant Professor (Senior Grade)',
      specialization: 'Autonomous Systems & Robotics',
      // REPLACE: LinkedIn profile URL
      linkedin: 'https://www.linkedin.com/in/dr-aman-sharma-9186485b',
      // REPLACE: Faculty member 1 photo
      image: '/AmanSir.jpeg',
    },
    {
      // REPLACE: Faculty member 2 details
      name: 'Dr. Shruti Jain',
      designation: 'Associate Dean (Inn) and Professor',
      specialization: 'Computer Vision & Machine Learning',
      // REPLACE: LinkedIn profile URL
      linkedin: 'https://www.linkedin.com/in/dr-shruti-jain-92705b130',
      // REPLACE: Faculty member 2 photo
      image: '/ShruitiMaam.jpeg',
    },
    {
      // REPLACE: Faculty member 3 details
      name: 'Dr. Vikas Baghel',
      designation: 'Associate Professor',
      specialization: 'Robotic Manipulation & Control Systems',
      // REPLACE: LinkedIn profile URL
      linkedin: 'https://www.juit.ac.in/faculty.php?id=374&dep=ece&page=0',
      // REPLACE: Faculty member 3 photo
      image: '/VikasSir.jpeg',
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
          <h2 className="section-title gold-underline inline-block">Faculty Coordinators</h2>
          <p className="text-xl text-muted-foreground mt-4">
            Meet our esteemed mentors that guide us towards robotics innovation and research
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {faculty.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-card rounded-xl shadow-lg p-6 text-center card-hover"
            >
              <div className="mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-accent/20 shadow-md"
                />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">{member.name}</h3>
              <p className="text-sm text-accent font-medium mb-1">{member.designation}</p>
              <p className="text-sm text-muted-foreground mb-4">{member.specialization}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-full transition-colors duration-300"
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
