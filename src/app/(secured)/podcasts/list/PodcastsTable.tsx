"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import CustomModal from "@/components/molecules/CustomModal";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import Pagination from "@/components/atoms/Pagination";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import FormBuilder from "@/components/molecules/FormBuilder";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import {
  CreatePodcastPayload,
  Podcast,
  UpdatePodcastPayload,
} from "@/app/(secured)/podcasts/helpers/types";
import { useTableQuerySync } from "@/hooks/useTableQuerySync";
import { FORM_FIELDS_TYPES } from "@/shared/constants";
import {
  createPodcastAction,
  deletePodcastAction,
  togglePodcastActiveAction,
  updatePodcastAction,
} from "@/api/podcasts";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { isValidUrl } from "@/shared/utils";
import { PODCAST_ENABLE_TYPE } from "../helpers/types";

interface PodcastsTableProps {
  data: Podcast[];
  totalCount: number;
  searchString: string;
}

type CreatePodcastFormValues = {
  title: string;
  description: string;
  mediaUrl: string;
};

const PodcastsTable = ({
  data,
  totalCount,
  searchString,
}: PodcastsTableProps) => {
  const router = useRouter();
  const t = useTranslations("podcasts");

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } =
    useTableQuerySync({
      defaultPageSize: 10,
      defaultSortKey: "",
    });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    episode: Podcast | null;
  }>({
    open: false,
    episode: null,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    episode: Podcast | null;
  }>({
    open: false,
    episode: null,
  });

  // Player modal state removed – listing now shows embedded players directly
  const handleCreatePodcast = useCallback(
    async (data: CreatePodcastFormValues) => {
      const mediaUrl = data.mediaUrl.trim();
      const title = data.title?.trim();
      const description = data.description?.trim();

      if (!mediaUrl) {
        toast.error(t("Media URL is required"));
        return;
      }

      const payload: CreatePodcastPayload = {
        mediaUrl,
        title: title || undefined,
        description: description || undefined,
      };

      setIsCreating(true);
      try {
        const res = await createPodcastAction(payload);
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;

        if (!ok) {
          toast.error(
            (res as { message?: string })?.message ||
              t("Failed to create podcast"),
          );
          return;
        }

        toast.success(
          (res as { message?: string })?.message ||
            t("Podcast created successfully"),
        );
        setIsCreateOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Failed to create podcast", error);
        toast.error(t("Failed to create podcast"));
      } finally {
        setIsCreating(false);
      }
    },
    [router, t],
  );

  const handleDeletePodcast = useCallback(
    async (id: string) => {
      if (!id) return;
      setDeletingId(id);
      try {
        const res = await deletePodcastAction(id);
        console.log("response of delete podcast", res);
        router.refresh();
        if (res && typeof res === "object" && "status" in res && !res.status) {
          toast.error(
            (res as { message?: string }).message ||
              t("Failed to delete podcast"),
          );
        } else {
          toast.success(
            (res as { message?: string })?.message ||
              t("Podcast deleted successfully"),
          );
        }
      } catch (error) {
        console.error("Failed to delete podcast", error);
        toast.error(t("Failed to delete podcast"));
      } finally {
        setDeletingId(null);
      }
    },
    [router, t],
  );

  const handleToggleActive = useCallback(
    async (episode: Podcast) => {
      if (!episode.id) return;

      const type = episode.isActive
        ? PODCAST_ENABLE_TYPE.Disable
        : PODCAST_ENABLE_TYPE.Enable;

      setTogglingId(episode.id);
      try {
        const res = await togglePodcastActiveAction(episode.id, type);
        console.log("response of toggle podcast active", res);

        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;

        if (!ok) {
          toast.error(
            (res as { message?: string })?.message ||
              t("Failed to update podcast status"),
          );
          return;
        }

        toast.success(
          (res as { message?: string })?.message ||
            (episode.isActive
              ? t("Podcast disabled successfully")
              : t("Podcast enabled successfully")),
        );
        router.refresh();
      } catch (error) {
        console.error("Failed to toggle podcast status", error);
        toast.error(t("Failed to update podcast status"));
      } finally {
        setTogglingId(null);
      }
    },
    [router, t],
  );

  const handleUpdatePodcast = useCallback(
    async (data: CreatePodcastFormValues) => {
      if (!editModal.episode) return;

      const mediaUrl = data.mediaUrl.trim();
      const title = data.title?.trim();
      const description = data.description?.trim();

      if (!mediaUrl) {
        toast.error(t("Media URL is required"));
        return;
      }

      const payload: UpdatePodcastPayload = {
        podcastId: editModal.episode.id,
        mediaUrl,
        title: title || undefined,
        description: description || undefined,
      };

      setIsUpdating(true);
      try {
        const res = await updatePodcastAction(payload);
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;

        if (!ok) {
          toast.error(
            (res as { message?: string })?.message ||
              t("Failed to update podcast"),
          );
          return;
        }

        toast.success(
          (res as { message?: string })?.message ||
            t("Podcast updated successfully"),
        );
        setEditModal({ open: false, episode: null });
        router.refresh();
      } catch (error) {
        console.error("Failed to update podcast", error);
        toast.error(t("Failed to update podcast"));
      } finally {
        setIsUpdating(false);
      }
    },
    [editModal, router, t],
  );

  return (
    <>
      {/* Header bar (same as Users table) */}
      <div className="bg-bgwhite px-5 3xl:px-6 pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("Podcasts")}
            </h2>
            <p className="text-[14px] font-medium text-gray-500">
              {t("Header subtitle")}
            </p>
          </div>
          <div className="flex items-initial space-x-4">
            <SearchToolbar
              initialQuery={searchString}
              placeholder={t("Search Podcasts")}
            />
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
            >
              <Plus size={18} />
              <span>{t("Create")}</span>
            </button>
            {/* <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
            >
              <Menu size={18} />
              <span>{t("Filters")}</span>
            </button> */}
          </div>
        </div>
      </div>

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t("Podcast Filters")}
        footer={null}
      >
        <p className="text-sm text-gray-600">
          {t("Filter sidebar description")}
        </p>
      </FilterSidebar>

      {/* List-style podcast items with embedded players */}
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-b-[20px] shadow-sm p-[15px] lg:px-6 lg:py-6 space-y-6 lg:space-y-5">
        {data.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {t("No podcasts found")}
          </div>
        ) : (
          data.map((episode) => (
            <div
              key={episode.id}
              className="flex flex-col lg:flex-row items-stretch gap-2 lg:gap-4 rounded-2xl p-0"
            >
              <div className="flex-1 min-w-0">
                {isValidUrl(episode.mediaUrl) ? (
                  <iframe
                    src={episode.mediaUrl}
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    title={episode.title}
                    className="rounded-xl w-full"
                  />
                ) : (
                  <div className="rounded-xl w-full h-[200px] bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                    {t("Media URL invalid message")}
                  </div>
                )}
              </div>
              <div className="w-full lg:w-56 flex flex-col justify-between gap-3 px-[10px] py-0 lg:py-[10px]">
                <div>
                  <h3 className="text-base dark:text-white/80 font-semibold text-gray-900 mb-0 lg:mb-1 line-clamp-2">
                    {episode.title}
                  </h3>
                  <p
                    className={`${TEXT_SIZE_SM} text-gray-600 dark:text-white/60 line-clamp-2`}
                    title={episode.description}
                  >
                    {episode.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                    {/* Could be localized later if needed */}
                    Created by{" "}
                    <span className="font-medium text-xs text-gray-500 dark:text-white/80">
                      {episode.createdByUser?.name ?? "-"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setEditModal({
                        open: true,
                        episode,
                      })
                    }
                    className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-600 dark:text-white/80 dark:hover:text-black/80 hover:bg-gray-50"
                  >
                    {t("Edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStatusModal({
                        open: true,
                        episode,
                      })
                    }
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-gray-50 ${
                      episode.isActive
                        ? "border-gray-300 text-gray-600"
                        : "border-green-500 text-green-600"
                    } ${togglingId === episode.id ? "opacity-60 cursor-not-allowed" : ""}`}
                    disabled={togglingId === episode.id}
                  >
                    {togglingId === episode.id
                      ? t("Updating")
                      : episode.isActive
                        ? t("Disable")
                        : t("Enable")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal({
                        open: true,
                        id: episode.id,
                      })
                    }
                    className="px-3 py-1.5 rounded-full border border-red-500 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    disabled={deletingId === episode.id}
                  >
                    {deletingId === episode.id ? t("Deleting") : t("Delete")}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination (same behavior as table-based lists) */}
        <div className="pt-4">
          <Pagination
            totalItems={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            title="podcasts"
            className="border-b-0 !pb-0 !px-0"
          />
        </div>
      </div>

      {/* Create Podcast Modal */}
      <CustomModal
        isOpen={isCreateOpen}
        onClose={() => {
          if (isCreating) return;
          setIsCreateOpen(false);
        }}
        title={t("Create Podcast")}
        size="md"
      >
        <FormBuilder<CreatePodcastFormValues>
          formConfig={[
            {
              type: FORM_FIELDS_TYPES.TEXT,
              name: "title",
              label: t("Title"),
              placeholder: t("Enter podcast title (optional)"),
            },
            {
              type: FORM_FIELDS_TYPES.TEXTAREA,
              name: "description",
              label: t("Description"),
              placeholder: t("Enter podcast description (optional)"),
            },
            {
              type: FORM_FIELDS_TYPES.TEXT,
              name: "mediaUrl",
              label: t("Media URL"),
              placeholder: t("Paste podcast embed URL"),
              validation: {
                required: t("Media URL is required"),
                pattern: {
                  value: /^https?:\/\/.+$/i,
                  message: t("URL pattern error"),
                },
              },
            },
          ]}
          onSubmit={handleCreatePodcast}
          submitText={isCreating ? t("Creating") : t("Create Podcast")}
          isLoading={isCreating}
          scrollable={false}
          secondaryAction={
            <span className="text-sm font-medium text-labelprimary dark:text-darklabelprimary">
              {t("Cancel")}
            </span>
          }
          onSecondaryAction={() => {
            if (isCreating) return;
            setIsCreateOpen(false);
          }}
        />
      </CustomModal>

      {/* Edit Podcast Modal */}
      {editModal.episode && (
        <CustomModal
          isOpen={editModal.open}
          onClose={() => {
            if (isUpdating) return;
            setEditModal({ open: false, episode: null });
          }}
          title={t("Edit Podcast")}
          size="md"
        >
          <FormBuilder<CreatePodcastFormValues>
            defaultValues={{
              title: editModal.episode.title ?? "",
              description: editModal.episode.description ?? "",
              mediaUrl: editModal.episode.mediaUrl ?? "",
            }}
            formConfig={[
              {
                type: FORM_FIELDS_TYPES.TEXT,
                name: "title",
                label: t("Title"),
                placeholder: t("Enter podcast title (optional)"),
              },
              {
                type: FORM_FIELDS_TYPES.TEXTAREA,
                name: "description",
                label: t("Description"),
                placeholder: t("Enter podcast description (optional)"),
              },
              {
                type: FORM_FIELDS_TYPES.TEXT,
                name: "mediaUrl",
                label: t("Media URL"),
                placeholder: t("Paste podcast embed URL"),
                validation: {
                  required: t("Media URL is required"),
                  pattern: {
                    value: /^https?:\/\/.+$/i,
                    message: t("URL pattern error"),
                  },
                },
              },
            ]}
            onSubmit={handleUpdatePodcast}
            submitText={isUpdating ? t("Saving") : t("Save Changes")}
            isLoading={isUpdating}
            scrollable={false}
            secondaryAction={
              <span className="text-sm font-medium text-labelprimary dark:text-darklabelprimary">
                {t("Cancel")}
              </span>
            }
            onSecondaryAction={() => {
              if (isUpdating) return;
              setEditModal({ open: false, episode: null });
            }}
          />
        </CustomModal>
      )}

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => {
          if (deletingId) return;
          setDeleteModal({ open: false, id: null });
        }}
        onConfirm={async () => {
          if (!deleteModal.id) return;
          await handleDeletePodcast(deleteModal.id);
          setDeleteModal({ open: false, id: null });
        }}
        title={t("Delete Podcast")}
        message={t("Delete Podcast confirmation")}
        isLoading={!!deletingId}
      />

      {/* Enable / Disable confirmation modal */}
      {statusModal.episode && (
        <ConfirmationModal
          isOpen={statusModal.open}
          onClose={() => {
            if (togglingId) return;
            setStatusModal({ open: false, episode: null });
          }}
          onConfirm={async () => {
            if (!statusModal.episode) return;
            await handleToggleActive(statusModal.episode);
            setStatusModal({ open: false, episode: null });
          }}
          title={
            statusModal.episode.isActive
              ? t("Disable Podcast")
              : t("Enable Podcast")
          }
          message={
            statusModal.episode.isActive
              ? t("Disable Podcast confirmation")
              : t("Enable Podcast confirmation")
          }
          isLoading={!!togglingId}
        />
      )}

      {/* Player modal removed as per requirement */}
    </>
  );
};

export default PodcastsTable;
