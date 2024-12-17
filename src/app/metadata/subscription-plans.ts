export interface SubscriptionPlan {
  title: string;
  subtitle: string;
  displayCost: string;
  actionText: string;
  description: string;
  displayCostSubtitle?: string;
  showActionAsButton: boolean;
  icon?: string;
  iconClass?: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    title: 'Starter',
    subtitle: 'Quick classroom setup',
    actionText: 'Your plan',
    displayCost: 'Free',
    description:
      '✔ 2 Classrooms\n✔ 30 Students per Class \n✔ 5 Columns per Class\n✔ 3 Configurations per Class',
    showActionAsButton: false,
  },
  {
    title: 'Basic',
    subtitle: 'More capabilities',
    actionText: 'Get Started',
    displayCost: '$0.99',
    displayCostSubtitle: '/mo',
    description:
      '✔ 5 Classrooms\n✔ 50 Students per Class \n✔ 20 Columns per Class\n✔ 20 Configurations per Class',
    showActionAsButton: true,
    icon: 'rocket_launch',
    iconClass: 'text-yellow-300',
  },
  {
    title: 'Pro',
    subtitle: 'Everything you need',
    actionText: 'Get Started',
    displayCost: '$1.29',
    displayCostSubtitle: '/mo',
    description:
      '✔ 50 Classrooms\n✔ 100 Students per Class \n✔ 50 Columns per Class\n✔ 50 Configurations per Class',
    showActionAsButton: true,
    icon: 'star',
    iconClass: 'text-yellow-300',
  },
];
