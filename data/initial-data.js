export const initialData = {
  startingBalance: 10000,

  transactions: [],

  commitments: [
    {
      id: "commitment-1",
      name: "Mobile recharge",
      amount: 299,
      category: "Bills",
      date: "",
      paid: false
    },
    {
      id: "commitment-2",
      name: "Monthly subscription",
      amount: 199,
      category: "Subscription",
      date: "",
      paid: false
    }
  ],

  goals: [
    {
      id: "goal-1",
      name: "Emergency fund",
      target: 2000,
      saved: 0
    },
    {
      id: "goal-2",
      name: "College essentials",
      target: 1500,
      saved: 0
    }
  ],

  simulationHistory: []
};
