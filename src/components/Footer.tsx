import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Lab Info */}
          <div>
            <div className="text-accent text-2xl font-bold mb-2">JUIT Robotics Lab</div>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Innovating the Future of Robotics
            </p>
            <p className="text-sm text-primary-foreground/70">
              Jaypee University of Information Technology<br />
              Waknaghat, Solan, HP
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => {
                  const el = document.getElementById('about');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-accent transition-colors">
                  About Lab
                </button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('equipment');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-accent transition-colors">
                  Research Areas
                </button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('projects');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-accent transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent transition-colors">
                  Admin Login
                </Link>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-accent transition-colors">
                  Back to Top ↑
                </button>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">Connect</h3>
            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="text-primary-foreground/70">Email:</span>{' '}
                <a href="mailto:robotics@juit.ac.in" className="hover:text-accent transition-colors">
                  robotics@juit.ac.in
                </a>
              </p>
              <p>
                <span className="text-primary-foreground/70">Phone:</span>{' '}
                <span>+91-XXXXXXXXXX</span>
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent flex items-center justify-center rounded-full transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-xl" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent flex items-center justify-center rounded-full transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="text-xl" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent flex items-center justify-center rounded-full transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-6 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="text-primary-foreground/70 mb-4 sm:mb-0">
            © 2025 JUIT Robotics Lab. All Rights Reserved.
          </p>
          <a
            href="https://www.juit.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            Visit JUIT Website →
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
