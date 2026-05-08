export const POLICY_GLOSSARY = {
  poolType: {
    title: "Benefit Pool",
    body: "A benefit pool is the budget employees can spend under this policy. Use Individual when each person has their own amount, or Shared when everyone draws from one group budget.",
  },
  dependentsPooling: {
    title: "Dependents Pooling",
    body: "This decides how spouse or child claims are funded. You can give each dependent their own pool, share one pool across dependents, or let dependents use the employee pool.",
  },
  utilisationMode: {
    title: "Utilisation Mode",
    body: "Fixed gives the full amount immediately for the cycle. Prorated releases budget in smaller portions over time, such as monthly.",
  },
  prorateUnit: {
    title: "Prorate Unit",
    body: "The prorate unit is how often budget is released in Prorated mode. Monthly is the most common because it is simple for HR to monitor.",
  },
  refreshCycle: {
    title: "Refresh Cycle",
    body: "Refresh cycle is when balances reset back to the policy amount. For example, Yearly means balances renew once a year.",
  },
  activationMode: {
    title: "Activation",
    body: "Activation controls when coverage starts for eligible employees. Most teams use Immediately on join so new hires are covered from day one.",
  },
  groupCap: {
    title: "Group Cap",
    body: "Group cap limits total spending for a shared group. Example: set RM 1000 for Mental Health so the whole group cannot exceed that amount per cycle.",
  },
  coPayment: {
    title: "Co-payment",
    body: "Co-payment is the amount an employee pays when making a claim. You can set a fixed amount (RM) or a percentage of the claim.",
  },
  spendingCap: {
    title: "Policy Spending Cap",
    body: "This is an optional overall ceiling for the full policy, across all groups. Leave it blank if you do not want a policy-wide cap.",
  },
} as const

export type PolicyGlossaryKey = keyof typeof POLICY_GLOSSARY
