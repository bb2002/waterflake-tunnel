export interface User {
  _id: number;
  snsId: string;
  loginProvider: string;
  name: string;
  email: string;
  thumbnailUrl: string;
  createdAt: Date;
  deletedAt: Date;
}
