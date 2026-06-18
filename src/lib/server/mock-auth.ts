export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'quality' | 'viewer';
};

type MockUserCredentials = {
  email: string;
  password: string;
  user: MockUser;
};

const users: MockUserCredentials[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    user: {
      id: 'mock-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    }
  },
  {
    email: 'qa@example.com',
    password: 'qa123',
    user: {
      id: 'mock-qa',
      name: 'Quality User',
      email: 'qa@example.com',
      role: 'quality'
    }
  },
  {
    email: 'viewer@example.com',
    password: 'viewer123',
    user: {
      id: 'mock-viewer',
      name: 'Viewer User',
      email: 'viewer@example.com',
      role: 'viewer'
    }
  }
];

export function authenticate(email: string, password: string): MockUser | null {
  const found = users.find((u) => u.email === email && u.password === password);
  return found?.user ?? null;
}
