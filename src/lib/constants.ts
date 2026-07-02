import type { LinkedInAccount, PipelineStage, Priority, LeadStatus, ProposalStatus, ContractStatus } from "@/generated/prisma/enums";

export const ACCOUNT_LABELS: Record<LinkedInAccount, string> = {
  KANTH: "Dr. Kanth Miriyala",
  SHAKU: "Shaku Miriyala",
};

export const ACCOUNTS: LinkedInAccount[] = ["KANTH", "SHAKU"];

export const PIPELINE_STAGES: { value: PipelineStage; label: string; color: string }[] = [
  { value: "NEW_LEAD", label: "New Lead", color: "#94a3b8" },
  { value: "CONNECTION_SENT", label: "Connection Sent", color: "#818cf8" },
  { value: "CONNECTED", label: "Connected", color: "#60a5fa" },
  { value: "CONVERSATION_STARTED", label: "Conversation Started", color: "#38bdf8" },
  { value: "ENGAGED", label: "Engaged", color: "#22d3ee" },
  { value: "INTERESTED", label: "Interested", color: "#2dd4bf" },
  { value: "DISCOVERY_SCHEDULED", label: "Discovery Scheduled", color: "#34d399" },
  { value: "DISCOVERY_COMPLETED", label: "Discovery Completed", color: "#4ade80" },
  { value: "PROTOTYPE_READY", label: "Prototype Ready", color: "#a3e635" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent", color: "#facc15" },
  { value: "NEGOTIATION", label: "Negotiation", color: "#fb923c" },
  { value: "CONTRACT_SENT", label: "Contract Sent", color: "#f472b6" },
  { value: "CUSTOMER", label: "Customer", color: "#34d399" },
  { value: "LOST", label: "Lost", color: "#f87171" },
];

export const STAGE_LABELS: Record<PipelineStage, string> = PIPELINE_STAGES.reduce(
  (acc, s) => ({ ...acc, [s.value]: s.label }),
  {} as Record<PipelineStage, string>
);

export const STAGE_COLORS: Record<PipelineStage, string> = PIPELINE_STAGES.reduce(
  (acc, s) => ({ ...acc, [s.value]: s.color }),
  {} as Record<PipelineStage, string>
);

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  WON: "Won",
  LOST: "Lost",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  PAUSED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  WON: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  NONE: "None",
  CREATED: "Created",
  SENT: "Sent",
  VIEWED: "Viewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  NONE: "None",
  DRAFTED: "Drafted",
  SENT: "Sent",
  PENDING: "Pending",
  SIGNED: "Signed",
};

// Drives the dashboard Outreach Funnel. Values come from the manually
// editable OutreachMetric totals (see "Edit Outreach Numbers"), not from
// individual CRM lead records — most outreach never gets a named lead.
export const FUNNEL_METRIC_STAGES: { key: FunnelMetricKey; label: string }[] = [
  { key: "requestsSent", label: "Connection Requests Sent" },
  { key: "connectionsAccepted", label: "Total Leads (Connected)" },
  { key: "conversationStarted", label: "Conversation Started" },
  { key: "engaged", label: "Engaged" },
  { key: "interested", label: "Interested" },
  { key: "firstMessagesSent", label: "First Message Sent" },
  { key: "firstFollowupsSent", label: "First Follow-up Sent" },
  { key: "secondFollowupsSent", label: "Second Follow-up Sent" },
  { key: "thirdFollowupsSent", label: "Third Follow-up Sent" },
  { key: "repliesReceived", label: "Replies Received" },
  { key: "callsScheduled", label: "Discovery Call Scheduled" },
  { key: "callsCompleted", label: "Discovery Call Completed" },
  { key: "prototypeShared", label: "Prototype Shared" },
  { key: "proposalSent", label: "Proposal Sent" },
  { key: "negotiation", label: "Negotiation" },
  { key: "contractSent", label: "Contract Sent" },
  { key: "contractSigned", label: "Contract Signed" },
  { key: "wonDeals", label: "Deal Won" },
  { key: "lostDeals", label: "Deal Lost" },
];

export type FunnelMetricKey =
  | "requestsSent"
  | "connectionsAccepted"
  | "conversationStarted"
  | "engaged"
  | "interested"
  | "firstMessagesSent"
  | "firstFollowupsSent"
  | "secondFollowupsSent"
  | "thirdFollowupsSent"
  | "repliesReceived"
  | "callsScheduled"
  | "callsCompleted"
  | "prototypeShared"
  | "proposalSent"
  | "negotiation"
  | "contractSent"
  | "contractSigned"
  | "wonDeals"
  | "lostDeals";
