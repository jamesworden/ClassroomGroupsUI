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
    displayCost: '$0',
    displayCostSubtitle: '/mo',
    description:
      '✔ 2 Classrooms\n✔ 30 Students per Class \n✔ 5 Columns per Class\n✔ 3 Configurations per Class',
    showActionAsButton: false,
    icon: 'sell',
    iconClass: 'text-gray-600 dark:text-gray-200',
  },
  {
    title: 'Basic',
    subtitle: 'More capabilities',
    actionText: 'Upgrade to Basic',
    displayCost: '$1',
    displayCostSubtitle: '/mo',
    description:
      '✔ 5 Classrooms\n✔ 40 Students per Class \n✔ 20 Columns per Class\n✔ 20 Configurations per Class',
    showActionAsButton: true,
    icon: 'rocket_launch',
    iconClass: 'text-gradient-fade',
  },
  {
    title: 'Pro',
    subtitle: 'Everything you need',
    actionText: 'Upgrade to Pro',
    displayCost: '$2',
    displayCostSubtitle: '/mo',
    description:
      '✔ 50 Classrooms\n✔ 50 Students per Class \n✔ 50 Columns per Class\n✔ 50 Configurations per Class',
    showActionAsButton: true,
    icon: 'auto_awesome',
    iconClass: 'text-gradient-fade',
  },
];
