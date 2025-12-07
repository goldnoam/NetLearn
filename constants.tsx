
import { TopicData, TopicId } from './types';
import { Network, Cpu, Activity, Layers, Terminal, Box, Server } from 'lucide-react';
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

Select a module from the sidebar to begin.`
      },
      {
        title: 'Further Reading',
        content: `* [Introduction to High Performance Networking](https://example.com)
* [Linux Kernel Networking Documentation](https://www.kernel.org/doc/html/latest/networking/index.html)`
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
      },
      {
        title: 'Further Reading',
        content: `* [NVIDIA NCCL Developer Guide](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html)
* [Massively Scale Deep Learning Training](https://developer.nvidia.com/blog/massively-scale-deep-learning-training-nccl-2-4/)`
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
      },
      {
        title: 'Further Reading',
        content: `* [RDMA Awareness Programming User Manual](https://docs.nvidia.com/networking/display/RDMAAwareProgrammingv17)
* [RoCE Initiative](https://www.roceinitiative.org/)`
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
      },
      {
        title: 'Further Reading',
        content: `* [DCQCN: Congestion Control for Large-Scale RDMA Deployments (SIGCOMM)](https://conferences.sigcomm.org/sigcomm/2015/pdf/papers/p537.pdf)
* [Understanding Data Center TCP (DCTCP)](https://ai.google/research/pubs/pub36640)`
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
      },
      {
        title: 'Further Reading',
        content: `* [P4 Language Specification](https://p4.org/specs/)
* [Intel Tofino Programmable Switches](https://www.intel.com/content/www/us/en/products/network-io/programmable-ethernet-switch.html)`
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
      },
      {
        title: 'XDP (eXpress Data Path)',
        content: `XDP hooks run at the earliest point in the network driver. 
        
**Actions**:
* \`XDP_DROP\`: Drop immediately (DDoS mitigation).
* \`XDP_TX\`: Bounce back out same interface.
* \`XDP_PASS\`: Pass to standard kernel stack.`
      },
      {
        title: 'Observability & Security',
        content: `Because eBPF runs in the kernel, it has global visibility into all system calls and network packets.
        
**Observability**: Tools like **Hubble** (part of Cilium) use eBPF to create service dependency maps and monitor flows without application instrumentation.

**Security**: eBPF can enforce security policies at the socket layer. It allows for "invisible" firewalls that are harder for attackers to bypass than userspace agents.`
      },
      {
        title: 'Further Reading',
        content: `* [ebpf.io - What is eBPF?](https://ebpf.io/what-is-ebpf/)
* [XDP Tutorial](https://github.com/xdp-project/xdp-tutorial)
* [Cilium & Hubble](https://cilium.io/)`
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
        content: `DOCA (Data Center on a Chip Architecture) is the software framework that unlocks the potential of the NVIDIA BlueField DPU (Data Processing Unit). Similar to how CUDA enables programming for GPUs, DOCA enables developers to program the data center infrastructure.`
      },
      {
        title: 'Key Features & Offloading',
        content: `DOCA is used to offload, accelerate, and isolate data center infrastructure services from the host CPU.

**Key capabilities include:**
* **Networking**: Accelerate SDN, OVS, and routing logic.
* **Security**: Offload Next-Generation Firewall (NGFW), DDOS protection, and encryption/decryption.
* **Storage**: Virtualize storage with NVMe-oF and accelerate compression/decompression.
* **Telemetry**: Gather deep network insights without impacting CPU performance.
`
      },
      {
        title: 'Further Reading',
        content: `* [NVIDIA DOCA SDK Documentation](https://developer.nvidia.com/networking/doca)
* [BlueField DPU Architecture](https://www.nvidia.com/en-us/networking/products/data-processing-unit/)`
      }
    ]
  }
];

// Helper to get icon component
export const getIcon = (iconName: string, props: any = {}) => {
  const icons: Record<string, React.FC<any>> = {
    Network, Cpu, Activity, Layers, Terminal, Box, Server
  };
  const Icon = icons[iconName] || Network;
  return <Icon {...props} />;
};
