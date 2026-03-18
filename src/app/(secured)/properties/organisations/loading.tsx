const Loading = () => {
  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[12px] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-56 rounded bg-gray-200 dark:bg-darkbgbase" />
          <div className="h-4 w-96 max-w-full rounded bg-gray-200 dark:bg-darkbgbase" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 w-full rounded bg-gray-200 dark:bg-darkbgbase"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
