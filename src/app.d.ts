import type { MockUser } from '$lib/server/mock-auth';

declare global {
  namespace App {
    interface Locals {
      user: MockUser | null;
    }
  }
}

export {};
