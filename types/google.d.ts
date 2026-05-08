// Minimal types for Google Identity Services (GSI)
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }): void;
          prompt(): void;
          cancel(): void;
        };
      };
    };
  }
}

export {};
