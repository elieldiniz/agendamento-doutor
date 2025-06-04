"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteDoctor = actionClient(
  z.object({
    id: z.string().uuid(),
  }),
  async (input) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, input.id),
    });

    if (!doctor || doctor.clinicId !== session.user.clinic?.id) {
      throw new Error("Médico não encontrado");
    }

    await db.delete(doctorsTable).where(eq(doctorsTable.id, input.id));

    revalidatePath("/doctors");
  }
);
