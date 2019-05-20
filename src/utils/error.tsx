export interface ErrnoException {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
  message: string;
}
