declare namespace Express {
  export interface Request {
    user?: { id: string; username: string; name?: string; npp?: string; phone?: string }
  }
}
