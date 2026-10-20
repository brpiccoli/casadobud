export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  staffConversations: (userId: string) => ['staffConversations', userId] as const,
  dashboardChartsAll: (userId: string) => ['dashboardCharts', userId] as const,
  dashboardCharts: (userId: string, period: string) => ['dashboardCharts', userId, period] as const,
};
