export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'quality' | 'viewer';
};

const mockUser: MockUser = {
  id: 'local-user-quality',
  name: 'Local QA User',
  email: 'qa.local@example.com',
  role: 'quality'
};

export function getMockUser() {
  return mockUser;
}
