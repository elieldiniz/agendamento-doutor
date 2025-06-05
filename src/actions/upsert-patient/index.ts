"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./shema";

export const upsertPatient = actionClient(upsertPatientSchema, async (input) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  await db
    .insert(patientsTable)
    .values({
      ...input,
      id: input.id,
      clinicId: session.user.clinic.id,
    })
    .onConflictDoUpdate({
      target: [patientsTable.id],
      set: {
        ...input,
      },
    });

  revalidatePath("/patients");
});
