"use server";

import { API_END_POINTS } from "@/shared/api";
import { deleteRequest, postRequest } from "@/shared/fetcher";
import { PaymentCard, ResponseType } from "@/shared/types";

export async function addPaymentMethod(payload: PaymentCard) {
  return await postRequest<ResponseType, PaymentCard>(
    API_END_POINTS.PAYMENT_METHODS,
    payload,
  );
}

export async function deletePaymentMethod({
  paymentMethodIds,
  userId,
}: {
  paymentMethodIds: string[];
  userId: string;
}) {
  return await deleteRequest<
    ResponseType,
    { paymentMethodIds: string[]; userId: string }
  >(API_END_POINTS.PAYMENT_METHODS, { paymentMethodIds, userId });
}
