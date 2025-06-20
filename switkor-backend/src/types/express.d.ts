import { Request } from 'express';
import { User } from '../../user/user.entity'; // ajusta la ruta

export interface AuthenticatedRequest extends Request {
  user: User;
}