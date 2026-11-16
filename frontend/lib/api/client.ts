import type {
  ApiErrorResponse,
  BusinessResponse,
  UserResponse,
  TaskResponse,
  AcceptInvitationResponse,
  StaffResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  InvitationResponse,
  CreateInvitationResponse,
  NotificationPage,
  ReportResponse,
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

async function apiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      message = error.message ?? error.error ?? message;
    } catch {
      // Use the default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getCurrentUser(token: string) {
    return apiRequest<UserResponse>("/api/users/me", token);
  },

  getBusinesses(token: string) {
    return apiRequest<BusinessResponse[]>(
      "/api/businesses",
      token
    );
  },

  getBusiness(token: string, businessId: string) {
    return apiRequest<BusinessResponse>(
      `/api/businesses/${encodeURIComponent(businessId)}`,
      token
    );
  },

  updateBusiness(token: string, businessId: string, name: string) {
    return apiRequest<BusinessResponse>(
      `/api/businesses/${encodeURIComponent(businessId)}`,
      token,
      { method: "PATCH", body: JSON.stringify({ name }) }
    );
  },

  registerBusiness(token: string, name: string) {
    return apiRequest<BusinessResponse>(
      "/api/businesses",
      token,
      {
        method: "POST",
        body: JSON.stringify({ name }),
      }
    );
  },

  getTasks(
  token: string,
  businessId: string,
  status?: TaskStatus
) {
  const query = status
    ? `?status=${status}`
    : "";

  return apiRequest<TaskResponse[]>(
    `/api/businesses/${encodeURIComponent(businessId)}/tasks${query}`,
    token
  );
},

getTask(
  token: string,
  businessId: string,
  taskId: string
) {
  return apiRequest<TaskResponse>(
    `/api/businesses/${encodeURIComponent(businessId)}/tasks/${encodeURIComponent(taskId)}`,
    token
  );
},

getStaff(token: string, businessId: string) {
  return apiRequest<StaffResponse[]>(
    `/api/businesses/${encodeURIComponent(businessId)}/staff`,
    token
  );
},

createTask(
  token: string,
  businessId: string,
  data: CreateTaskRequest
) {
  return apiRequest<TaskResponse>(
    `/api/businesses/${encodeURIComponent(businessId)}/tasks`,
    token,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
},

updateTask(
  token: string,
  businessId: string,
  taskId: string,
  data: UpdateTaskRequest
) {
  return apiRequest<TaskResponse>(
    `/api/businesses/${encodeURIComponent(businessId)}/tasks/${encodeURIComponent(taskId)}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
},

completeTask(
  token: string,
  businessId: string,
  taskId: string
) {
  return apiRequest<TaskResponse>(
    `/api/businesses/${encodeURIComponent(businessId)}/tasks/${encodeURIComponent(taskId)}/complete`,
    token,
    { method: "PATCH" }
  );
},

cancelTask(
  token: string,
  businessId: string,
  taskId: string
) {
  return apiRequest<TaskResponse>(
    `/api/businesses/${encodeURIComponent(businessId)}/tasks/${encodeURIComponent(taskId)}/cancel`,
    token,
    { method: "PATCH" }
  );
},

deleteTask(
  token: string,
  businessId: string,
  taskId: string
) {
  return apiRequest<void>(
    `/api/businesses/${encodeURIComponent(businessId)}/tasks/${encodeURIComponent(taskId)}`,
    token,
    { method: "DELETE" }
  );
},

  acceptInvitation(
    token: string,
    invitationToken: string
  ) {
    return apiRequest<AcceptInvitationResponse>(
      "/api/invitations/accept",
      token,
      {
        method: "POST",
        body: JSON.stringify({ token: invitationToken }),
      }
    );
  },

    getInvitations(token: string, businessId: string) {
    return apiRequest<InvitationResponse[]>(
      `/api/businesses/${encodeURIComponent(businessId)}/invitations`,
      token
    );
  },

  createInvitation(token: string, businessId: string) {
    return apiRequest<CreateInvitationResponse>(
      `/api/businesses/${encodeURIComponent(businessId)}/invitations`,
      token,
      { method: "POST" }
    );
  },

  revokeInvitation(
    token: string,
    businessId: string,
    invitationId: string
  ) {
    return apiRequest<void>(
      `/api/businesses/${encodeURIComponent(businessId)}/invitations/${encodeURIComponent(invitationId)}/revoke`,
      token,
      { method: "POST" }
    );
  },

  suspendStaff(
    token: string,
    businessId: string,
    membershipId: string
  ) {
    return apiRequest<StaffResponse>(
      `/api/businesses/${encodeURIComponent(businessId)}/staff/${encodeURIComponent(membershipId)}/suspend`,
      token,
      { method: "PATCH" }
    );
  },

  activateStaff(
    token: string,
    businessId: string,
    membershipId: string
  ) {
    return apiRequest<StaffResponse>(
      `/api/businesses/${encodeURIComponent(businessId)}/staff/${encodeURIComponent(membershipId)}/activate`,
      token,
      { method: "PATCH" }
    );
  },

  getNotifications(token: string, businessId: string, page = 0) {
    return apiRequest<NotificationPage>(
      `/api/businesses/${encodeURIComponent(businessId)}/notifications?page=${page}&size=20`,
      token
    );
  },

  getUnreadNotificationCount(token: string, businessId: string) {
    return apiRequest<number>(
      `/api/businesses/${encodeURIComponent(businessId)}/notifications/unread-count`,
      token
    );
  },

  markNotificationRead(token: string, businessId: string, notificationId: string) {
    return apiRequest<void>(
      `/api/businesses/${encodeURIComponent(businessId)}/notifications/${encodeURIComponent(notificationId)}/read`,
      token,
      { method: "PATCH" }
    );
  },

  markAllNotificationsRead(token: string, businessId: string) {
    return apiRequest<void>(
      `/api/businesses/${encodeURIComponent(businessId)}/notifications/read-all`,
      token,
      { method: "PATCH" }
    );
  },

  getReport(token: string, businessId: string, from: string, to: string) {
    return apiRequest<ReportResponse>(
      `/api/businesses/${encodeURIComponent(businessId)}/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      token
    );
  },
};