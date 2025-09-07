import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EventAnalyticsData {
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
  ticketTypes: Array<{
    name: string;
    price: number;
    quantitySold: number;
    revenue: number;
  }>;
  salesProgression: Record<string, number>;
  demographics: {
    ageGroups: {
      data: Record<string, number>;
      percentages: Record<string, number>;
    };
    gender: {
      data: Record<string, number>;
      percentages: Record<string, number>;
    };
    totalUsers: number;
  };
}

export interface AIRecommendation {
  shouldCreateEvent: boolean;
  confidence: number;
  recommendations: string[];
  insights: string[];
  nextSteps: string[];
}

export const generateEventRecommendations = async (
  analyticsData: EventAnalyticsData
): Promise<AIRecommendation> => {
  try {
    const prompt = `
You are an expert event management consultant analyzing a specific event's performance data. This is a unique analysis for "${analyticsData.event.name}" (Event ID: ${analyticsData.event._id}) that took place on ${analyticsData.event.date}. Provide highly personalized and specific recommendations based on this event's actual performance.

CRITICAL: Base your analysis ONLY on the specific data provided below. Each recommendation must be tailored to this event's unique performance patterns. This analysis is unique to this specific event and should not contain generic advice.

Event Performance Analysis:
- Event Name: "${analyticsData.event.name}"
- Event Date: ${analyticsData.event.date}
- Total Revenue: AED ${analyticsData.sales.totalRevenue}
- Total Tickets Sold: ${analyticsData.sales.totalTicketsSold}
- Total Orders: ${analyticsData.sales.totalOrders}
- Paid Orders: ${analyticsData.sales.paidOrders}
- Conversion Rate: ${analyticsData.sales.conversionRate}%
- Average Spent per Customer: AED ${analyticsData.sales.averageSpentPerCustomer}
- Average Tickets per Order: ${analyticsData.sales.averageTicketsPerOrder}

Detailed Ticket Performance:
${analyticsData.ticketTypes.map(ticket => 
  `- "${ticket.name}": ${ticket.quantitySold} tickets sold, AED ${ticket.price} each, Total Revenue: AED ${ticket.revenue}`
).join('\n')}

Audience Demographics (${analyticsData.demographics.totalUsers} total attendees):
- Age Distribution: ${Object.entries(analyticsData.demographics.ageGroups.percentages)
  .filter(([_, percentage]) => percentage > 0)
  .map(([age, percentage]) => `${age}: ${percentage}%`)
  .join(', ')}
- Gender Distribution: ${Object.entries(analyticsData.demographics.gender.percentages)
  .filter(([_, percentage]) => percentage > 0)
  .map(([gender, percentage]) => `${gender}: ${percentage}%`)
  .join(', ')}

Sales Progression Pattern:
${Object.entries(analyticsData.salesProgression).length > 0 ? 
  Object.entries(analyticsData.salesProgression).slice(-5).map(([date, revenue]) => 
    `- ${date}: AED ${revenue}`
  ).join('\n') : 'No sales progression data available'}

ANALYSIS REQUIREMENTS:
1. Analyze the specific performance metrics above
2. Consider the unique ticket pricing strategy and sales patterns
3. Evaluate the audience demographics and their spending behavior
4. Assess the conversion rate and payment completion
5. Look at the sales progression timeline

Provide personalized recommendations that address:
- Specific weaknesses in this event's performance
- Opportunities based on the actual audience demographics
- Pricing strategy adjustments based on ticket performance
- Marketing insights based on conversion rates
- Timing and scheduling recommendations

Respond in JSON format:
{
  "shouldCreateEvent": boolean,
  "confidence": number,
  "recommendations": ["specific recommendation based on this event's data", "another specific recommendation", ...],
  "insights": ["insight about this specific audience", "insight about this event's performance", ...],
  "nextSteps": ["specific action for this club", "another specific action", ...]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert event management consultant specializing in nightclub and entertainment venue analytics. You provide highly personalized, data-driven recommendations that are unique to each specific event's performance. Never give generic advice - every recommendation must be based on the specific data provided. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // Increased temperature for more creative and unique responses
      max_tokens: 1200, // Increased token limit for more detailed responses
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const aiResponse = JSON.parse(response);
    
    return {
      shouldCreateEvent: aiResponse.shouldCreateEvent || false,
      confidence: aiResponse.confidence || 50,
      recommendations: aiResponse.recommendations || [],
      insights: aiResponse.insights || [],
      nextSteps: aiResponse.nextSteps || []
    };

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    
    // Dynamic fallback recommendations based on actual data
    const conversionRate = analyticsData.sales.conversionRate;
    const totalRevenue = analyticsData.sales.totalRevenue;
    const avgSpentPerCustomer = analyticsData.sales.averageSpentPerCustomer;
    const totalTicketsSold = analyticsData.sales.totalTicketsSold;
    
    // Determine if should create another event based on performance
    const shouldCreateEvent = conversionRate > 70 && totalRevenue > 1000 && totalTicketsSold > 10;
    const confidence = Math.min(95, Math.max(40, conversionRate + (totalRevenue > 5000 ? 20 : 0)));
    
    // Generate data-specific recommendations
    const recommendations = [];
    const insights = [];
    const nextSteps = [];
    
    if (conversionRate < 50) {
      recommendations.push("Your conversion rate is low - focus on improving payment completion and reducing cart abandonment");
    } else if (conversionRate > 80) {
      recommendations.push("Excellent conversion rate! Consider increasing ticket prices or adding premium options");
    }
    
    if (avgSpentPerCustomer < 100) {
      recommendations.push("Average spending per customer is low - consider upselling strategies or premium ticket tiers");
    } else if (avgSpentPerCustomer > 300) {
      recommendations.push("High customer spending indicates strong demand - consider expanding capacity or adding more events");
    }
    
    if (totalTicketsSold < 20) {
      recommendations.push("Low ticket sales suggest marketing improvements needed - focus on social media and influencer partnerships");
    } else if (totalTicketsSold > 100) {
      recommendations.push("Strong ticket sales performance - consider scaling up with larger venues or multiple events");
    }
    
    // Add demographic insights
    const topAgeGroup = Object.entries(analyticsData.demographics.ageGroups.percentages)
      .sort(([,a], [,b]) => b - a)[0];
    const topGender = Object.entries(analyticsData.demographics.gender.percentages)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topAgeGroup && topAgeGroup[1] > 0) {
      insights.push(`Your primary audience is ${topAgeGroup[0]} age group (${topAgeGroup[1]}%) - tailor marketing to this demographic`);
    }
    
    if (topGender && topGender[1] > 0) {
      insights.push(`Gender distribution shows ${topGender[0]} dominance (${topGender[1]}%) - consider gender-specific marketing strategies`);
    }
    
    // Add next steps based on performance
    if (totalRevenue > 5000) {
      nextSteps.push("Plan a follow-up event within 2-3 months to capitalize on success");
    } else {
      nextSteps.push("Conduct customer surveys to understand barriers to attendance");
    }
    
    nextSteps.push("Analyze peak sales periods to optimize future event timing");
    nextSteps.push("Review ticket pricing strategy based on conversion rates");
    
    return {
      shouldCreateEvent,
      confidence: Math.round(confidence),
      recommendations: recommendations.length > 0 ? recommendations : [
        "Focus on improving conversion rate through better marketing",
        "Consider offering early bird discounts",
        "Analyze competitor pricing strategies"
      ],
      insights: insights.length > 0 ? insights : [
        "Your event shows potential for growth",
        "Consider targeting your most engaged demographic"
      ],
      nextSteps: nextSteps.length > 0 ? nextSteps : [
        "Gather customer feedback",
        "Plan marketing strategy for next event",
        "Review pricing structure"
      ]
    };
  }
};
