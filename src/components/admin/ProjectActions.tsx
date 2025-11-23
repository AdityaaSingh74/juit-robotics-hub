// Role-aware actions for AdminDashboard
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';

interface ProjectActionsProps {
  project: Tables<'projects'>;
  onApprove: (comments?: string) => void;
  onReject: (comments?: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectActions = ({ project, onApprove, onReject, onEdit, onDelete }: ProjectActionsProps) => {
  const { profile } = useAuth();
  const canApprove = profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.permissions?.can_approve;
  const canEdit = profile?.role === 'super_admin' || profile?.permissions?.can_edit;
  const canDelete = profile?.role === 'super_admin' || profile?.permissions?.can_delete;
  const isViewOnly = profile?.role === 'view_only';

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {canApprove && project.status !== 'approved' && (
        <Button variant="success" onClick={() => onApprove()}>
          Approve
        </Button>
      )}
      {canApprove && project.status !== 'rejected' && (
        <Button variant="destructive" onClick={() => onReject()}>
          Reject
        </Button>
      )}
      {canEdit && (
        <Button variant="outline" onClick={() => onEdit()}>
          Edit
        </Button>
      )}
      {canDelete && (
        <Button variant="danger" onClick={() => onDelete()}>
          Delete
        </Button>
      )}
      {isViewOnly && (
        <span className="text-xs text-muted-foreground">View only - ask admin for permission to edit</span>
      )}
    </div>
  );
};
