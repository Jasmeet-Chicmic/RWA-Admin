import UserPortfolioTable from "./UserPortfolioTable";

const UserManagment = () => {
  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="overflow-x-auto">
        <UserPortfolioTable />
      </div>
    </div>
  );
};

export default UserManagment;
