export interface DeployAdapter {
  name: string;
  deploy(): Promise<void>;
}
