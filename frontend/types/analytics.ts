export interface AIRecommendation {
  shouldCreateEvent: boolean;
  confidence: number;
  recommendations: string[];
  insights: string[];
  nextSteps: string[];
}

export interface EventAnalytics {
  event: {
    _id: string;
    name: string;
    date: string;
    time: string;
  };
  sales: {
    totalSales: number;
    totalRevenue: number;
    totalTicketsSold: number;
    totalOrders: number;
    paidOrders: number;
    averageSpentPerCustomer: number;
    averageTicketsPerOrder: number;
    conversionRate: number;
  };
  ticketTypes: TicketTypeAnalysis[];
  salesProgression: Record<string, number>;
  demographics: {
    ageGroups: {
      data: {
        "18-30": number;
        "30-50": number;
        "50+": number;
      };
      percentages: {
        "18-30": number;
        "30-50": number;
        "50+": number;
      };
    };
    gender: {
      data: {
        male: number;
        female: number;
        other: number;
      };
      percentages: {
        male: number;
        female: number;
        other: number;
      };
    };
    totalUsers: number;
  };
  aiRecommendations: AIRecommendation;
}

export interface TicketTypeAnalysis {
  name: string;
  price: number;
  quantitySold: number;
  revenue: number;
}

export interface AnalyticsResponse {
  success: boolean;
  data: EventAnalytics;
}
