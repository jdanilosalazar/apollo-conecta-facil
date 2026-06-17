export interface ApolloContact {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  headline?: string | null;
  email?: string | null;
  email_status?: string | null;
  phone_numbers?: Array<{ raw_number: string; type: string }>;
  linkedin_url?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  organization_name?: string | null;
  organization?: { primary_domain?: string; name?: string };
  account?: { domain?: string; name?: string };
}

export interface EnrichedContact extends ApolloContact {
  personal_emails: string[];
  enriched: boolean;
}

export type SearchStatus =
  | { status: "idle" }
  | { status: "loading"; message: string; progress: number }
  | { status: "success"; contacts: EnrichedContact[]; domain: string }
  | { status: "error"; message: string };
