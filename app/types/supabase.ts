export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
