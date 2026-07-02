export interface CallerInfo {
  id: string;
  name: string;
  number: string;
  type: 'mobile' | 'home' | 'work';
  timestamp: string;
  duration?: string;
  status: 'missed' | 'outgoing' | 'incoming';
  isSpam?: boolean;
  trustScore?: number;
  location?: string;
  carrier?: string;
  avatar?: string;
  isFavorite?: boolean;
}

export const MOCK_RECENTS: CallerInfo[] = [
  {
    id: "1",
    name: "John Doe",
    number: "+1 (555) 123-4567",
    type: 'mobile',
    timestamp: "10:45 AM",
    status: 'incoming',
    trustScore: 98,
    location: "New York, NY",
    carrier: "Verizon",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Spam Risk",
    number: "+1 (800) 555-0199",
    type: 'mobile',
    timestamp: "Yesterday",
    status: 'missed',
    isSpam: true,
    trustScore: 12,
    location: "Unknown",
    carrier: "VOIP",
  },
  {
    id: "3",
    name: "Jane Smith",
    number: "+1 (555) 987-6543",
    type: 'work',
    timestamp: "Tuesday",
    status: 'outgoing',
    duration: "4:12",
    trustScore: 95,
    location: "San Francisco, CA",
    carrier: "AT&T",
  },
];

export const MOCK_CONTACTS: CallerInfo[] = [
  {
    id: "1",
    name: "Alice Johnson",
    number: "+1 (555) 111-2222",
    type: 'mobile',
    timestamp: "",
    status: 'incoming',
  },
  {
    id: "2",
    name: "Bob Wilson",
    number: "+1 (555) 333-4444",
    type: 'mobile',
    timestamp: "",
    status: 'incoming',
  },
  {
    id: "3",
    name: "Charlie Brown",
    number: "+1 (555) 555-6666",
    type: 'home',
    timestamp: "",
    status: 'incoming',
  },
];

export const SIMULATE_AI_INTELLIGENCE = (number: string) => {
  return {
    number,
    trustScore: Math.floor(Math.random() * 40) + 60,
    isSpam: false,
    callerName: "Potential Business",
    category: "Financial Services",
    insights: [
      "Verified business number",
      "No spam reports in the last 30 days",
      "Average call duration 2:15"
    ]
  };
};
