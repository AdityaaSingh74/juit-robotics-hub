// ProjectAction.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

export const ProjectSubmissionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectTitle: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // 1. Save to database (Supabase)
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title: formData.projectTitle,
            description: formData.description,
            user_name: formData.name,
            user_email: formData.email,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 2. Send confirmation email
      await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          emailType: 'submission',
          projectName: formData.projectTitle,
        }),
      });

      // 3. Reset form
      setFormData({
        name: '',
        email: '',
        projectTitle: '',
        description: '',
      });
      setMessage('Project submitted successfully! Check your email for confirmation.');
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // 4. return the form, TA DAH!
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6">
      {message && (
        <div className={`p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Your Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="projectTitle" className="block text-sm font-medium mb-2">
          Project Title
        </label>
        <Input
          id="projectTitle"
          value={formData.projectTitle}
          onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Project Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Project'}
      </Button>
    </form>
  );
};
