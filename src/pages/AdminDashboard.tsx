import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { FaSignOutAlt, FaProjectDiagram, FaClipboardCheck, FaClock, FaCheckCircle, FaTimesCircle, FaInbox, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ProjectReviewModal from '@/components/admin/ProjectReviewModal';
import { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;

const AdminDashboard = () => {
  const { user, profile, signOut, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
  });

  useEffect(() => {
    // Only redirect if auth check is complete
    if (!authLoading) {
      setHasCheckedAuth(true);
      if (!user) {
        navigate('/admin');
      } else if (!isAdmin) {
        toast.error('Access denied. Admin privileges required.');
      }
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin && hasCheckedAuth) {
      fetchProjects();
    }
  }, [user, isAdmin, hasCheckedAuth]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(p => p.status === 'pending').length || 0;
      const approved = data?.filter(p => p.status === 'approved').length || 0;
      const rejected = data?.filter(p => p.status === 'rejected').length || 0;
      const underReview = data?.filter(p => p.status === 'under_review').length || 0;

      setStats({ total, pending, approved, rejected, underReview });
    } catch (error: any) {
      // Check if it's a table not found error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        toast.error('Projects table not found. Please run database migrations.');
      } else {
        toast.error('Failed to fetch projects.');
      }
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/admin');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleUpdateProject = async (projectId: string, status: string, comments: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: status as any,
          faculty_comments: comments,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        admin_id: user?.id,
        action: `Updated project status to ${status}`,
        entity_type: 'project',
        entity_id: projectId,
        details: { status, comments },
      });

      toast.success(`Project ${status} successfully`);
      fetchProjects();
      setSelectedProject(null);
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500', icon: FaClock },
      under_review: { color: 'bg-blue-500', icon: FaClipboardCheck },
      approved: { color: 'bg-green-500', icon: FaCheckCircle },
      rejected: { color: 'bg-red-500', icon: FaTimesCircle },
      completed: { color: 'bg-purple-500', icon: FaCheckCircle },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} text-white`}>
        <Icon className="mr-1 inline" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filterProjects = (status?: string) => {
    let filtered = projects;

    if (status && status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.project_title?.toLowerCase().includes(term) ||
        p.student_name?.toLowerCase().includes(term) ||
        p.roll_number?.toLowerCase().includes(term) ||
        p.student_email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  // Show loading during auth check
  if (authLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-juit-blue via-juit-blue to-juit-light-blue flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-juit-blue via-juit-blue to-juit-light-blue flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <div className="bg-gradient-to-r from-juit-blue to-juit-light-blue text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm opacity-90 mt-2">Welcome, {profile?.full_name || profile?.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-white/30 text-white"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingProjects ? (
          // Loading State
          <div className="space-y-6">
            {/* Skeleton Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-8 w-8 bg-muted rounded"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-12"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Skeleton Project Cards */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
              {[
                { label: 'Total Projects', value: stats.total, icon: FaProjectDiagram, color: 'text-blue-500' },
                { label: 'Pending', value: stats.pending, icon: FaClock, color: 'text-yellow-500' },
                { label: 'Under Review', value: stats.underReview, icon: FaClipboardCheck, color: 'text-blue-500' },
                { label: 'Approved', value: stats.approved, icon: FaCheckCircle, color: 'text-green-500' },
                { label: 'Rejected', value: stats.rejected, icon: FaTimesCircle, color: 'text-red-500' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                        <CardTitle className="text-sm font-medium line-clamp-2">{stat.label}</CardTitle>
                        <Icon className={`text-xl sm:text-2xl ${stat.color} flex-shrink-0`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Search Bar */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by project title, student name, roll number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Projects Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full gap-2 bg-muted p-1 rounded-lg">
                  {[
                    { value: 'all', label: 'All', count: stats.total },
                    { value: 'pending', label: 'Pending', count: stats.pending },
                    { value: 'under_review', label: 'Review', count: stats.underReview },
                    { value: 'approved', label: 'Approved', count: stats.approved },
                    { value: 'rejected', label: 'Rejected', count: stats.rejected },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
                      {tab.label}
                      <span className="ml-1 inline-block rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
                        {tab.count}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Contents */}
              <AnimatePresence mode="wait">
                {['all', 'pending', 'under_review', 'approved', 'rejected'].map((status) => (
                  <TabsContent key={status} value={status} className="mt-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-4 sm:gap-6"
                    >
                      {filterProjects(status === 'all' ? undefined : status).length > 0 ? (
                        filterProjects(status === 'all' ? undefined : status).map((project, idx) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                              <CardHeader className="pb-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-4">
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg sm:text-xl line-clamp-2">{project.project_title}</CardTitle>
                                    <CardDescription className="mt-2 text-xs sm:text-sm line-clamp-2">
                                      <span className="font-semibold text-foreground">{project.student_name}</span> • {project.roll_number} • {project.branch} • {project.year}
                                    </CardDescription>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {getStatusBadge(project.status)}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Category */}
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold mb-2">Category:</p>
                                  <Badge variant="outline" className="text-xs">{project.category}</Badge>
                                </div>

                                {/* Description */}
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold mb-2">Description:</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                </div>

                                {/* Duration and Resources Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs sm:text-sm font-semibold mb-2">Duration:</p>
                                    <p className="text-xs sm:text-sm">{project.duration}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs sm:text-sm font-semibold mb-2">Resources:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {project.required_resources?.slice(0, 2).map((resource, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">{resource}</Badge>
                                      ))}
                                      {project.required_resources && project.required_resources.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">+{project.required_resources.length - 2}</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Team Info */}
                                {project.is_team_project && (
                                  <div className="bg-muted/50 p-3 rounded">
                                    <p className="text-xs sm:text-sm font-semibold mb-1">Team Members ({project.team_size}):</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{project.team_members}</p>
                                  </div>
                                )}

                                {/* Faculty Comments */}
                                {project.faculty_comments && (
                                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded">
                                    <p className="text-xs sm:text-sm font-semibold mb-1 text-yellow-900 dark:text-yellow-200">Faculty Comments:</p>
                                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300 line-clamp-2">{project.faculty_comments}</p>
                                  </div>
                                )}

                                {/* Footer with Date and Action */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-3 sm:gap-4">
                                  <p className="text-xs text-muted-foreground">
                                    Submitted on {new Date(project.created_at).toLocaleDateString()}
                                  </p>
                                  <Button
                                    onClick={() => setSelectedProject(project)}
                                    variant="default"
                                    size="sm"
                                    className="w-full sm:w-auto bg-accent hover:bg-accent/90"
                                  >
                                    Review Project
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        // Empty State
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="col-span-full"
                        >
                          <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                              <div className="flex justify-center mb-4">
                                <FaInbox className="text-4xl text-muted-foreground opacity-50" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                              <p className="text-muted-foreground text-sm">
                                {searchTerm
                                  ? `No projects match your search "${searchTerm}"`
                                  : 'No projects in this category yet'}
                              </p>
                              {searchTerm && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSearchTerm('')}
                                  className="mt-4"
                                >
                                  Clear Search
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>
          </>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectReviewModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onUpdate={handleUpdateProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;