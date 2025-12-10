import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaUser, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Admin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Only redirect if loading is complete and user is authenticated
    if (!loading) {
      setHasCheckedAuth(true);
      if (user && isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Invalid credentials');
      } else {
        toast.success('Logged in successfully!');
        // Navigation will happen via useEffect
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading only during initial auth check
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-juit-blue via-juit-blue to-juit-light-blue flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full"
        />
        <p className="ml-4 text-white">Checking authentication...</p>
      </div>
    );
  }

  // If already logged in and is admin, don't show login form
  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-juit-blue via-juit-blue to-juit-light-blue flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full"
        />
        <p className="ml-4 text-white">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-juit-blue via-juit-blue to-juit-light-blue flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-accent text-3xl font-bold mb-2">JUIT Robotics Lab</div>
            <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@juit.ac.in"
                  className="pl-10 border-input focus:border-accent focus:ring-accent"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10 border-input focus:border-accent focus:ring-accent"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-accent hover:text-accent/80 transition-colors">
              ← Back to Main Site
            </Link>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-accent/10 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              This is the admin panel for faculty to review and approve student project submissions.
              Please use your faculty credentials to log in.
            </p>
          </div>

          {/* Development Note */}
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              <strong>For Development:</strong> Create an admin user in Supabase Auth first, then login here.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Admin;
