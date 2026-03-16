"use client";
import { useState, useTransition } from "react";
import EditUserModal from "../EditUserModal";
import { User } from "@/shared/types";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import { suspendUserAction } from "@/api/user";
import Button from "@/components/atoms/Button";
import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";

const UserEdit = ({ userData }: { userData: User }) => {
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isLoading, startTrasition] = useTransition();
  return (
    <>
      <div className="flex justify-between mt-4">
        <Button onClick={() => setIsEditOpen(true)}>Edit</Button>
        {userData.isSuspended ? (
          <Button variant="success" onClick={() => setIsSuspendOpen(true)}>
            UnSuspend
          </Button>
        ) : (
          <Button variant="danger" onClick={() => setIsSuspendOpen(true)}>
            Suspend
          </Button>
        )}
      </div>
      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={() => {
          startTrasition(async () => {
            // const res = await updateUserAction({
            //   ...data,
            //   userId: userData?._id,
            // });
            // if (res.status) {
            //   toast.success(res.message);
            // } else {
            //   toast.error(res.message);
            // }
            // setIsEditOpen(false);
            // router.refresh();
          });
        }}
        userData={userData}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isSuspendOpen}
        onClose={() => setIsSuspendOpen(false)}
        onConfirm={() =>
          void (async () => {
            await suspendUserAction({
              userId: "",
              isSuspended: !userData?.isSuspended,
            });
            setIsSuspendOpen(false);
            router.refresh();
          })()
        }
        title={"Suspend User"}
        message={"Are you sure you want to suspend this user?"}
      />
    </>
  );
};

export default UserEdit;
