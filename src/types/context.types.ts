export interface PluginContext {
  user?: {
    id?: string;
  };
  req?: {
    headers: {
      [key: string]: string | undefined;
    };
  };
}
