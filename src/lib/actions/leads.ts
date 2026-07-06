"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEditUnlocked } from "@/lib/auth";
import type { LinkedInAccount, PipelineStage, Priority, LeadStatus, ProposalStatus, ContractStatus } from "@/generated/prisma/enums";

export type LeadInput = {
  name: string;
  companyName?: string | null;
  designation?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  industry?: string | null;
  startupStage?: string | null;
  fundingStatus?: string | null;
  companySize?: string | null;
  source?: string | null;
  account: LinkedInAccount;
  leadOwner?: string | null;
  currentStage: PipelineStage;
  priority: Priority;
  status: LeadStatus;
  proposalStatus?: ProposalStatus;
  contractStatus?: ContractStatus;
  probabilityOfClosing?: number | null;
  meetingScheduled?: boolean;
  meetingDate?: string | null;
  nextFollowupDate?: string | null;
  lastActivityDate?: string | null;
  notes?: string | null;
};

function toDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createLead(input: LeadInput) {
  await assertEditUnlocked();
  if (!input.name?.trim()) {
    throw new Error("Lead name is required");
  }

  await prisma.lead.create({
    data: {
      name: input.name.trim(),
      companyName: input.companyName || null,
      designation: input.designation || null,
      linkedinUrl: input.linkedinUrl || null,
      email: input.email || null,
      phone: input.phone || null,
      country: input.country || null,
      city: input.city || null,
      industry: input.industry || null,
      startupStage: input.startupStage || null,
      fundingStatus: input.fundingStatus || null,
      companySize: input.companySize || null,
      source: input.source || null,
      account: input.account,
      leadOwner: input.leadOwner || null,
      currentStage: input.currentStage,
      priority: input.priority,
      status: input.status,
      proposalStatus: input.proposalStatus,
      contractStatus: input.contractStatus,
      probabilityOfClosing: input.probabilityOfClosing ?? null,
      meetingScheduled: input.meetingScheduled ?? false,
      meetingDate: toDate(input.meetingDate),
      nextFollowupDate: toDate(input.nextFollowupDate),
      lastActivityDate: toDate(input.lastActivityDate) ?? new Date(),
      notes: input.notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function updateLead(id: string, input: LeadInput) {
  await assertEditUnlocked();
  if (!input.name?.trim()) {
    throw new Error("Lead name is required");
  }

  await prisma.lead.update({
    where: { id },
    data: {
      name: input.name.trim(),
      companyName: input.companyName || null,
      designation: input.designation || null,
      linkedinUrl: input.linkedinUrl || null,
      email: input.email || null,
      phone: input.phone || null,
      country: input.country || null,
      city: input.city || null,
      industry: input.industry || null,
      startupStage: input.startupStage || null,
      fundingStatus: input.fundingStatus || null,
      companySize: input.companySize || null,
      source: input.source || null,
      account: input.account,
      leadOwner: input.leadOwner || null,
      currentStage: input.currentStage,
      priority: input.priority,
      status: input.status,
      proposalStatus: input.proposalStatus,
      contractStatus: input.contractStatus,
      probabilityOfClosing: input.probabilityOfClosing ?? null,
      meetingScheduled: input.meetingScheduled ?? false,
      meetingDate: toDate(input.meetingDate),
      nextFollowupDate: toDate(input.nextFollowupDate),
      lastActivityDate: toDate(input.lastActivityDate),
      notes: input.notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function deleteLead(id: string) {
  await assertEditUnlocked();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function bulkDeleteLeads(ids: string[]) {
  await assertEditUnlocked();
  await prisma.lead.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function duplicateLead(id: string) {
  await assertEditUnlocked();
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead not found");

  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = lead;
  await prisma.lead.create({
    data: {
      ...rest,
      name: `${lead.name} (Copy)`,
    },
  });

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function updateLeadStage(id: string, stage: PipelineStage) {
  await assertEditUnlocked();
  await prisma.lead.update({
    where: { id },
    data: { currentStage: stage, lastActivityDate: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function bulkUpdateStage(ids: string[], stage: PipelineStage) {
  await assertEditUnlocked();
  await prisma.lead.updateMany({
    where: { id: { in: ids } },
    data: { currentStage: stage, lastActivityDate: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function addLeadNote(leadId: string, body: string, author?: string) {
  await assertEditUnlocked();
  if (!body.trim()) return;
  await prisma.note.create({
    data: { leadId, body: body.trim(), author: author || null },
  });
  revalidatePath("/");
  revalidatePath("/leads");
}

export async function importLeadsCsv(rows: LeadInput[]) {
  for (const row of rows) {
    if (!row.name?.trim()) continue;
    await createLead(row);
  }
}
