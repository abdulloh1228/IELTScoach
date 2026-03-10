export interface TestFlow {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    type: 'listening' | 'writing' | 'speaking' | 'reading';
    title: string;
    duration: number;
  }>;
  isFullMockTest: boolean;
}

export const FULL_MOCK_TEST_FLOW: TestFlow = {
  currentStep: 0,
  totalSteps: 2,
  steps: [
    {
      type: 'listening',
      title: 'Listening Test',
      duration: 30,
    },
    {
      type: 'writing',
      title: 'Writing Test',
      duration: 60,
    },
  ],
  isFullMockTest: true,
};

export const testFlowService = {
  getNextStep(flow: TestFlow): TestFlow | null {
    if (flow.currentStep >= flow.totalSteps - 1) {
      return null;
    }

    return {
      ...flow,
      currentStep: flow.currentStep + 1,
    };
  },

  getCurrentStepInfo(flow: TestFlow) {
    return flow.steps[flow.currentStep];
  },

  isLastStep(flow: TestFlow): boolean {
    return flow.currentStep >= flow.totalSteps - 1;
  },

  createPracticeFlow(testType: 'listening' | 'writing' | 'speaking' | 'reading'): TestFlow {
    const durations = {
      listening: 30,
      writing: 60,
      speaking: 15,
      reading: 60,
    };

    return {
      currentStep: 0,
      totalSteps: 1,
      steps: [
        {
          type: testType,
          title: `${testType.charAt(0).toUpperCase() + testType.slice(1)} Practice`,
          duration: durations[testType],
        },
      ],
      isFullMockTest: false,
    };
  },
};
