"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { addAppointmentSchema } from "./shema";

export const addAppointment = actionClient(
  addAppointmentSchema,
  async (input) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado.");
    }

    if (!session.user.clinic?.id) {
      throw new Error("Clínica não encontrada.");
    }

    const formattedDate = dayjs(input.date).format("YYYY-MM-DD");

    const availableTimes = await getAvailableTimes({
      doctorId: input.doctorId,
      date: formattedDate,
    });

    if (!availableTimes?.data) {
      throw new Error("Nenhum horário disponível para a data selecionada.");
    }

    const isTimeAvailable = availableTimes.data.some(
      (time) => time.value === input.time && time.available
    );

    if (!isTimeAvailable) {
      throw new Error("O horário selecionado não está disponível.");
    }

    const dateObj = dayjs(input.date);
    if (!dateObj.isValid()) {
      throw new Error("Data inválida.");
    }

    const [hour, minute] = input.time.split(":").map(Number);

    const appointmentDateTime = dateObj
      .set("hour", hour)
      .set("minute", minute)
      .set("second", 0)
      .set("millisecond", 0)
      .toDate();

    const { date, ...rest } = input;

    await db.insert(appointmentsTable).values({
      ...rest,
      clinicId: session.user.clinic.id,
      date: appointmentDateTime,
    });

    revalidatePath("/appointments");
  }
);
