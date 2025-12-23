
import { TopicData, TopicId } from './types';
import { Network, Cpu, Activity, Layers, Terminal, Box, Server, Search, Shield, Wrench } from 'lucide-react';
import React from 'react';

// We map icons in the component rendering phase, but here we store keys
export const TOPICS: TopicData[] = [
  {
    id: TopicId.WELCOME,
    title: 'Welcome to NetLearn',
    description: 'Introduction to High-Performance Networking',
    icon: 'Network',
    visualizationType: 'none',
    sections: [
      {
        title: 'Start Your Journey',
        content: `Modern data centers require networking stacks that bypass traditional kernel bottlenecks. 
        
This platform covers the internals of:
* **HPC Communication**: NCCL, MPI
* **Hardware Offload**: RDMA, RoCEv2
* **Programmability**: P4, eBPF
* **SDKs**: DOCA, Switch SDKs
* **Analysis Tools**: Wireshark, Proxyman

Select a module from the sidebar to begin.`
      }
    ]
  },
  {
    id: TopicId.NCCL,
    title: 'NCCL Internals',
    description: 'NVIDIA Collective Communication Library',
    icon: 'Layers',
    visualizationType: 'ring',
    sections: [
      {
        title: 'What is NCCL?',
        content: `NCCL (pronounced "Nickel") provides inter-GPU communication primitives that are topology-aware. It is critical for distributed Deep Learning training.`
      },
      {
        title: 'Ring AllReduce',
        content: `One of the core algorithms in NCCL is **Ring AllReduce**.
        
1. **Scatter-Reduce**: The array is partitioned into N chunks (where N is number of GPUs). Data flows in a logical ring. Each step reduces one chunk.
2. **All-Gather**: Once reduced, the complete chunks are circulated back to all GPUs.

This allows bandwidth optimal communication independent of the number of nodes (for large messages).`
      },
      {
        title: 'Key Takeaways & Q&A',
        content: `Test your understanding of NCCL topologies and algorithms.`,
        qna: {
          question: "What is the main advantage of using Ring AllReduce for large messages?",
          answer: "Ring AllReduce is bandwidth-optimal for large messages because the communication cost is constant per GPU regardless of the cluster size (assuming full bandwidth utilization), making it highly scalable compared to naive all-to-all approaches."
        }
      }
    ]
  },
  {
    id: TopicId.RDMA,
    title: 'RDMA & RoCE',
    description: 'Remote Direct Memory Access',
    icon: 'Server',
    visualizationType: 'rdma_qp',
    sections: [
      {
        title: 'Zero Copy Networking',
        content: `RDMA allows the NIC to write directly into the application memory of a remote machine, bypassing the CPU and OS kernel.
        
**RoCEv2** (RDMA over Converged Ethernet) runs RDMA over IP/UDP networks.`
      },
      {
        title: 'Verbs & Queue Pairs',
        content: `Programming RDMA involves "Verbs". 
        
* **QP (Queue Pair)**: Consists of a Send Queue (SQ) and Receive Queue (RQ).
* **CQ (Completion Queue)**: Where the hardware places completion reports.
* **MR (Memory Region)**: Registered memory accessible by the NIC.

Communication is asynchronous: You post a "Work Request" (WR) to a queue, and later poll the CQ for a "Work Completion" (WC).`
      }
    ]
  },
  {
    id: TopicId.CONGESTION,
    title: 'Congestion Control',
    description: 'DCQCN, TIMELY, and TCP Cubic',
    icon: 'Activity',
    visualizationType: 'congestion',
    sections: [
      {
        title: 'Why is it hard?',
        content: `In high-speed lossless networks (like those using PFC - Priority Flow Control), congestion spreads quickly, causing "Head of Line Blocking".`
      },
      {
        title: 'DCQCN',
        content: `Data Center Quantized Congestion Notification. It combines ECN (Explicit Congestion Notification) marks from switches with a rate-control state machine at the sender (similar to QCN).`
      }
    ]
  },
  {
    id: TopicId.P4,
    title: 'P4 Programmability',
    description: 'Programming Protocol-Independent Packet Processors',
    icon: 'Box',
    visualizationType: 'p4_pipeline',
    sections: [
      {
        title: 'The P4 Pipeline',
        content: `P4 allows you to define how a switch processes packets.
        
1. **Parser**: State machine extracting headers.
2. **Ingress**: Match-Action tables (e.g., IPv4 LPM lookup).
3. **Traffic Manager**: Queuing.
4. **Egress**: Final modifications.
5. **Deparser**: Reassembling the packet.`
      },
      {
        title: 'Match-Action Tables',
        content: `The core abstraction. "Match" on header fields (Exact, LPM, Ternary) and execute an "Action" (Drop, Forward, Modify Header).

You can use the **Table Editor** tab in the visualization above to try creating your own match-action rules and testing them against packets.`
      }
    ]
  },
  {
    id: TopicId.TOOLS,
    title: 'Networking Tools',
    description: 'Analysis, Debugging & Performance Tuning',
    icon: 'Search',
    visualizationType: 'none',
    sections: [
      {
        title: 'Wireshark: Deep Packet Inspection',
        content: `Wireshark is the industry standard for protocol analysis. It captures traffic from the wire and dissects headers down to the bit level.

**Deep Dive for HPC:**
* **RoCEv2 Analysis**: Wireshark can dissect InfiniBand-over-UDP (RoCEv2) traffic, allowing you to see RDMA OpCodes, Queue Pair numbers, and Sequence numbers.
* **Display Filters**: Use \`roce\` or \`ib\` to isolate high-performance traffic.
* **Expert Info**: Quickly identifies retransmissions, out-of-order packets, and window-full events.

Official Website: [www.wireshark.org](https://www.wireshark.org/)`
      },
      {
        title: 'Proxyman: Modern Web Debugging',
        content: `Proxyman is a native high-performance HTTP/HTTPS proxy tool. While Wireshark handles the binary wire-level, Proxyman excels at the application layer.

**Key Use Cases:**
* **HTTPS Decryption**: Seamlessly inspect encrypted payloads from mobile apps or web services.
* **Scripting**: Use JavaScript to modify requests/responses (e.g., simulate server errors or latency).
* **Comparison**: Side-by-side view of request versions to find regressions.

Official Website: [proxyman.io](https://proxyman.io/)`
      },
      {
        title: 'tcpdump: The Swiss Army Knife',
        content: `A command-line packet analyzer. It's lightweight and present on almost every Linux server.

**Quick Commands:**
* \`tcpdump -i eth0 -n\`: Capture all traffic on eth0 without DNS resolution.
* \`tcpdump -i eth0 udp port 4791\`: Capture RoCEv2 traffic (default port).
* \`tcpdump -w trace.pcap\`: Save capture to a file for later analysis in Wireshark.

Official Website: [www.tcpdump.org](https://www.tcpdump.org/)`
      },
      {
        title: 'iPerf3: Bandwidth Measurement',
        content: `iPerf3 is the tool for measuring maximum achievable bandwidth on IP networks.

**Why use it?**
* Test TCP/UDP throughput between nodes.
* Measure Jitter and Packet Loss.
* Baseline network performance before deploying RDMA/NCCL workloads.

Official Website: [iperf.fr](https://iperf.fr/)`
      }
    ]
  },
  {
    id: TopicId.EBPF,
    title: 'eBPF & XDP',
    description: 'Extended Berkeley Packet Filter',
    icon: 'Cpu',
    visualizationType: 'none',
    sections: [
      {
        title: 'Kernel Programmability',
        content: `eBPF allows running sandboxed programs in the Linux kernel without changing kernel source code.`
      }
    ]
  },
  {
    id: TopicId.DOCA,
    title: 'DOCA & Switch SDK',
    description: 'NVIDIA DOCA and ASIC SDKs',
    icon: 'Terminal',
    visualizationType: 'none',
    sections: [
      {
        title: 'What is DOCA?',
        content: `DOCA (Data Center on a Chip Architecture) is the software framework for the NVIDIA BlueField DPU. It allows offloading infrastructure tasks (security, storage, networking) from the host CPU to the DPU hardware.`
      }
    ]
  }
];

// Helper to get icon component
export const getIcon = (iconName: string, props: any = {}) => {
  const icons: Record<string, React.FC<any>> = {
    Network, Cpu, Activity, Layers, Terminal, Box, Server, Search, Shield, Wrench
  };
  const Icon = icons[iconName];
  if (!Icon) return <Network {...props} />;
  return <Icon {...props} />;
};
