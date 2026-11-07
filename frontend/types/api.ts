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
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface TaskResponse {
  id: string;
  businessId: string;
  createdByMembershipId: string;
  assignedToMembershipId: string | null;
  completedByMembershipId: string | null;
  title: string;
  description: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
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
}