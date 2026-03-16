interface StatsType {
  title: string;
  value: string;
  change: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard = (stat: StatsType, index: number) => {
  return (
    <div
      key={index}
      className="bg-bgwhite p-6 rounded-lg shadow-sm border bordergray200"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          {stat.title && (
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          )}

          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {stat.value}
            </span>
            <span className="text-sm text-green-600 font-medium">
              {stat.change}
            </span>
          </div>
          <p className="text-[0.875rem] text-sidebartext mt-1">
            {stat.subtitle}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
