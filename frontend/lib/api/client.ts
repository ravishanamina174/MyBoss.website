import type {
  ApiErrorResponse,
  BusinessResponse,
  UserResponse,
  TaskResponse,
  AcceptInvitationResponse,
  StaffResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus
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
};