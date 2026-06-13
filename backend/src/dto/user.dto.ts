export type RegisterRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at?: Date;
};

export type RegisterApiResponse = {
  message: string;
  data: RegisterResponse | null;
  error?: unknown;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  email: string;
  role: string;
  is_active?: boolean; // Optional - may not be returned in all cases
};

export type LoginApiResponse = {
  message: string;
  data: LoginResponse | null;
  error?: unknown;
};
