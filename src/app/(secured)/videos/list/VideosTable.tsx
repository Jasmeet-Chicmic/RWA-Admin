"use client";

import { useCallback, useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import CustomModal from "@/components/molecules/CustomModal";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import Pagination from "@/components/atoms/Pagination";
import Table, { TableColumn } from "@/components/atoms/Table";
import ImageWithFallback from "@/components/atoms/Image/ImageWithFallback";
import FormBuilder from "@/components/molecules/FormBuilder";
import { Video } from "@/app/(secured)/videos/helpers/types";
import { useTableQuerySync } from "@/hooks/useTableQuerySync";
import { FORM_FIELDS_TYPES } from "@/shared/constants";
import {
  createVideoAction,
  deleteVideoAction,
  updateVideoAction,
} from "@/api/videos";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { videoPlaceholder } from "@/assets";
type VideoFormValues = {
  title: string;
  description: string;
  youTubeUrl: string;
  thumbnailUrl: string;
};

interface VideosTableProps {
  data: Video[];
  totalCount: number;
  searchText: string;
}

const VideosTable = ({ data, totalCount, searchText }: VideosTableProps) => {
  const router = useRouter();
  const t = useTranslations("videos");

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } =
    useTableQuerySync({
      defaultPageSize: 10,
      defaultSortKey: "",
    });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    video: Video | null;
  }>({ open: false, video: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateVideo = useCallback(
    async (formData: VideoFormValues) => {
      const title = formData.title?.trim() ?? "";
      const description = formData.description?.trim() ?? "";
      const youTubeUrl = formData.youTubeUrl?.trim() ?? "";
      const thumbnailUrl = formData.thumbnailUrl?.trim() ?? "";

      if (!youTubeUrl) {
        toast.error(t("YouTube URL is required"));
        return;
      }

      setIsCreating(true);
      try {
        const res = await createVideoAction({
          title,
          description,
          youTubeUrl,
          thumbnailUrl: thumbnailUrl || youTubeUrl,
        });
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;

        if (!ok) {
          toast.error(
            (res as { message?: string })?.message ??
              t("Failed to create video"),
          );
          return;
        }

        toast.success(
          (res as { message?: string })?.message ??
            t("Video created successfully"),
        );
        setIsCreateOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Failed to create video", error);
        toast.error(t("Failed to create video"));
      } finally {
        setIsCreating(false);
      }
    },
    [router, t],
  );

  const handleUpdateVideo = useCallback(
    async (formData: VideoFormValues) => {
      if (!editModal.video) return;

      const title = formData.title?.trim() ?? "";
      const description = formData.description?.trim() ?? "";
      const youTubeUrl = formData.youTubeUrl?.trim() ?? "";
      const thumbnailUrl = formData.thumbnailUrl?.trim() ?? "";

      if (!youTubeUrl) {
        toast.error(t("YouTube URL is required"));
        return;
      }

      setIsUpdating(true);
      try {
        const res = await updateVideoAction({
          videoId: editModal.video.id,
          title,
          description,
          youTubeUrl,
          thumbnailUrl: thumbnailUrl || youTubeUrl,
        });
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;

        if (!ok) {
          toast.error(
            (res as { message?: string })?.message ??
              t("Failed to update video"),
          );
          return;
        }

        toast.success(
          (res as { message?: string })?.message ??
            t("Video updated successfully"),
        );
        setEditModal({ open: false, video: null });
        router.refresh();
      } catch (error) {
        console.error("Failed to update video", error);
        toast.error(t("Failed to update video"));
      } finally {
        setIsUpdating(false);
      }
    },
    [editModal.video, router, t],
  );

  const handleDeleteVideo = useCallback(
    async (id: string) => {
      if (!id) return;
      setDeletingId(id);
      try {
        const res = await deleteVideoAction(id);
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;
        if (ok) {
          toast.success(
            (res as { message?: string })?.message ??
              t("Video deleted successfully"),
          );
          setDeleteModal({ open: false, id: null });
          router.refresh();
        } else {
          toast.error(
            (res as { message?: string })?.message ??
              t("Failed to delete video"),
          );
          setDeleteModal({ open: false, id: null });
        }
      } catch (error) {
        console.error("Failed to delete video", error);
        toast.error(t("Failed to delete video"));
        setDeleteModal({ open: false, id: null });
      } finally {
        setDeletingId(null);
      }
    },
    [router, t],
  );

  const columns: TableColumn<Video>[] = [
    {
      title: t("Thumbnail"),
      field: "thumbnailUrl",
      width: "w-[120px]",
      render: (item) =>
        item.thumbnailUrl ? (
          <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            <ImageWithFallback
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="80px"
              fallbackSrc={videoPlaceholder.src}
            />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      title: t("Title"),
      field: "title",
      render: (item) => (
        <span
          className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}
          title={item.title}
        >
          {item.title || "—"}
        </span>
      ),
    },
    {
      title: t("Description"),
      field: "description",
      render: (item) => (
        <p
          className={`${TEXT_SIZE_SM} text-textparagraph dark:text-textparagraphlight line-clamp-2 max-w-[280px]`}
          title={item.description}
        >
          {item.description || "—"}
        </p>
      ),
    },
    {
      title: t("YouTube URL"),
      field: "youTubeUrl",
      render: (item) =>
        item.youTubeUrl ? (
          <Link
            href={item.youTubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primarycolor dark:text-white hover:underline text-sm truncate max-w-[200px] block"
          >
            {item.youTubeUrl}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      title: t("Actions"),
      field: "",
      fixed: "right",
      render: (item) => (
        <div className="flex items-center justify-end space-x-3">
          {item.youTubeUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.youTubeUrl, "_blank", "noopener,noreferrer");
              }}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("View")}
            >
              <Eye size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditModal({ open: true, video: item });
            }}
            className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
            title={t("Edit")}
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ open: true, id: item.id });
            }}
            className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext disabled:opacity-50"
            title={t("Delete")}
            disabled={deletingId === item.id}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-bgwhite px-[15px] lg:px-5 3xl:px-6 pt-[15px] lg:pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("Videos")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("Header subtitle")}
            </p>
          </div>
          <div className="flex items-initial space-x-4">
            <SearchToolbar
              initialQuery={searchText}
              placeholder={t("Search Videos")}
              queryParamName="searchText"
            />
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
            >
              <Plus size={18} />
              <span>{t("Create")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-b-[20px] shadow-sm overflow-hidden">
        <Table<Video>
          data={data}
          columns={columns}
          keyExtractor={(item) => item.id}
          hideSelectCol
          emptyMessage={t("No videos found")}
        />
        <div>
          <Pagination
            totalItems={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            title="videos"
          />
        </div>
      </div>

      <CustomModal
        isOpen={isCreateOpen}
        onClose={() => {
          if (isCreating) return;
          setIsCreateOpen(false);
        }}
        title={t("Create Video")}
        size="md"
      >
        <FormBuilder<VideoFormValues>
          formConfig={[
            {
              type: FORM_FIELDS_TYPES.TEXT,
              name: "title",
              label: t("Title"),
              placeholder: t("Enter video title"),
            },
            {
              type: FORM_FIELDS_TYPES.TEXTAREA,
              name: "description",
              label: `${t("Description")} (${t("Optional")})`,
              placeholder: t("Enter video description"),
            },
            {
              type: FORM_FIELDS_TYPES.TEXT,
              name: "youTubeUrl",
              label: t("YouTube URL"),
              placeholder: "https://www.youtube.com/watch?v=...",
              validation: {
                required: t("YouTube URL is required"),
                pattern: {
                  value: /^https?:\/\/.+/i,
                  message: t("URL pattern error"),
                },
              },
            },
            {
              type: FORM_FIELDS_TYPES.TEXT,
              name: "thumbnailUrl",
              label: `${t("Thumbnail URL")} (${t("Optional")})`,
              placeholder: t("Optional thumbnail URL"),
            },
          ]}
          onSubmit={handleCreateVideo}
          submitText={isCreating ? t("Creating") : t("Create Video")}
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

      {editModal.video && (
        <CustomModal
          isOpen={editModal.open}
          onClose={() => {
            if (isUpdating) return;
            setEditModal({ open: false, video: null });
          }}
          title={t("Edit Video")}
          size="md"
        >
          <FormBuilder<VideoFormValues>
            defaultValues={{
              title: editModal.video.title ?? "",
              description: editModal.video.description ?? "",
              youTubeUrl: editModal.video.youTubeUrl ?? "",
              thumbnailUrl: editModal.video.thumbnailUrl ?? "",
            }}
            formConfig={[
              {
                type: FORM_FIELDS_TYPES.TEXT,
                name: "title",
                label: t("Title"),
                placeholder: t("Enter video title"),
              },
              {
                type: FORM_FIELDS_TYPES.TEXTAREA,
                name: "description",
                label: `${t("Description")} (${t("Optional")})`,
                placeholder: t("Enter video description"),
              },
              {
                type: FORM_FIELDS_TYPES.TEXT,
                name: "youTubeUrl",
                label: t("YouTube URL"),
                placeholder: "https://www.youtube.com/watch?v=...",
                validation: {
                  required: t("YouTube URL is required"),
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: t("URL pattern error"),
                  },
                },
              },
              {
                type: FORM_FIELDS_TYPES.TEXT,
                name: "thumbnailUrl",
                label: `${t("Thumbnail URL")} (${t("Optional")})`,
                placeholder: t("Optional thumbnail URL"),
              },
            ]}
            onSubmit={handleUpdateVideo}
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
              setEditModal({ open: false, video: null });
            }}
          />
        </CustomModal>
      )}

      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => {
          if (deletingId) return;
          setDeleteModal({ open: false, id: null });
        }}
        onConfirm={async () => {
          if (!deleteModal.id) return;
          await handleDeleteVideo(deleteModal.id);
        }}
        title={t("Delete Video")}
        message={t("Delete Video confirmation")}
        isLoading={!!deletingId}
      />
    </>
  );
};

export default VideosTable;
