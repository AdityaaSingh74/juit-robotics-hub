import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tables } from '@/integrations/supabase/types';
import { FaFileAlt, FaUsers, FaToolbox, FaClipboard } from 'react-icons/fa';

type Project = Tables<'projects'>;

interface ProjectReviewModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (projectId: string, status: string, comments: string) => void;
}

const ProjectReviewModal = ({ project, onClose, onUpdate }: ProjectReviewModalProps) => {
  const [status, setStatus] = useState(project.status);
  const [comments, setComments] = useState(project.faculty_comments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (status === 'approved' || status === 'rejected') {
      if (!comments.trim()) {
        alert('Please add comments before submitting');
        return;
      }
    }

    setIsSubmitting(true);
    await onUpdate(project.id, status, comments);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-juit-blue to-juit-light-blue text-white sticky top-0 z-50">
          <DialogHeader className="p-6 border-b border-white/20">
            <DialogTitle className="text-2xl">{project.project_title}</DialogTitle>
            <DialogDescription className="text-white/80 mt-2">
              Review and update the status of this project submission
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Tabs for organized information */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 gap-2 bg-muted p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <FaClipboard className="mr-2 hidden sm:inline" />
                <span className="sm:hidden">Overview</span>
                <span className="hidden sm:inline">Project Overview</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs sm:text-sm">
                <FaFileAlt className="mr-2 hidden sm:inline" />
                <span className="sm:hidden">Details</span>
                <span className="hidden sm:inline">Project Details</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs sm:text-sm">
                <FaUsers className="mr-2 hidden sm:inline" />
                <span className="sm:hidden">Team</span>
                <span className="hidden sm:inline">Team Info</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm">
                <FaToolbox className="mr-2 hidden sm:inline" />
                <span className="sm:hidden">Resources</span>
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {[
                  { label: 'Student Name', value: project.student_name },
                  { label: 'Roll Number', value: project.roll_number },
                  { label: 'Email', value: project.student_email },
                  { label: 'Contact', value: project.contact_number || 'N/A' },
                  { label: 'Branch', value: project.branch },
                  { label: 'Year', value: project.year },
                ].map((item, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
                        {item.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm sm:text-base font-medium break-words">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <CardTitle className="text-base">Project Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {project.category}
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {project.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Project Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {project.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {project.expected_outcomes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Expected Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {project.expected_outcomes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{project.duration}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Team Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">
                        {project.is_team_project ? `Yes (${project.team_size} members)` : 'No'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {project.is_team_project ? (
                  project.team_members ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Team Members ({project.team_size})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {project.team_members}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        <p className="text-sm">No team members information provided</p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <p className="text-sm">This is an individual project</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {project.required_resources && project.required_resources.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Required Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.required_resources.map((resource, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs sm:text-sm">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <p className="text-sm">No resources specified</p>
                    </CardContent>
                  </Card>
                )}

                {project.other_resources && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Other Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {project.other_resources}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-6 space-y-6">
            {/* Status Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Review Status *</Label>
              <RadioGroup value={status} onValueChange={setStatus}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'pending', label: 'Pending', description: 'Not yet reviewed' },
                    { value: 'under_review', label: 'Under Review', description: 'Currently reviewing' },
                    { value: 'approved', label: 'Approved', description: 'Approved by faculty' },
                    { value: 'rejected', label: 'Rejected', description: 'Rejected by faculty' },
                    { value: 'completed', label: 'Completed', description: 'Project completed' },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="relative"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-muted cursor-pointer transition-colors">
                        <RadioGroupItem value={option.value} id={option.value} className="flex-shrink-0" />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              <Label htmlFor="comments" className="text-base font-semibold">
                Faculty Comments {(status === 'approved' || status === 'rejected') && '(Required)*'}
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your feedback, suggestions, or reasons for the decision..."
                rows={5}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {status === 'approved' || status === 'rejected'
                  ? 'Comments are required for approval/rejection'
                  : 'Comments are optional for other statuses'}
              </p>
            </div>

            {/* Submission Info */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold">Submitted:</span> {new Date(project.created_at).toLocaleString()}
              </p>
              {project.reviewed_at && (
                <p>
                  <span className="font-semibold">Last Reviewed:</span> {new Date(project.reviewed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-muted/30 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-accent hover:bg-accent/90"
          >
            {isSubmitting ? 'Saving...' : 'Save Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectReviewModal;