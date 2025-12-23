
export enum TopicId {
  WELCOME = 'welcome',
  NCCL = 'nccl',
  RDMA = 'rdma',
  CONGESTION = 'congestion',
  P4 = 'p4',
  EBPF = 'ebpf',
  DOCA = 'doca',
  TOOLS = 'tools',
}

export interface TopicSection {
  title: string;
  content: string; // Markdown supported
  qna?: {
    question: string;
    answer: string;
  };
}

export interface TopicData {
  id: TopicId;
  title: string;
  description: string;
  icon: string;
  sections: TopicSection[];
  visualizationType?: 'ring' | 'congestion' | 'rdma_qp' | 'p4_pipeline' | 'none';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
