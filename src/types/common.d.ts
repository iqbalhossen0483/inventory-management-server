import 'express-serve-static-core';
import { Role } from 'src/entites/user.entity';

type JWT_Payload = {
  sub: number;
  email: string;
  role: Role;
};

declare module 'express-serve-static-core' {
  namespace Express {
    interface Request {
      user: JWT_Payload;
    }
  }
}

type API_Meta = {
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
};
