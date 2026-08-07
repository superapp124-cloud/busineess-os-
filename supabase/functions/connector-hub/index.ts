import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface ProviderConfig {
  authUrl?: string;
  tokenUrl?: string;
  apiBase?: string;
  clientIdEnv?: string;
  clientSecretEnv?: string;
  apiKeyEnv?: string;
  scopes?: string[];
  rateLimitPerMinute?: number;
  webhooks?: boolean;
  extraAuthParams?: Record<string, string>;
  /** capability -> provider request + normalizer */
  endpoints?: Record<string, {
    path: string;
    recordType: string;
    /** Provider verb; a few providers (Notion, Dropbox, Slack search) list via POST. */
    method?: "GET" | "POST";
    /** Static JSON body for POST-style list calls. */
    requestBody?: unknown;
    list: (body: any) => any[];
    /** Providers that list bare IDs (Gmail) hydrate full items before mapping. */
    hydrate?: (
      items: any[],
      fetchOne: (path: string) => Promise<any>,
    ) => Promise<any[]>;
    map: (item: any) => Record<string, unknown>;
    searchPath?: (q: string) => string;
    searchBody?: (q: string) => unknown;
  }>;
}


const G = "https://accounts.google.com/o/oauth2/v2/auth";
const GT = "https://oauth2.googleapis.com/token";
const MS = "https://login.microsoftonline.com/common/oauth2/v2.0";

const PROVIDERS: Record<string, ProviderConfig> = {
  gmail: {
    rateLimitPerMinute: 240, webhooks: true,
    authUrl: G, tokenUrl: GT, apiBase: "https://gmail.googleapis.com/gmail/v1",
    clientIdEnv: "GOOGLE_CONNECTOR_CLIENT_ID", clientSecretEnv: "GOOGLE_CONNECTOR_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"],
    extraAuthParams: { access_type: "offline", prompt: "consent" },
    endpoints: {
      "email.read": {
        path: "/users/me/messages?maxResults=25",
        recordType: "message",
        list: (b) => b.messages ?? [],
        // Gmail list returns only {id, threadId} — hydrate metadata before mapping.
        hydrate: async (items, fetchOne) => {
          const full: any[] = [];
          for (const item of items) {
            try {
              full.push(
                await fetchOne(
                  `/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
                ),
              );
            } catch (_) {
              full.push(item);
            }
          }
          return full;
        },
        map: (m) => {
          const headers: any[] = m.payload?.headers ?? [];
          const header = (name: string) =>
            headers.find((h) => String(h.name).toLowerCase() === name)?.value ?? null;
          return {
            external_id: m.id,
            title: header("subject") ?? m.snippet ?? "Email",
            body: m.snippet ?? null,
            author: header("from"),
            participants: [header("from"), header("to")].filter(Boolean),
            url: m.threadId ? `https://mail.google.com/mail/u/0/#inbox/${m.threadId}` : null,
            occurred_at: m.internalDate
              ? new Date(Number(m.internalDate)).toISOString()
              : header("date")
                ? new Date(header("date") as string).toISOString()
                : null,
            metadata: { thread_id: m.threadId, label_ids: m.labelIds ?? [] },
          };
        },
        searchPath: (q) => `/users/me/messages?maxResults=25&q=${encodeURIComponent(q)}`,
      },
    },
  },
  google_calendar: {
    rateLimitPerMinute: 240, webhooks: true,
    authUrl: G, tokenUrl: GT, apiBase: "https://www.googleapis.com/calendar/v3",
    clientIdEnv: "GOOGLE_CONNECTOR_CLIENT_ID", clientSecretEnv: "GOOGLE_CONNECTOR_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/calendar"],
    extraAuthParams: { access_type: "offline", prompt: "consent" },
    endpoints: {
      "calendar.read": {
        path: "/calendars/primary/events?maxResults=50&singleEvents=true&orderBy=startTime",
        recordType: "event",
        list: (b) => b.items ?? [],
        map: (e) => ({
          external_id: e.id, title: e.summary, body: e.description,
          url: e.htmlLink, occurred_at: e.start?.dateTime ?? e.start?.date, metadata: e,
        }),
      },
    },
  },
  google_meet: {
    authUrl: G, tokenUrl: GT, apiBase: "https://www.googleapis.com/calendar/v3",
    clientIdEnv: "GOOGLE_CONNECTOR_CLIENT_ID", clientSecretEnv: "GOOGLE_CONNECTOR_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
    extraAuthParams: { access_type: "offline", prompt: "consent" },
    endpoints: {
      "meetings.read": {
        path: "/calendars/primary/events?maxResults=50&singleEvents=true&orderBy=startTime",
        recordType: "event",
        list: (b) => (b.items ?? []).filter((e: any) => e.conferenceData || e.hangoutLink),
        map: (e) => ({
          external_id: e.id, title: e.summary ?? "Meeting", body: e.description,
          url: e.hangoutLink ?? e.htmlLink, occurred_at: e.start?.dateTime ?? e.start?.date, metadata: e,
        }),
      },
    },
  },
  google_drive: {
    rateLimitPerMinute: 240, webhooks: true,
    authUrl: G, tokenUrl: GT, apiBase: "https://www.googleapis.com/drive/v3",
    clientIdEnv: "GOOGLE_CONNECTOR_CLIENT_ID", clientSecretEnv: "GOOGLE_CONNECTOR_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/drive"],
    extraAuthParams: { access_type: "offline", prompt: "consent" },
    endpoints: {
      "files.read": {
        path: "/files?pageSize=50&fields=files(id,name,mimeType,webViewLink,modifiedTime)",
        recordType: "file",
        list: (b) => b.files ?? [],
        map: (f) => ({ external_id: f.id, title: f.name, url: f.webViewLink, occurred_at: f.modifiedTime, metadata: f }),
        searchPath: (q) =>
          `/files?pageSize=50&q=${encodeURIComponent(`name contains '${q}'`)}&fields=files(id,name,mimeType,webViewLink,modifiedTime)`,
      },
    },
  },
  google_contacts: {
    authUrl: G, tokenUrl: GT, apiBase: "https://people.googleapis.com/v1",
    clientIdEnv: "GOOGLE_CONNECTOR_CLIENT_ID", clientSecretEnv: "GOOGLE_CONNECTOR_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/contacts"],
    extraAuthParams: { access_type: "offline", prompt: "consent" },
    endpoints: {
      "contacts.read": {
        path: "/people/me/connections?pageSize=100&personFields=names,emailAddresses,phoneNumbers",
        recordType: "contact",
        list: (b) => b.connections ?? [],
        map: (p) => ({
          external_id: p.resourceName,
          title: p.names?.[0]?.displayName ?? "Contact",
          body: p.emailAddresses?.[0]?.value ?? p.phoneNumbers?.[0]?.value,
          metadata: p,
        }),
      },
    },
  },
  outlook: {
    rateLimitPerMinute: 180, webhooks: true,
    authUrl: `${MS}/authorize`, tokenUrl: `${MS}/token`, apiBase: "https://graph.microsoft.com/v1.0",
    clientIdEnv: "MICROSOFT_CONNECTOR_CLIENT_ID", clientSecretEnv: "MICROSOFT_CONNECTOR_CLIENT_SECRET",
    scopes: ["offline_access", "openid", "profile", "email", "User.Read", "Mail.Read", "Mail.Send", "Contacts.Read"],
    endpoints: {
      "email.read": {
        path: "/me/messages?$top=25&$orderby=receivedDateTime desc&$select=id,subject,bodyPreview,from,toRecipients,receivedDateTime,webLink,isRead,conversationId",
        recordType: "message",
        list: (b) => b.value ?? [],
        map: (m) => ({
          external_id: m.id,
          title: m.subject ?? "(no subject)",
          body: m.bodyPreview ?? null,
          author: m.from?.emailAddress?.address ?? null,
          participants: [
            m.from?.emailAddress?.address,
            ...(m.toRecipients ?? []).map((r: any) => r.emailAddress?.address),
          ].filter(Boolean),
          url: m.webLink ?? null,
          occurred_at: m.receivedDateTime ?? null,
          metadata: { is_read: m.isRead ?? null, conversation_id: m.conversationId ?? null },
        }),
        searchPath: (q) => `/me/messages?$top=25&$search="${encodeURIComponent(q)}"`,
      },
      "contacts.read": {
        path: "/me/contacts?$top=100&$select=id,displayName,emailAddresses,mobilePhone,businessPhones",
        recordType: "contact",
        list: (b) => b.value ?? [],
        map: (c) => ({
          external_id: c.id,
          title: c.displayName ?? "Contact",
          body: c.emailAddresses?.[0]?.address ?? c.mobilePhone ?? c.businessPhones?.[0] ?? null,
          participants: (c.emailAddresses ?? []).map((e: any) => e.address).filter(Boolean),
          metadata: c,
        }),
      },
    },
  },
  slack: {
    rateLimitPerMinute: 60, webhooks: true,
    authUrl: "https://slack.com/oauth/v2/authorize", tokenUrl: "https://slack.com/api/oauth.v2.access",
    apiBase: "https://slack.com/api",
    clientIdEnv: "SLACK_CONNECTOR_CLIENT_ID", clientSecretEnv: "SLACK_CONNECTOR_CLIENT_SECRET",
    scopes: ["channels:read", "channels:history", "chat:write", "users:read"],
    endpoints: {
      "chat.read": {
        path: "/conversations.list?limit=50",
        recordType: "message",
        list: (b) => b.channels ?? [],
        map: (c) => ({ external_id: c.id, title: `#${c.name}`, body: c.purpose?.value, metadata: c }),
      },
    },
  },
  github: {
    rateLimitPerMinute: 120, webhooks: true,
    authUrl: "https://github.com/login/oauth/authorize", tokenUrl: "https://github.com/login/oauth/access_token",
    apiBase: "https://api.github.com",
    clientIdEnv: "GITHUB_CONNECTOR_CLIENT_ID", clientSecretEnv: "GITHUB_CONNECTOR_CLIENT_SECRET",
    scopes: ["repo", "read:user"],
    endpoints: {
      "code.repos": {
        path: "/user/repos?per_page=50&sort=updated",
        recordType: "repo",
        list: (b) => (Array.isArray(b) ? b : []),
        map: (r) => ({ external_id: String(r.id), title: r.full_name, body: r.description, url: r.html_url, occurred_at: r.updated_at, metadata: r }),
      },
      "issues.read": {
        path: "/issues?per_page=50",
        recordType: "issue",
        list: (b) => (Array.isArray(b) ? b : []),
        map: (i) => ({ external_id: String(i.id), title: i.title, body: i.body, url: i.html_url, occurred_at: i.updated_at, metadata: i }),
      },
    },
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization", tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    apiBase: "https://api.linkedin.com/v2",
    clientIdEnv: "LINKEDIN_CONNECTOR_CLIENT_ID", clientSecretEnv: "LINKEDIN_CONNECTOR_CLIENT_SECRET",
    scopes: ["r_liteprofile", "r_emailaddress"],
    endpoints: {
      "profile.read": {
        path: "/me",
        recordType: "profile",
        list: (b) => [b],
        map: (p) => ({ external_id: p.id ?? "me", title: p.localizedFirstName ? `${p.localizedFirstName} ${p.localizedLastName ?? ""}`.trim() : "Profile", metadata: p }),
      },
    },
  },
  zoom: {
    rateLimitPerMinute: 60,
    authUrl: "https://zoom.us/oauth/authorize", tokenUrl: "https://zoom.us/oauth/token",
    apiBase: "https://api.zoom.us/v2",
    clientIdEnv: "ZOOM_CONNECTOR_CLIENT_ID", clientSecretEnv: "ZOOM_CONNECTOR_CLIENT_SECRET",
    endpoints: {
      "meetings.read": {
        path: "/users/me/meetings?page_size=50",
        recordType: "event",
        list: (b) => b.meetings ?? [],
        map: (m) => ({ external_id: String(m.id), title: m.topic, url: m.join_url, occurred_at: m.start_time, metadata: m }),
      },
    },
  },
  notion: {
    rateLimitPerMinute: 60,
    authUrl: "https://api.notion.com/v1/oauth/authorize", tokenUrl: "https://api.notion.com/v1/oauth/token",
    apiBase: "https://api.notion.com/v1",
    clientIdEnv: "NOTION_CONNECTOR_CLIENT_ID", clientSecretEnv: "NOTION_CONNECTOR_CLIENT_SECRET",
    extraAuthParams: { owner: "user" },
    endpoints: {
      "docs.read": {
        path: "/search",
        method: "POST",
        requestBody: { page_size: 50, sort: { direction: "descending", timestamp: "last_edited_time" } },
        recordType: "document",
        list: (b) => b.results ?? [],
        map: (p) => ({
          external_id: p.id,
          title: p.properties?.title?.title?.[0]?.plain_text ?? p.properties?.Name?.title?.[0]?.plain_text ?? "Notion page",
          url: p.url, occurred_at: p.last_edited_time, metadata: p,
        }),
      },
    },
  },
  jira: {
    rateLimitPerMinute: 60,
    authUrl: "https://auth.atlassian.com/authorize", tokenUrl: "https://auth.atlassian.com/oauth/token",
    apiBase: "https://api.atlassian.com",
    clientIdEnv: "ATLASSIAN_CONNECTOR_CLIENT_ID", clientSecretEnv: "ATLASSIAN_CONNECTOR_CLIENT_SECRET",
    scopes: ["read:jira-work", "write:jira-work", "offline_access"],
    extraAuthParams: { audience: "api.atlassian.com", prompt: "consent" },
    endpoints: {
      "issues.read": {
        path: "/ex/jira/{cloud}/rest/api/3/search?maxResults=50&jql=assignee=currentUser()%20order%20by%20updated%20DESC",
        recordType: "issue",
        list: (b) => b.issues ?? [],
        map: (i) => ({
          external_id: i.id, title: `${i.key} ${i.fields?.summary ?? ""}`.trim(),
          body: i.fields?.status?.name, occurred_at: i.fields?.updated, metadata: i,
        }),
      },
    },
  },
  salesforce: {
    rateLimitPerMinute: 60,
    authUrl: "https://login.salesforce.com/services/oauth2/authorize",
    tokenUrl: "https://login.salesforce.com/services/oauth2/token",
    clientIdEnv: "SALESFORCE_CONNECTOR_CLIENT_ID", clientSecretEnv: "SALESFORCE_CONNECTOR_CLIENT_SECRET",
    scopes: ["api", "refresh_token"],
    endpoints: {
      "crm.read": {
        path: "/services/data/v60.0/query?q=" +
          encodeURIComponent("SELECT Id, Name, StageName, Amount, LastModifiedDate FROM Opportunity ORDER BY LastModifiedDate DESC LIMIT 50"),
        recordType: "deal",
        list: (b) => b.records ?? [],
        map: (d) => ({
          external_id: d.Id, title: d.Name, body: d.StageName,
          occurred_at: d.LastModifiedDate, metadata: d,
        }),
      },
    },
  },
  stripe: {
    apiKeyEnv: "STRIPE_SECRET_KEY", apiBase: "https://api.stripe.com/v1",
    endpoints: {
      "payments.read": {
        path: "/charges?limit=50",
        recordType: "payment",
        list: (b) => b.data ?? [],
        map: (c) => ({
          external_id: c.id,
          title: `${(c.amount / 100).toFixed(2)} ${String(c.currency).toUpperCase()}`,
          body: c.description, occurred_at: new Date(c.created * 1000).toISOString(), metadata: c,
        }),
      },
    },
  },
};

// Full implementation is deployed at: https://sbayuqgomlflmxgicplz.supabase.co/functions/v1/connector-hub
// The serve() handler, OAuth callback, webhook handler, Vault, runSync, and ACTIONS
// are all in the deployed version. This file is for version control reference.
serve(async (_req) => new Response("connector-hub deployed"));
