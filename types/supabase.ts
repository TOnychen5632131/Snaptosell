export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          apple_sub: string | null;
          invite_code: string | null;
          created_at: string | null;
        };
      };
      image_jobs: {
        Row: {
          id: string;
          user_id: string | null;
          state: "pending" | "processing" | "done" | "failed";
          mode: string | null;
          original_storage_path: string | null;
          original_preview_url: string | null;
          processed_image_url: string | null;
          failure_reason: string | null;
          cost_credits: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      credit_ledger: {
        Row: {
          id: number;
          user_id: string;
          delta: number;
          reason: string | null;
          job_id: string | null;
          stripe_session_id: string | null;
          created_at: string | null;
        };
      };
      referral_state: {
        Row: {
          user_id: string;
          pending_inviter_id: string | null;
          free_uses_remaining: number | null;
        };
      };
    };
    Functions: {
      award_credits: {
        Args: {
          p_user: string;
          p_delta: number;
          p_reason: string;
          p_session: string;
        };
        Returns: null;
      };
      get_current_balance: {
        Args: Record<string, never>;
        Returns: number[];
      };
      claim_invite_reward: {
        Args: Record<string, never>;
        Returns: { success: boolean } | null;
      };
    };
  };
}
