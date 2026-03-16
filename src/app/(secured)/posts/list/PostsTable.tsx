"use client";

import { useCallback, useMemo, useState } from "react";
import { Menu, RotateCcw, MoreHorizontal, Trash2, Eye, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import SelectFilter from "@/components/atoms/SelectFilter";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { AdminPost, BOOLEAN_FILTER_OPTIONS } from "../helpers/types";
import PostRowActionsMenu from "./PostRowActionsMenu";
import { bulkActionPostsAction, deletePostsAction } from "@/api/adminPosts";
import {
  createSortableColumn,
  truncateText,
  stripHtmlTags,
  getTrustScoreColor,
  formatTrustScore,
  getSafeText,
} from "@/shared/utils";
import FormattedDate from "@/components/atoms/FormattedDate";
import { SORT_DIRECTIONS } from "@/shared/types";
import { PRIVATE_ROUTES } from "@/shared/routes";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";

// ── View Post Modal ────────────────────────────────────────

const ViewPostModal = ({
  post,
  onClose,
}: {
  post: AdminPost;
  onClose: () => void;
}) => {
  const t = useTranslations("posts");

  const detailRows = [
    {
      label: t("Description"),
      value: getSafeText(post.description, t("Not available")),
      longText: true,
    },
    {
      label: t("Author"),
      value: post.isCompanyAuthor
        ? `${post.author} (Company)`
        : getSafeText(post.author, t("Not available")),
    },
    { label: t("Views"), value: post.views.toLocaleString() },
    { label: t("Engagement"), value: post.engagement.toLocaleString() },
    { label: t("Trust"), value: formatTrustScore(post.trust) },
    { label: t("Sponsor"), value: post.sponsorStatus ? t("Yes") : t("No") },
    { label: t("Reports"), value: String(post.reportCount) },
    { label: t("Featured"), value: post.isFeatured ? t("Yes") : t("No") },
    {
      label: t("Open to Sponsorship"),
      value: post.isOpenToSponsorship ? t("Yes") : t("No"),
    },
    {
      label: t("Date Published"),
      value: getSafeText(post.publishedAt),
    },
  ] as Array<{ label: string; value: string; longText?: boolean }>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-bgwhite dark:bg-darkbgprimary rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bordercolor1 dark:border-darkbordercolor1">
          <h3 className={`text-lg font-bold ${TEXT_PRIMARY}`}>
            {t("Post Details")}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">
                  {row.label}
                </span>
                {row.longText ? (
                  <div className="max-h-40 min-h-10 w-full max-w-[60%] overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2">
                    <div
                      className={`text-sm font-semibold ${TEXT_PRIMARY} text-left break-words whitespace-pre-wrap block prose dark:prose-invert max-w-none`}
                      dangerouslySetInnerHTML={{
                        __html: post.description || "",
                      }}
                    />
                  </div>
                ) : (
                  <span
                    className={`text-sm font-semibold ${TEXT_PRIMARY} text-right break-words max-w-[60%]`}
                  >
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-bordercolor1 dark:border-darkbordercolor1 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-medium text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────

interface PostsTableProps {
  data: AdminPost[];
  totalCount: number;
  searchText: string;
}

const PostsTable = ({ data, totalCount, searchText }: PostsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  useSearchParams();
  const t = useTranslations("posts");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openActionsPostId, setOpenActionsPostId] = useState<string | null>(
    null,
  );
  const [viewingPost, setViewingPost] = useState<AdminPost | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    actionType: number | null;
    label: string;
    postId: string | null;
  }>({
    open: false,
    actionType: null,
    label: "",
    postId: null,
  });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSingleAction = useCallback(
    async (postId: string, actionType: number) => {
      setIsProcessing(true);
      try {
        const res = await bulkActionPostsAction({
          actionType,
          postIds: [postId],
        });
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;
        if (ok) {
          toast.success(
            (res as { message?: string })?.message ??
              "Action completed successfully",
          );
          setConfirmModal({
            open: false,
            actionType: null,
            label: "",
            postId: null,
          });
          router.refresh();
        } else {
          toast.error(
            (res as { message?: string })?.message ?? "Action failed",
          );
          setConfirmModal({
            open: false,
            actionType: null,
            label: "",
            postId: null,
          });
        }
      } catch (error) {
        console.error("Bulk action failed", error);
        toast.error("An unexpected error occurred");
        setConfirmModal({
          open: false,
          actionType: null,
          label: "",
          postId: null,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [router],
  );

  const handleDeletePost = useCallback(
    async (id: string) => {
      if (!id) return;
      setDeletingId(id);
      try {
        const res = await deletePostsAction({ postIds: [id] });
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;
        if (ok) {
          toast.success(
            (res as { message?: string })?.message ??
              "Post deleted successfully",
          );
          setDeleteModal({ open: false, id: null });
          router.refresh();
        } else {
          toast.error(
            (res as { message?: string })?.message ?? "Failed to delete post",
          );
          setDeleteModal({ open: false, id: null });
        }
      } catch (error) {
        console.error("Failed to delete post", error);
        toast.error("Failed to delete post");
        setDeleteModal({ open: false, id: null });
      } finally {
        setDeletingId(null);
      }
    },
    [router],
  );

  const config: DataTableConfig<AdminPost> = useMemo(() => {
    const columns: TableColumn<AdminPost>[] = [
      createSortableColumn(
        "author",
        t("Post Author"),
        (item) => (
          <div className="flex flex-col">
            {item.authorId ? (
              <Link
                href={`${PRIVATE_ROUTES.USERS_VIEW}/${item.authorId}/account`}
                className={`${TEXT_SIZE_SM} font-medium text-primarycolor hover:underline `}
                onClick={(e) => e.stopPropagation()}
              >
                <TruncatedText text={item.author} maxLength={20} />
              </Link>
            ) : (
              <span className={`${TEXT_SIZE_SM} font-medium ${TEXT_PRIMARY}`}>
                <TruncatedText text={item.author} maxLength={20} />
              </span>
            )}
            {item.isCompanyAuthor && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primarycolor dark:text-secondarycolor">
                Company
              </span>
            )}
          </div>
        ),
        "author",
      ),
      {
        title: t("Post Description"),
        field: "description",
        render: (item) => (
          <span
            className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}
            title={stripHtmlTags(item.description)}
          >
            {truncateText(stripHtmlTags(item.description), 50, "\u2014")}
          </span>
        ),
      },
      createSortableColumn(
        "views",
        t("View Count"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.views.toLocaleString()}
          </span>
        ),
        "views",
      ),
      createSortableColumn(
        "engagement",
        t("Engagement Count"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.engagement.toLocaleString()}
          </span>
        ),
        "engagement",
      ),
      createSortableColumn(
        "trust",
        t("Trust Score"),
        (item) => (
          <span
            className={`${TEXT_SIZE_SM} font-bold ${getTrustScoreColor(item.trust)}`}
          >
            {formatTrustScore(item.trust)}
          </span>
        ),
        "trust",
      ),
      {
        title: (
          <TableHeaderWithInfo
            label={t("Sponsor Status")}
            options={[t("Yes"), t("No")]}
          />
        ),
        field: "sponsorStatus",
        render: (item) => {
          const isSponsored = item.sponsorStatus;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${TEXT_SIZE_SM} font-bold border ${
                isSponsored
                  ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
                  : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSponsored
                    ? "bg-primarycolor dark:bg-white/80"
                    : "bg-gray-500"
                }`}
              />
              {isSponsored ? t("Yes") : t("No")}
            </span>
          );
        },
      },
      {
        title: t("Report Count"),
        field: "reportCount",
        render: (item) => (
          <span
            className={`${TEXT_SIZE_SM} font-medium ${
              item.reportCount > 0
                ? "text-red-500 dark:text-red-400"
                : TEXT_PRIMARY
            }`}
          >
            {item.reportCount}
          </span>
        ),
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("Featured Status")}
            options={[t("Yes"), t("No")]}
          />
        ),
        field: "isFeatured",
        render: (item) => {
          const isFeatured = item.isFeatured;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${TEXT_SIZE_SM} font-bold border ${
                isFeatured
                  ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
                  : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFeatured
                    ? "bg-primarycolor dark:bg-white/80"
                    : "bg-gray-500"
                }`}
              />
              {isFeatured ? t("Yes") : t("No")}
            </span>
          );
        },
      },
      createSortableColumn(
        "publishedAt",
        t("Date Published"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.publishedAt ? (
              <FormattedDate date={item.publishedAt} />
            ) : (
              "\u2014"
            )}
          </span>
        ),
        "publishedAt",
      ),
      // createSortableColumn(
      //   "createdOn",
      //   t("Date Created"),
      //   (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.createdOn ? formatDate(item.createdOn) : "\u2014"}
      //     </span>
      //   ),
      //   "createdOn",
      // ),
      {
        title: t("Actions"),
        field: "",
        fixed: "right",
        render: (item) => (
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewingPost(item);
              }}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title="View"
            >
              <Eye size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModal({ open: true, id: item.id });
              }}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext"
              title={t("Delete Post")}
            >
              <Trash2 size={18} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionsPostId(
                    openActionsPostId === item.id ? null : item.id,
                  );
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primarycolor hover:border-primarycolor dark:hover:text-secondarycolor dark:hover:border-secondarycolor bg-bgwhite dark:bg-darkbgprimary shadow-sm"
                title={t("Row Actions")}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "posts",
      hideSelectCol: true,
      emptyMessage: t("No posts found"),
      queryConfig: {
        defaultSortKey: "createdOn",
        defaultSortDirection: SORT_DIRECTIONS.DESC,
      },
      header: (
        <>
          <div className="bg-bgwhite dark:bg-darkbgprimary">
            <div className="dark:border-darkbgprimary">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2
                    className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
                  >
                    {t("Posts")}
                  </h2>
                  <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                    {t("Manage and view all posts")}
                  </p>
                </div>
                <div className="flex items-intial space-x-4">
                  <SearchToolbar
                    initialQuery={searchText}
                    placeholder={t("Search Posts")}
                    queryParamName="searchText"
                  />
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-0 font-bold bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 rounded-xl"
                  >
                    <Menu size={18} />
                    <span>{t("Filters")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            title={t("Post Filters")}
            footer={
              <button
                onClick={() => {
                  router.push(pathname);
                  setIsFilterOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-labelprimary transition-all border bordergray200 dark:border-labelprimary font-medium"
              >
                <RotateCcw size={18} />
                <span>{t("Clear All Filters")}</span>
              </button>
            }
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="sponsor-status-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("Sponsor Status")}
                </label>
                <SelectFilter
                  id="sponsor-status-filter"
                  paramName="sponsorStatus"
                  options={BOOLEAN_FILTER_OPTIONS}
                  placeholder={t("Select Sponsor Status")}
                />
              </div>

              {/* <div>
                <label
                  htmlFor="has-ads-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("Has Ads")}
                </label>
                <SelectFilter
                  id="has-ads-filter"
                  paramName="hasAds"
                  options={BOOLEAN_FILTER_OPTIONS}
                  placeholder={t("Select Has Ads")}
                />
              </div> */}

              <div>
                <label
                  htmlFor="review-flagged-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("Review Flagged")}
                </label>
                <SelectFilter
                  id="review-flagged-filter"
                  paramName="reviewFlagged"
                  options={BOOLEAN_FILTER_OPTIONS}
                  placeholder={t("Select Review Flagged")}
                />
              </div>

              {/* <div>
                <label
                  htmlFor="sponsorship-open-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("Sponsorship Open")}
                </label>
                <SelectFilter
                  id="sponsorship-open-filter"
                  paramName="sponsorAssignment"
                  options={BOOLEAN_FILTER_OPTIONS}
                  placeholder={t("Select Sponsorship Open")}
                />
              </div> */}

              <div>
                <label
                  htmlFor="feature-content-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("Featured Content")}
                </label>
                <SelectFilter
                  id="feature-content-filter"
                  paramName="featureContent"
                  options={BOOLEAN_FILTER_OPTIONS}
                  placeholder={t("Select Featured Content")}
                />
              </div>
            </div>
          </FilterSidebar>
        </>
      ),
    };
  }, [searchText, isFilterOpen, router, pathname, t, openActionsPostId]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />

      {viewingPost && (
        <ViewPostModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
        />
      )}

      <PostRowActionsMenu
        isOpen={openActionsPostId !== null}
        item={data.find((p) => p.id === openActionsPostId) ?? null}
        onClose={() => setOpenActionsPostId(null)}
        onSelectAction={(actionType, label, postId) => {
          setConfirmModal({
            open: true,
            actionType,
            label,
            postId,
          });
        }}
      />

      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() => {
          if (isProcessing) return;
          setConfirmModal({
            open: false,
            actionType: null,
            label: "",
            postId: null,
          });
        }}
        onConfirm={async () => {
          if (!confirmModal.actionType || !confirmModal.postId) return;
          await handleSingleAction(
            confirmModal.postId,
            confirmModal.actionType,
          );
        }}
        title={confirmModal.label}
        message={t("Single Action Confirmation", {
          action: confirmModal.label,
        })}
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => {
          if (deletingId) return;
          setDeleteModal({ open: false, id: null });
        }}
        onConfirm={async () => {
          if (!deleteModal.id) return;
          await handleDeletePost(deleteModal.id);
        }}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        isLoading={!!deletingId}
      />
    </>
  );
};

export default PostsTable;
