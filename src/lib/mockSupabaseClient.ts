import { mockDB } from './mockDatabase';

// Mock Supabase client that mimics the real API
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'projects') {
            const projects = mockDB.getProjects();
            const project = projects.find((p: any) => p[column] === value);
            return { data: project || null, error: null };
          }
          return { data: null, error: null };
        },
        then: async (callback: any) => {
          if (table === 'projects') {
            const projects = mockDB.getProjects().filter((p: any) => p[column] === value);
            return callback({ data: projects, error: null });
          }
          return callback({ data: [], error: null });
        }
      }),
      order: (column: string, options: any) => ({
        then: async (callback: any) => {
          if (table === 'projects') {
            let projects = mockDB.getProjects();
            projects.sort((a: any, b: any) => {
              if (options.ascending) {
                return a[column] > b[column] ? 1 : -1;
              }
              return a[column] < b[column] ? 1 : -1;
            });
            return callback({ data: projects, error: null });
          }
          return callback({ data: [], error: null });
        }
      }),
      then: async (callback: any) => {
        if (table === 'projects') {
          const projects = mockDB.getProjects();
          return callback({ data: projects, error: null });
        }
        if (table === 'profiles') {
          const users = mockDB.getUsers();
          return callback({ data: users, error: null });
        }
        return callback({ data: [], error: null });
      }
    }),

    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          if (table === 'projects') {
            const project = mockDB.addProject(data[0] || data);
            return { data: project, error: null };
          }
          return { data: null, error: null };
        }
      })
    }),

    update: (updates: any) => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          if (table === 'projects') {
            const updated = mockDB.updateProject(value, updates);
            return callback({ data: updated, error: null });
          }
          return callback({ data: null, error: null });
        }
      })
    }),

    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          if (table === 'projects') {
            const deleted = mockDB.deleteProject(value);
            return callback({ data: deleted, error: null });
          }
          return callback({ data: null, error: null });
        }
      })
    })
  }),

  auth: {
    signInWithPassword: async ({ email, password }: any) => {
      const result = mockDB.login(email, password);
      if (result.error) {
        return { data: { user: null, session: null }, error: { message: result.error } };
      }
      return {
        data: {
          user: { id: result.user.id, email: result.user.email },
          session: { access_token: 'mock-token' }
        },
        error: null
      };
    },

    signOut: async () => {
      mockDB.logout();
      return { error: null };
    },

    getSession: async () => {
      const user = mockDB.getCurrentUser();
      if (user) {
        return {
          data: {
            session: {
              user: { id: user.id, email: user.email },
              access_token: 'mock-token'
            }
          },
          error: null
        };
      }
      return { data: { session: null }, error: null };
    },

    onAuthStateChange: (callback: any) => {
      // Mock subscription
      const user = mockDB.getCurrentUser();
      setTimeout(() => {
        callback('SIGNED_IN', user ? { user } : null);
      }, 100);
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  }
};
