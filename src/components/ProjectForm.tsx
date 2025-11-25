import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  name: string;
  email: string;
  rollNumber: string;
  branch: string;
  year: string;
  contactNumber?: string;
  isTeamProject: boolean;
  teamSize?: number;
  teamMembers?: string;
  category: string;
  projectTitle: string;
  description: string;
  expectedOutcomes?: string;
  duration: string;
  resources: string[];
  otherResources?: string;
  consent: boolean;
}

const ProjectForm = () => {
  const [showOtherResources, setShowOtherResources] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>();

  const isTeamProject = watch('isTeamProject');

  const resourceOptions = [
    'Drone',
    'Robotic Dog',
    'Robotic Arm Kit',
    'Robotic Hands',
    'Arduino & Development Kits',
    'Jetson Nano AI Platform',
    '3D Printer',
    'Sensors & Actuators',
    'Workshop Space',
    'Other',
  ];

  const handleResourceChange = (resource: string, checked: boolean) => {
    if (checked) {
      setSelectedResources(prev => [...prev, resource]);
      if (resource === 'Other') {
        setShowOtherResources(true);
      }
    } else {
      setSelectedResources(prev => prev.filter(r => r !== resource));
      if (resource === 'Other') {
        setShowOtherResources(false);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Ensure resources is a proper array
      const resourcesArray = Array.isArray(selectedResources) ? selectedResources : [];
      
      if (resourcesArray.length === 0) {
        toast.error('Please select at least one resource');
        setIsSubmitting(false);
        return;
      }

      console.log('Selected resources:', resourcesArray);

      // Prepare project data for Supabase
      const projectData = {
        student_name: data.name,
        student_email: data.email,
        roll_number: data.rollNumber,
        branch: data.branch,
        year: data.year,
        contact_number: data.contactNumber || null,
        is_team_project: data.isTeamProject || false,
        team_size: data.teamSize || null,
        team_members: data.teamMembers || null,
        category: data.category,
        project_title: data.projectTitle,
        description: data.description,
        expected_outcomes: data.expectedOutcomes || null,
        duration: data.duration,
        required_resources: resourcesArray, // Now properly formatted as array
        other_resources: data.otherResources || null,
        status: 'pending' as const,
      };

      console.log('Submitting project data:', projectData);

      // Insert project into Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Error submitting project:', error);
        toast.error(`Failed to submit project: ${error.message}`);
        return;
      }

      console.log('Project submitted successfully:', project);
      toast.success('Project idea submitted successfully! You\'ll receive a confirmation email shortly.');
      
      // Reset form and state
      reset();
      setSelectedResources([]);
      setShowOtherResources(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="projects" className="py-24 bg-secondary">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title gold-underline inline-block">Submit Your Project Idea</h2>
          <p className="text-xl text-muted-foreground mt-4">
            We welcome innovative robotics project proposals from students
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card rounded-2xl shadow-xl p-8 space-y-8"
        >
          {/* Student Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary border-b-2 border-accent pb-2">
              Student Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter your full name"
                  className="border-input focus:border-accent focus:ring-accent"
                />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  placeholder="your.email@example.com"
                  className="border-input focus:border-accent focus:ring-accent"
                />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  {...register('rollNumber', { required: 'Roll number is required' })}
                  placeholder="Enter roll number"
                  className="border-input focus:border-accent focus:ring-accent"
                />
                {errors.rollNumber && <p className="text-destructive text-sm">{errors.rollNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch/Department *</Label>
                <select
                  id="branch"
                  {...register('branch', { required: 'Branch is required' })}
                  className="w-full px-3 py-2 border rounded-md border-input focus:border-accent focus:ring-accent"
                >
                  <option value="">Select branch</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="Other">Other</option>
                </select>
                {errors.branch && <p className="text-destructive text-sm">{errors.branch.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year of Study *</Label>
                <select
                  id="year"
                  {...register('year', { required: 'Year is required' })}
                  className="w-full px-3 py-2 border rounded-md border-input focus:border-accent focus:ring-accent"
                >
                  <option value="">Select year</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
                {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  {...register('contactNumber')}
                  placeholder="+91XXXXXXXXXX"
                  className="border-input focus:border-accent focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary border-b-2 border-accent pb-2">
              Team Information
            </h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTeamProject"
                {...register('isTeamProject')}
              />
              <Label htmlFor="isTeamProject">This is a team project</Label>
            </div>

            {isTeamProject && (
              <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Number of Team Members</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    min="1"
                    max="5"
                    {...register('teamSize')}
                    placeholder="1-5"
                    className="border-input focus:border-accent focus:ring-accent"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="teamMembers">Team Member Names</Label>
                  <Textarea
                    id="teamMembers"
                    {...register('teamMembers')}
                    placeholder="Name 1, Roll No.&#10;Name 2, Roll No."
                    rows={3}
                    className="border-input focus:border-accent focus:ring-accent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary border-b-2 border-accent pb-2">
              Project Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Project Category *</Label>
                <select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border rounded-md border-input focus:border-accent focus:ring-accent"
                >
                  <option value="">Select category</option>
                  <option value="Autonomous Robots">Autonomous Robots</option>
                  <option value="Robotic Manipulation">Robotic Manipulation</option>
                  <option value="Human-Robot Interaction">Human-Robot Interaction</option>
                  <option value="Industrial Automation">Industrial Automation</option>
                  <option value="Bio-Inspired Robotics">Bio-Inspired Robotics</option>
                  <option value="Aerial Robotics">Aerial Robotics</option>
                  <option value="Computer Vision & AI">Computer Vision & AI</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration *</Label>
                <select
                  id="duration"
                  {...register('duration', { required: 'Duration is required' })}
                  className="w-full px-3 py-2 border rounded-md border-input focus:border-accent focus:ring-accent"
                >
                  <option value="">Select duration</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="12+ months">12+ months</option>
                </select>
                {errors.duration && <p className="text-destructive text-sm">{errors.duration.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="projectTitle">Project Title * (max 100 characters)</Label>
                <Input
                  id="projectTitle"
                  {...register('projectTitle', { required: 'Title is required', maxLength: 100 })}
                  placeholder="Enter project title"
                  className="border-input focus:border-accent focus:ring-accent"
                />
                {errors.projectTitle && <p className="text-destructive text-sm">{errors.projectTitle.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Project Description * (100-1000 characters)</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required', minLength: 100, maxLength: 1000 })}
                  placeholder="Describe your project idea..."
                  rows={6}
                  className="border-input focus:border-accent focus:ring-accent"
                />
                {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expectedOutcomes">Expected Outcomes (max 500 characters)</Label>
                <Textarea
                  id="expectedOutcomes"
                  {...register('expectedOutcomes', { maxLength: 500 })}
                  placeholder="What do you expect to achieve?"
                  rows={3}
                  className="border-input focus:border-accent focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Resource Requirements */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary border-b-2 border-accent pb-2">
              Required Lab Resources *
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {resourceOptions.map((resource) => (
                <div key={resource} className="flex items-center space-x-2">
                  <Checkbox
                    id={resource}
                    checked={selectedResources.includes(resource)}
                    onCheckedChange={(checked) => handleResourceChange(resource, checked as boolean)}
                  />
                  <Label htmlFor={resource} className="cursor-pointer">{resource}</Label>
                </div>
              ))}
            </div>

            {selectedResources.length === 0 && (
              <p className="text-destructive text-sm">Please select at least one resource</p>
            )}

            {showOtherResources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label htmlFor="otherResources">Please describe additional resources needed (max 300 characters)</Label>
                <Textarea
                  id="otherResources"
                  {...register('otherResources', { maxLength: 300 })}
                  placeholder="Describe other resources..."
                  rows={3}
                  className="border-input focus:border-accent focus:ring-accent"
                />
              </motion.div>
            )}
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              {...register('consent', { required: 'You must agree to continue' })}
            />
            <Label htmlFor="consent" className="cursor-pointer">
              I agree that my project idea will be reviewed by faculty members *
            </Label>
          </div>
          {errors.consent && <p className="text-destructive text-sm">{errors.consent.message}</p>}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || selectedResources.length === 0}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Project Idea'}
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default ProjectForm;
