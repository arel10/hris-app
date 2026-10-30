export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    email: string
    roles: string[]
  }
}

export interface MeResponse {
  id: string
  email: string
  roles: string[]
  permissions: string[]
  is_active: boolean
}

export interface RefreshRequest {
  refresh_token: string
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

