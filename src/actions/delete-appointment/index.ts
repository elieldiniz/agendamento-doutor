"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const deleteAppointmentSchema = z.object({
  id: z.string().uuid(),
});

export const deleteAppointment = actionClient
  .inputSchema(deleteAppointmentSchema)
  .action(async ({ parsedInput: input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, input.id),
    });
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }
    if (appointment.clinicId !== session.user.clinic?.id) {
      throw new Error("Agendamento não encontrado");
    }
    await db.delete(appointmentsTable).where(eq(appointmentsTable.id, input.id));
    revalidatePath("/appointments");
  });