export type AuditRow =
  | {
      id: string;
      type: "transaction";
      created_at: string;
      user_id: string;
      user_email: string;
      user_name?: string | null;
      event_type: string;
      amount_usd: number | null;
      credits_delta: null;
      status: string | null;
      source: string;
      metadata: Record<string, any> | null;
    }
  | {
      id: string;
      type: "ledger";
      created_at: string;
      user_id: string;
      user_email: string;
      user_name?: string | null;
      event_type: string;
      amount_usd: null;
      credits_delta: number;
      status: string | null;
      source: string;
      metadata: Record<string, any> | null;
    };