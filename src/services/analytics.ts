import { LLMModelType, SectionType } from '../types';

// This is a simple analytics service for tracking model usage and performance
// In a production app, you'd want to use a real analytics service like Mixpanel, Segment, etc.

interface ModelUsageEvent {
  model: LLMModelType;
  action: 'generate' | 'enhance' | 'rewrite';
  section: SectionType;
  responseTime: number;
  success: boolean;
}

interface ModelComparisonEvent {
  winner: LLMModelType;
  section: SectionType;
}

class AnalyticsService {
  private modelUsage: Record<LLMModelType, number> = {
    claude: 0,
    gpt4o: 0,
    llama: 0
  };

  private modelResponseTimes: Record<LLMModelType, number[]> = {
    claude: [],
    gpt4o: [],
    llama: []
  };

  private modelSuccessRates: Record<LLMModelType, { success: number, total: number }> = {
    claude: { success: 0, total: 0 },
    gpt4o: { success: 0, total: 0 },
    llama: { success: 0, total: 0 }
  };

  private modelComparisons: ModelComparisonEvent[] = [];

  // Track when a model is used for generation, enhancement, or rewriting
  trackModelUsage(event: ModelUsageEvent): void {
    this.modelUsage[event.model]++;
    this.modelResponseTimes[event.model].push(event.responseTime);
    
    this.modelSuccessRates[event.model].total++;
    if (event.success) {
      this.modelSuccessRates[event.model].success++;
    }
    
    // Log event for debugging
    console.log(`Analytics: ${event.model} used for ${event.action} on ${event.section}`);
    
    // In a real app, you'd send this to your analytics service
    // Example: mixpanel.track('model_usage', event);
  }

  // Track which model was preferred in a comparison
  trackModelComparison(event: ModelComparisonEvent): void {
    this.modelComparisons.push(event);
    
    // Log event for debugging
    console.log(`Analytics: ${event.winner} won comparison for ${event.section}`);
    
    // In a real app, you'd send this to your analytics service
    // Example: mixpanel.track('model_comparison', event);
  }

  // Get average response time for a model
  getAverageResponseTime(model: LLMModelType): number {
    const times = this.modelResponseTimes[model];
    if (times.length === 0) return 0;
    
    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }

  // Get success rate for a model
  getSuccessRate(model: LLMModelType): number {
    const { success, total } = this.modelSuccessRates[model];
    if (total === 0) return 0;
    
    return (success / total) * 100;
  }

  // Get model usage counts
  getModelUsageCounts(): Record<LLMModelType, number> {
    return { ...this.modelUsage };
  }

  // Get the most popular model based on usage
  getMostPopularModel(): LLMModelType {
    return Object.entries(this.modelUsage)
      .sort((a, b) => b[1] - a[1])[0][0] as LLMModelType;
  }

  // Get the model that won the most comparisons
  getMostPreferredModel(): LLMModelType | null {
    if (this.modelComparisons.length === 0) return null;
    
    const counts: Record<string, number> = {};
    
    for (const event of this.modelComparisons) {
      counts[event.winner] = (counts[event.winner] || 0) + 1;
    }
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0] as LLMModelType;
  }

  // Clear all analytics data
  clearData(): void {
    this.modelUsage = {
      claude: 0,
      gpt4o: 0,
      llama: 0
    };
    
    this.modelResponseTimes = {
      claude: [],
      gpt4o: [],
      llama: []
    };
    
    this.modelSuccessRates = {
      claude: { success: 0, total: 0 },
      gpt4o: { success: 0, total: 0 },
      llama: { success: 0, total: 0 }
    };
    
    this.modelComparisons = [];
  }
}

// Export a singleton instance
export const analytics = new AnalyticsService();