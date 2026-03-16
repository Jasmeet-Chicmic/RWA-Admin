"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, deleteRequest, putRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import {
  AdminEventDetail,
  EventsListResponse,
  GetEventsParams,
} from "@/app/(secured)/events/helpers/types";

export async function getEventsAction(params: GetEventsParams) {
  return await getRequest<EventsListResponse, GetEventsParams>(
    API_END_POINTS.EVENTS,
    params,
  );
}

export async function deleteEventAction(payload: { eventIds: string[] }) {
  return await deleteRequest<ResponseType, { eventIds: string[] }>(
    API_END_POINTS.EVENTS,
    payload,
  );
}

export async function getEventDetailAction(eventId: string) {
  return await getRequest<
    {
      statusCode: number;
      status: boolean;
      message: string;
      type: string;
      data: AdminEventDetail;
    },
    undefined
  >(`${API_END_POINTS.EVENTS}/${eventId}`, undefined);
}

export async function updateEventAccessAction(params: {
  eventId: string;
  isActive: boolean;
}) {
  const { eventId, isActive } = params;
  return await putRequest<
    ResponseType & { result: string },
    {
      isActive: boolean;
    }
  >(`${API_END_POINTS.EVENTS}/${eventId}/access`, {
    isActive,
  });
}
