import "axios";

declare module "axios" {
  // Extends the built-in type
  interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}
