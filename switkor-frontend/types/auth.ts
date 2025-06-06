// Tipos idénticos a tus DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  name?: string;
}

// Respuesta de /auth/login
export interface LoginResponse {
  access_token: string;
}

// JWT Payload
export interface JwtPayload {
  sub: number;
  email: string;
  name?: string;
  iat: number;
  exp: number;
}
