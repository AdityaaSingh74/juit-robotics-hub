import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { FaSignOutAlt, FaProjectDiagram, FaClipboardCheck, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
        console.log('No user found, redirecting to login...');
        navigate('/admin');
      } else if (!isAdmin) {
        console.log('User is not admin, access denied');
        toast.error('Access denied. Admin privileges required.');
      }
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin && hasCheckedAuth) {
      console.log('Fetching projects...');
      fetchProjects();
    }
  }, [user, isAdmin, hasCheckedAuth]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      console.log('Fetching projects from database...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} projects`);
      setProjects(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(p => p.status === 'pending').length || 0;
      const approved = data?.filter(p => p.status === 'approved').length || 0;
      const rejected = data?.filter(p => p.status === 'rejected').length || 0;
      const underReview = data?.filter(p => p.status === 'under_review').length || 0;

      setStats({ total, pending, approved, rejected, underReview });
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      
      // Check if it's a table not found error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        toast.error('Projects table not found. Please run database migrations.');
      } else {
        toast.error('Failed to fetch projects. Check console for details.');
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
      console.error('Sign out error:', error);
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
      console.error('Error updating project:', error);
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
    if (!status) return projects;
    return projects.filter(p => p.status === status);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-juit-blue to-juit-light-blue text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm opacity-90 mt-1">Welcome, {profile?.full_name || profile?.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 py-8">
        {loadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
            />
            <p className="ml-4 text-muted-foreground">Loading projects...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <FaProjectDiagram className="text-2xl text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <FaClock className="text-2xl text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.pending}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                  <FaClipboardCheck className="text-2xl text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.underReview}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <FaCheckCircle className="text-2xl text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.approved}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <FaTimesCircle className="text-2xl text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.rejected}</div>
                </CardContent>
              </Card>
            </div>

            {/* Projects Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="under_review">Under Review ({stats.underReview})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'under_review', 'approved', 'rejected'].map((status) => (
                <TabsContent key={status} value={status} className="mt-6">
                  <div className="grid gap-6">
                    {filterProjects(status === 'all' ? undefined : status).map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-xl">{project.project_title}</CardTitle>
                              <CardDescription className="mt-2">
                                <span className="font-semibold">{project.student_name}</span> | {project.roll_number} | {project.branch} | {project.year}
                              </CardDescription>
                            </div>
                            {getStatusBadge(project.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-semibold mb-1">Category:</p>
                              <Badge variant="outline">{project.category}</Badge>
                            </div>
                            
                            <div>
                              <p className="text-sm font-semibold mb-1">Description:</p>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-semibold mb-1">Duration:</p>
                                <p className="text-sm">{project.duration}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-1">Resources Needed:</p>
                                <div className="flex flex-wrap gap-1">
                                  {project.required_resources?.map((resource, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{resource}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {project.is_team_project && (
                              <div>
                                <p className="text-sm font-semibold mb-1">Team Members ({project.team_size}):</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.team_members}</p>
                              </div>
                            )}

                            {project.faculty_comments && (
                              <div className="bg-secondary p-3 rounded">
                                <p className="text-sm font-semibold mb-1">Faculty Comments:</p>
                                <p className="text-sm">{project.faculty_comments}</p>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t">
                              <p className="text-xs text-muted-foreground">
                                Submitted on {new Date(project.created_at).toLocaleDateString()}
                              </p>
                              <Button
                                onClick={() => setSelectedProject(project)}
                                variant="default"
                                className="bg-accent hover:bg-accent/90"
                              >
                                Review Project
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filterProjects(status === 'all' ? undefined : status).length === 0 && (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          No projects found in this category
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>

      {/* Review Modal */}
      {selectedProject && (
        <ProjectReviewModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={handleUpdateProject}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
