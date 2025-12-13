// Mock Database using localStorage
type Project = {
  id: string;
  student_name: string;
  student_email: string;
  roll_number: string;
  branch: string;
  year: string;
  contact_number?: string;
  is_team_project: boolean;
  team_size?: number;
  team_members?: string;
  category: string;
  project_title: string;
  description: string;
  expected_outcomes?: string;
  duration: string;
  required_resources: string[];
  other_resources?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  faculty_comments?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
};

type User = {
  id: string;
  email: string;
  full_name?: string;
  role: 'super_admin' | 'admin' | 'faculty' | 'view_only';
};

class MockDatabase {
  private PROJECTS_KEY = 'mock_projects';
  private USERS_KEY = 'mock_users';
  private CURRENT_USER_KEY = 'mock_current_user';

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Create default admin user if doesn't exist
    const users = this.getUsers();
    if (users.length === 0) {
      this.addUser({
        id: '1',
        email: 'admin@juit.edu',
        full_name: 'Admin User',
        role: 'super_admin'
      });
    }
  }

  // Projects
  getProjects(): Project[] {
    const data = localStorage.getItem(this.PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    projects.push(newProject);
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    return projects[index];
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filtered));
    return filtered.length < projects.length;
  }

  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return user;
  }

  findUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  // Auth
  login(email: string, password: string): { user: User; error: null } | { user: null; error: string } {
    // Mock password check - in real app, never store passwords like this!
    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters' };
    }

    const user = this.findUserByEmail(email);
    if (!user) {
      return { user: null, error: 'User not found' };
    }

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    return { user, error: null };
  }

  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Utility
  clearAll() {
    localStorage.removeItem(this.PROJECTS_KEY);
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.initializeDefaults();
  }
}

export const mockDB = new MockDatabase();
