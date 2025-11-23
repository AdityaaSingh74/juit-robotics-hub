import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Project Submission</DialogTitle>
          <DialogDescription>
            Review and update the status of this project submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{project.project_title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Student:</span> {project.student_name}
                </div>
                <div>
                  <span className="font-medium">Roll Number:</span> {project.roll_number}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {project.student_email}
                </div>
                <div>
                  <span className="font-medium">Contact:</span> {project.contact_number || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Branch:</span> {project.branch}
                </div>
                <div>
                  <span className="font-medium">Year:</span> {project.year}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Project Details</h4>
              <div className="bg-secondary p-4 rounded space-y-2">
                <div>
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="ml-2">{project.category}</Badge>
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {project.duration}
                </div>
                <div>
                  <span className="font-medium">Team Project:</span> {project.is_team_project ? 'Yes' : 'No'}
                  {project.is_team_project && ` (${project.team_size} members)`}
                </div>
              </div>
            </div>

            {project.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm bg-secondary p-4 rounded">{project.description}</p>
              </div>
            )}

            {project.expected_outcomes && (
              <div>
                <h4 className="font-semibold mb-2">Expected Outcomes</h4>
                <p className="text-sm bg-secondary p-4 rounded">{project.expected_outcomes}</p>
              </div>
            )}

            {project.required_resources && project.required_resources.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Required Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {project.required_resources.map((resource, idx) => (
                    <Badge key={idx} variant="secondary">{resource}</Badge>
                  ))}
                </div>
                {project.other_resources && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    <span className="font-medium">Other:</span> {project.other_resources}
                  </p>
                )}
              </div>
            )}

            {project.is_team_project && project.team_members && (
              <div>
                <h4 className="font-semibold mb-2">Team Members</h4>
                <p className="text-sm bg-secondary p-4 rounded whitespace-pre-wrap">{project.team_members}</p>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <Label>Review Status *</Label>
            <RadioGroup value={status} onValueChange={setStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="cursor-pointer">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under_review" id="under_review" />
                <Label htmlFor="under_review" className="cursor-pointer">Under Review</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="cursor-pointer">Approved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected" className="cursor-pointer">Rejected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed" className="cursor-pointer">Completed</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">
              Faculty Comments {(status === 'approved' || status === 'rejected') && '*'}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add your feedback, suggestions, or reasons for the decision..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Submission Info */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>Submitted: {new Date(project.created_at).toLocaleString()}</p>
            {project.reviewed_at && (
              <p>Last Reviewed: {new Date(project.reviewed_at).toLocaleString()}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90"
          >
            {isSubmitting ? 'Saving...' : 'Save Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectReviewModal;
