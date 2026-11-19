export interface UserResponse {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string | null;
}

export interface BusinessResponse {
  id: string;
  name: string;
  role: "OWNER" | "STAFF";
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  membershipId: string;
  userId: string;
  userEmail: string;
  userFullName: string | null;
  membershipCreatedAt: string;
  createdAt: string;
}

export interface BusinessInformationResponse {
  businessId: string;
  publicIdentifier: string;
  name: string;
  description: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  galleryUrls: string[];
  profilePublished: boolean;
  card: {
    description: string | null;
    contactName: string | null;
    contactEmail: string | null;
    phoneNumber: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
    published: boolean;
  };
  updatedAt: string;
}

export interface PublicBusinessResponse {
  publicIdentifier: string;
  name: string;
  description: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  galleryUrls: string[];
}

export interface PublicCardResponse {
  publicIdentifier: string;
  businessName: string;
  description: string | null;
  contactName: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
}

export interface UpdateBusinessProfileRequest {
  name: string;
  description: string;
  contactEmail: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  profileImageUrl: string;
  coverImageUrl: string;
  galleryUrls: string[];
}

export interface UpdateBusinessCardRequest {
  description: string;
  contactName: string;
  contactEmail: string;
  phoneNumber: string;
  websiteUrl: string;
  logoUrl: string;
}

export interface NotificationResponse {
  id: string;
  businessId: string;
  type: string;
  title: string;
  message: string;
  relatedTaskId: string | null;
  relatedInvitationId: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPage {
  content: NotificationResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ReportResponse {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  completionRate: number;
  activity: { date: string; created: number; completed: number }[];
  staff: {
    membershipId: string;
    name: string;
    email: string;
    assigned: number;
    completed: number;
  }[];
}

export interface TaskResponse {
  id: string;
  businessId: string;
  createdByMembershipId: string;
  assignedToMembershipId: string | null;
  completedByMembershipId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueAt: string | null;
  completedAt: string | null;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterBusinessRequest {
  name: string;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface AcceptInvitationResponse {
  businessId: string;
  membershipId: string;
  role: "STAFF";
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  data?: Record<string, string>;
}

export interface CreateTaskRequest {
  title: string;
  description: string | null;
  assignedToMembershipId: string | null;
  dueAt: string | null;
}

export type UpdateTaskRequest = CreateTaskRequest;

export interface StaffResponse {
  membershipId: string;
  userId: string;
  fullName: string | null;
  email: string;
  role: "OWNER" | "STAFF";
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  joinedAt: string;
}

export interface InvitationResponse {
  id: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
}

export interface CreateInvitationResponse {
  invitationId: string;
  invitationLink: string;
  expiresAt: string;
}

export type TaskStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

export type TaskFilter = "ALL" | TaskStatus;

