"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/atoms/Table";
import {
  GROUP_TYPE_LABELS,
  GROUP_TRUST_LEVEL_LABELS,
} from "../helpers/constants";
import { EllipsisVertical, Eye } from "lucide-react";
import { Menu } from "@/components/atoms/Menu";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import GroupFilters from "./GroupFilters";
import Pagination from "@/components/atoms/Pagination";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import { SORT_DIRECTION, SORT_DIRECTIONS } from "@/shared/types";
import { useRouter, useSearchParams } from "next/navigation";
import { GROUP_TYPE, GROUP_TRUST_LEVEL } from "../helpers/constants";
import {
  ENTITY_STATUS,
  ENTITY_STATUS_LABELS,
  TABLE_ACTIONS,
} from "@/shared/constants";
import { getStatusColor } from "@/shared/utils";
export interface GroupTableData {
  id: string;
  name: string;
  createdBy: string;
  type: GROUP_TYPE;
  membersCount: number;
  status: ENTITY_STATUS;
  trustLevel: GROUP_TRUST_LEVEL;
}

const dummyGroups: GroupTableData[] = [
  {
    id: "1",
    name: "React Developers",
    createdBy: "Alice Smith",
    type: 1,
    membersCount: 120,
    status: 1,
    trustLevel: 2,
  },
  {
    id: "2",
    name: "Startup Founders",
    createdBy: "Beta Corp",
    type: 2,
    membersCount: 80,
    status: 2,
    trustLevel: 1,
  },
  {
    id: "3",
    name: "Art Enthusiasts",
    createdBy: "John Doe",
    type: 3,
    membersCount: 45,
    status: 3,
    trustLevel: 3,
  },
];

interface GroupTableProps {
  searchString: string;
}

const GroupTable: React.FC<GroupTableProps> = ({ searchString }) => {
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    action?: string;
    group?: GroupTableData;
  }>({ open: false });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(
    SORT_DIRECTIONS.ASC,
  );
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (currentPage > 1) {
      newParams.set("skip", ((currentPage - 1) * pageSize).toString());
    } else {
      newParams.delete("skip"); // Optional: clean URL
    }

    if (pageSize !== 10) {
      newParams.set("limit", pageSize.toString());
    } else {
      newParams.delete("limit");
    }
    if (sortKey) {
      newParams.set("sortKey", sortKey);
      newParams.set("sortDirection", sortDirection.toString());
    } else {
      newParams.delete("sortKey");
      newParams.delete("sortDirection");
    }

    router.push(`?${newParams.toString()}`);
  }, [currentPage, pageSize, sortKey, sortDirection, searchParams, router]);
  const handleAction = (action: TABLE_ACTIONS, group: GroupTableData) => {
    setActionModal({ open: true, action, group });
  };

  const confirmAction = () => {
    setActionModal({ open: false });
    alert(
      `${actionModal.action} action confirmed for group: ${actionModal.group?.name}`,
    );
  };

  const columns: TableColumn<GroupTableData>[] = [
    {
      field: "name",
      title: "Group Name",
      render: (data) => (
        <Link
          href={`/admin/groups/view?id=${data.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {data.name}
        </Link>
      ),
      sortable: true,
      sortKey: "name",
    },
    {
      field: "createdBy",
      title: "Created By",
      sortable: true,
      sortKey: "createdBy",
    },
    {
      field: "type",
      title: "Type",
      render: (data) => GROUP_TYPE_LABELS[data.type],
      sortable: true,
      sortKey: "type",
    },
    {
      field: "membersCount",
      title: "Members",
      sortable: true,
      sortKey: "membersCount",
    },
    {
      field: "status",
      title: "Status",
      render: (data) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}
        >
          {ENTITY_STATUS_LABELS[data.status]}
        </span>
      ),
      sortable: true,
      sortKey: "status",
    },
    {
      field: "trustLevel",
      title: "Creator Trust Level",
      render: (data) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {GROUP_TRUST_LEVEL_LABELS[data.trustLevel]}
        </span>
      ),
      sortable: true,
      sortKey: "trustLevel",
    },
    {
      field: "",
      title: "Actions",
      render: (data) => (
        <div className="flex items-center space-x-2">
          <Link href={`/admin/groups/view?id=${data.id}`}>
            <Eye
              className="text-gray-500 cursor-pointer hover:text-blue-600"
              size={16}
            />
          </Link>
          <Menu
            items={[
              {
                label: TABLE_ACTIONS.APPROVE,
                onClick: () => handleAction(TABLE_ACTIONS.APPROVE, data),
              },
              {
                label: TABLE_ACTIONS.FLAG,
                onClick: () => handleAction(TABLE_ACTIONS.FLAG, data),
              },
              {
                label: TABLE_ACTIONS.REMOVE,
                onClick: () => handleAction(TABLE_ACTIONS.REMOVE, data),
              },
              {
                label: TABLE_ACTIONS.ARCHIVE,
                onClick: () => handleAction(TABLE_ACTIONS.ARCHIVE, data),
              },
            ]}
            menuButton={
              <EllipsisVertical className="cursor-pointer" size={16} />
            }
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-200">
        {/* Table Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <SearchToolbar
                initialQuery={searchString}
                placeholder="Search Company"
              />
            </div>
            <div className="flex justify-end items-center gap-x-3">
              <h2 className="text-lg font-semibold text-gray-900 ">Filters</h2>
              <GroupFilters></GroupFilters>
            </div>
          </div>
        </div>
      </div>
      <Table<GroupTableData>
        data={dummyGroups}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="No groups found."
        handleSort={(sortKey, sortDirection) => {
          setSortKey(sortKey);
          setSortDirection(sortDirection);
        }}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
      />
      <Pagination
        totalItems={dummyGroups.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1); // reset to first page
        }}
        title="Groups"
      />
      <ConfirmationModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false })}
        onConfirm={confirmAction}
        title={`Confirm ${actionModal.action}`}
        message={`Are you sure you want to ${actionModal.action?.toLowerCase()} group "${actionModal.group?.name}"?`}
      />
    </>
  );
};

export default GroupTable;
