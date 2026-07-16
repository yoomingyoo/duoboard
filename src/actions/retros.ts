"use server";

import { revalidatePath } from "next/cache";
import { createRetroRecord, deleteRetroRecord, updateRetroRecord } from "../lib/retros";

export async function createRetroAction(formData: FormData) {
  await createRetroRecord({
    author: formData.get("author"),
    weekOf: formData.get("weekOf"),
    good: formData.get("good"),
    bad: formData.get("bad"),
    nextAction: formData.get("nextAction"),
  });

  revalidatePath("/retro");
}

export async function updateRetroAction(formData: FormData) {
  await updateRetroRecord({
    retroId: formData.get("retroId"),
    author: formData.get("author"),
    weekOf: formData.get("weekOf"),
    good: formData.get("good"),
    bad: formData.get("bad"),
    nextAction: formData.get("nextAction"),
  });

  revalidatePath("/retro");
}

export async function deleteRetroAction(formData: FormData) {
  await deleteRetroRecord({
    retroId: formData.get("retroId"),
  });

  revalidatePath("/retro");
}
