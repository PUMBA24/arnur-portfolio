export const applicationStatuses = ['new', 'in-progress', 'done', 'archived'] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export type AdminApplication = {
  id: string;
  projectType: string;
  description: string;
  budget: string;
  deadline: string;
  contactMethod: string;
  contact: string;
  status: ApplicationStatus;
  notes: string;
  submittedAt: number;
};

export type AdminUser = {
  id: string;
  username: string;
  createdAt: number;
  isOwner: boolean;
};
