export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
}