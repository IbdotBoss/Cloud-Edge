const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak
} = require("docx");

// ── colour palette ──
const C = {
  accent: "1A73E8",   // blue
  accent2: "0D47A1",  // dark blue
  green: "2E7D32",
  red: "C62828",
  grey: "616161",
  lightBg: "E8F0FE",
  headerBg: "1A73E8",
  white: "FFFFFF",
  black: "000000",
};

// ── helper: bordered cell ──
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: C.headerBg, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: C.white, size: 22, font: "Arial" })] })]
  });
}

function dataCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text, size: 20, font: "Arial" })] })]
  });
}

// ── helper: question block ──
function questionBlock(num, q, choices, answer, ref) {
  const children = [];
  children.push(new Paragraph({
    spacing: { before: 160, after: 60 },
    numbering: { reference: ref, level: 0 },
    children: [new TextRun({ text: q, bold: true, size: 22, font: "Arial" })]
  }));
  for (const c of choices) {
    children.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      indent: { left: 1080 },
      children: [new TextRun({ text: c, size: 21, font: "Arial" })]
    }));
  }
  children.push(new Paragraph({
    spacing: { before: 60, after: 120 },
    indent: { left: 720 },
    children: [
      new TextRun({ text: "Answer: ", bold: true, size: 21, font: "Arial", color: C.green }),
      new TextRun({ text: answer, bold: true, size: 21, font: "Arial", color: C.green })
    ]
  }));
  return children;
}

// ── DATA ──
const weeks = [
  {
    title: "Week 1 — Introduction to Cloud Computing",
    slideQA: [
      { q: "What is cloud computing?", c: ["A) Traditional on-premise computing","B) A method of delivering computing services over the internet","C) A type of hardware storage","D) A type of software development tool"], a: "B" },
      { q: "Which of the following is NOT a characteristic of cloud computing?", c: ["A) On-demand self-service","B) Broad network access","C) Limited scalability","D) Resource pooling"], a: "C" },
      { q: "Which of the following is a benefit of cloud computing?", c: ["A) Higher upfront costs","B) Limited accessibility","C) Increased scalability","D) Limited data control"], a: "C" },
      { q: "Which cloud computing characteristic refers to the ability to access resources over the internet from anywhere?", c: ["A) On-demand self-service","B) Broad network access","C) Resource pooling","D) Rapid elasticity"], a: "B" },
      { q: "Which cloud computing characteristic refers to the ability to rapidly provision and release resources?", c: ["A) On-demand self-service","B) Broad network access","C) Rapid elasticity","D) Resource pooling"], a: "C" },
      { q: "What is the primary purpose of cloud computing cooling systems?", c: ["A) To reduce energy consumption","B) To prevent hardware failures","C) To maintain optimal temperature and humidity levels","D) To increase data transfer speeds"], a: "C" },
      { q: "Which characteristic allows users to access computing resources without human intervention from the service provider?", c: ["A) Scalability","B) On-demand self-service","C) Broad network access","D) Resource pooling"], a: "B" },
      { q: "Which characteristic refers to the ability to rapidly increase or decrease computing resources to meet demand?", c: ["A) Scalability","B) Accessibility","C) Elasticity","D) Control"], a: "C" },
      { q: "What cloud computing characteristic allows users to pay only for the resources they consume?", c: ["A) On-demand self-service","B) Broad network access","C) Rapid elasticity","D) Metered service"], a: "D" },
      { q: "Which characteristic allows multiple users to share and access the same pool of computing resources?", c: ["A) On-demand self-service","B) Broad network access","C) Resource pooling","D) Rapid elasticity"], a: "C" },
    ],
    extraQA: [
      { q: "What does NIST stand for in the context of cloud computing definitions?", c: ["A) National Internet Service Technology","B) National Institute of Standards and Technology","C) Network Infrastructure Standards Toolkit","D) National Information Security Team"], a: "B" },
      { q: "What is the difference between scalability and elasticity?", c: ["A) They are the same thing","B) Scalability is scaling up (vertical), elasticity is scaling out (horizontal)","C) Elasticity is manual, scalability is automatic","D) Scalability refers to cost, elasticity refers to performance"], a: "B" },
      { q: "What does PUE measure in a data centre?", c: ["A) Power Usage Effectiveness — ratio of total facility power to IT equipment power","B) Processing Unit Efficiency — CPU performance metric","C) Public Utility Expenditure — cloud cost metric","D) Performance Under Extreme load"], a: "A" },
      { q: "Which cost model does cloud computing primarily follow?", c: ["A) CapEx (Capital Expenditure)","B) OpEx (Operational Expenditure)","C) Fixed pricing","D) Free tier only"], a: "B" },
    ]
  },
  {
    title: "Week 2 — Cloud Computing Models",
    slideQA: [
      { q: "What type of cloud infrastructure is accessible to the general public and owned by a third-party provider?", c: ["A) Public Cloud","B) Private Cloud","C) Hybrid Cloud","D) Community Cloud"], a: "A" },
      { q: "Which cloud deployment model provides exclusive use to a single organization?", c: ["A) Public Cloud","B) Private Cloud","C) Hybrid Cloud","D) Community Cloud"], a: "B" },
      { q: "Which cloud model combines the advantages of public and private clouds?", c: ["A) Public Cloud","B) Private Cloud","C) Hybrid Cloud","D) Community Cloud"], a: "C" },
      { q: "Which cloud model is shared among several organizations with similar concerns?", c: ["A) Public Cloud","B) Private Cloud","C) Hybrid Cloud","D) Community Cloud"], a: "D" },
      { q: "Which of the following is a characteristic of a private cloud?", c: ["A) Shared infrastructure","B) Limited scalability","C) Dedicated resources","D) Low security"], a: "C" },
      { q: "Which cloud deployment model provides the highest level of control and security?", c: ["A) Public Cloud","B) Private Cloud","C) Hybrid Cloud","D) Community Cloud"], a: "B" },
      { q: "Which cloud model offers flexibility and cost efficiency but may raise concerns regarding data privacy?", c: ["A) Public Cloud","B) Private Cloud","C) Hybrid Cloud","D) Community Cloud"], a: "A" },
      { q: "Which of the following is a disadvantage of a public cloud?", c: ["A) Limited scalability","B) Higher costs","C) Lower security","D) Dedicated resources"], a: "C" },
      { q: "Which cloud deployment model is suitable for highly regulated industries like healthcare and finance?", c: ["A) Public Cloud","B) Private Cloud","C) Hybrid Cloud","D) Community Cloud"], a: "B" },
      { q: "Which cloud service model allows users to manage the OS, middleware, and runtime but not the underlying infrastructure?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "B" },
      { q: "Which cloud service model offers the highest level of scalability but requires the most management effort?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "A" },
      { q: "Which cloud service model provides a virtualised environment where users can run applications without managing servers?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "B" },
      { q: "Which cloud service model offers the most customisation for developers who want full control over their application stack?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "A" },
      { q: "Which cloud service model is typically used for delivering software applications over the internet on a subscription basis?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "C" },
      { q: "Which cloud service model abstracts away the underlying infrastructure, runtime, and middleware?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "B" },
      { q: "Which cloud service model is suitable for organizations that want to outsource their entire IT infrastructure?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "A" },
      { q: "Which cloud service model provides a comprehensive development and deployment environment for web and mobile apps?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "B" },
      { q: "Which cloud service model is often employed for deploying databases and message queues without managing infrastructure?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "B" },
      { q: "Which cloud service model is most suitable for developing and deploying applications without infrastructure management?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "B" },
      { q: "Which cloud service model is suitable for standardised business applications like email, CRM, and document collaboration?", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "C" },
    ],
    extraQA: [
      { q: "Which of the following is an example of SaaS?", c: ["A) Amazon EC2","B) Google App Engine","C) Dropbox","D) VirtualBox"], a: "C" },
      { q: "AWS Snowball is designed to solve which cloud challenge?", c: ["A) Security compliance","B) Large-scale data transfer","C) Application scaling","D) Real-time analytics"], a: "B" },
    ]
  },
  {
    title: "Week 3 — Cloud Computing and Virtualisation",
    slideQA: [
      { q: "What is cloud virtualisation?", c: ["A) Running multiple cloud services simultaneously","B) Simulating hardware and software to appear as multiple instances","C) Distributing data across multiple cloud servers","D) Enabling cloud computing without virtualisation"], a: "B" },
      { q: "Which of the following is NOT a benefit of cloud virtualisation?", c: ["A) Improved resource utilisation","B) Increased scalability","C) Reduced security","D) Enhanced flexibility"], a: "C" },
      { q: "What is a hypervisor in cloud virtualisation?", c: ["A) A hardware device for networking in the cloud","B) A software layer that manages virtual machines","C) A protocol for transferring data between cloud servers","D) A security mechanism for cloud environments"], a: "B" },
      { q: "Which type of virtualisation allows multiple operating systems to run on a single physical machine simultaneously?", c: ["A) Network virtualisation","B) Storage virtualisation","C) Server virtualisation","D) Desktop virtualisation"], a: "C" },
      { q: "What is the purpose of live migration in cloud virtualisation?", c: ["A) Moving VMs between physical servers without downtime","B) Upgrading the hypervisor software","C) Scaling up cloud resources automatically","D) Encrypting data during transmission"], a: "A" },
      { q: "Which virtualisation technique provides a single interface to manage multiple storage devices?", c: ["A) Network virtualisation","B) Storage virtualisation","C) Server virtualisation","D) Application virtualisation"], a: "B" },
      { q: "Which of the following is a type of cloud deployment model that benefits from virtualisation?", c: ["A) Public cloud","B) Private cloud","C) Hybrid cloud","D) All of the above"], a: "D" },
      { q: "What is the primary goal of network virtualisation in cloud computing?", c: ["A) Reducing latency","B) Consolidating physical network equipment","C) Simplifying network management","D) Ensuring data confidentiality"], a: "C" },
      { q: "Which virtualisation technique allows multiple VMs to share the same physical network interface?", c: ["A) Server virtualisation","B) Network virtualisation","C) Storage virtualisation","D) Desktop virtualisation"], a: "B" },
      { q: "Which virtualisation technique abstracts physical storage resources and presents them as logical units?", c: ["A) Server virtualisation","B) Network virtualisation","C) Storage virtualisation","D) Application virtualisation"], a: "C" },
      { q: "Which virtualisation technology allows users to access a remote desktop environment from anywhere?", c: ["A) Server virtualisation","B) Network virtualisation","C) Storage virtualisation","D) Desktop virtualisation"], a: "D" },
      { q: "Which cloud computing characteristic is closely associated with cloud virtualisation?", c: ["A) On-demand self-service","B) Broad network access","C) Resource pooling","D) Rapid elasticity"], a: "C" },
      { q: "What is a Type 1 hypervisor?", c: ["A) A hypervisor installed on top of a host operating system","B) A hypervisor that runs directly on the physical hardware","C) A hypervisor used for testing and development purposes","D) A hypervisor designed for mobile devices"], a: "B" },
      { q: "What is the primary difference between Type 1 and Type 2 hypervisors?", c: ["A) Type 1 are for servers, Type 2 are for desktops","B) Type 1 run directly on hardware, Type 2 run on top of an OS","C) Type 1 are free, Type 2 are paid","D) Type 1 support fewer VMs than Type 2"], a: "B" },
      { q: "Which type of hypervisor typically provides better performance and scalability?", c: ["A) Type 1 hypervisor","B) Type 2 hypervisor","C) Both offer similar performance","D) Depends on use case and configuration"], a: "A" },
      { q: "Which statement about the speed of Type 1 and Type 2 hypervisors is correct?", c: ["A) Type 1 are generally slower than Type 2","B) Type 2 are generally slower than Type 1","C) Both offer similar speed","D) Speed depends solely on underlying hardware"], a: "B" },
      { q: "What is the primary difference between full virtualisation and para-virtualisation?", c: ["A) Full virtualisation emulates hardware completely, para-virtualisation modifies the guest OS","B) Full virtualisation does not require modifications to the guest OS, para-virtualisation does","C) Full virtualisation only supports certain guest OSes","D) Full virtualisation is slower due to increased overhead"], a: "B" },
      { q: "When would full virtualisation be more suitable than para-virtualisation?", c: ["A) When the guest operating system cannot be modified","B) When the main goal is to achieve high performance","C) When the host system requires complete isolation","D) When the guest OS is Linux-based"], a: "A" },
    ],
    extraQA: [
      { q: "Which of the following is an example of a Type 1 (bare-metal) hypervisor?", c: ["A) Oracle VirtualBox","B) VMware Workstation","C) VMware ESXi","D) Parallels Desktop"], a: "C" },
      { q: "In full virtualisation, are the guest operating systems aware they are running in a virtualised environment?", c: ["A) Yes","B) No"], a: "B — Guest OSes are unaware they are in a virtualised environment" },
    ]
  },
  {
    title: "Week 4 — Cloud Storage",
    slideQA: [
      { q: "Which storage type typically offers the fastest data access speeds?", c: ["A) Block storage","B) Object storage","C) File storage","D) Direct storage"], a: "D" },
      { q: "Which storage type is best suited for high-performance computing (HPC) applications requiring low-latency access?", c: ["A) Direct storage","B) Object storage","C) File storage","D) Cloud storage"], a: "A" },
      { q: "In which use case would block storage be most appropriate?", c: ["A) Storing multimedia files","B) Hosting a database with frequent read/write operations","C) Storing backup archives","D) Hosting a website with static content"], a: "B" },
      { q: "Which storage type is ideal for storing large volumes of unstructured data like videos and images in a scalable manner?", c: ["A) Cloud storage","B) Block storage","C) Object storage","D) File storage"], a: "C" },
      { q: "Which storage type is often used for storing virtual machine snapshots and disk images?", c: ["A) Object storage","B) Block storage","C) File storage","D) Direct storage"], a: "B" },
      { q: "Which storage type typically offers the lowest cost per gigabyte for long-term data retention?", c: ["A) Block storage","B) Object storage","C) File storage","D) Direct storage"], a: "B" },
      { q: "Which storage type often incurs additional charges based on the number of requests made to retrieve data?", c: ["A) Object storage","B) Block storage","C) File storage","D) Direct storage"], a: "A" },
      { q: "In which use case would file storage likely result in the highest storage costs?", c: ["A) Storing large binary files for a software development project","B) Hosting a CMS for a blog website","C) Storing raw data from IoT devices","D) Storing compressed archives of historical financial records"], a: "D" },
      { q: "What does the acronym \"IOPS\" stand for?", c: ["A) Input/Output Processing System","B) Input/Output Performance Standard","C) Input/Output Operations Per Second","D) Internal Output Process System"], a: "C" },
      { q: "Which factor primarily affects IOPS performance in storage systems?", c: ["A) Network bandwidth","B) Disk space availability","C) Processor speed","D) Disk latency and response time"], a: "D" },
      { q: "If a storage system with a 10 ms average latency can handle 200 IOPS, what is its average response time?", c: ["A) 0.5 ms","B) 5 ms","C) 50 ms","D) 500 ms"], a: "B" },
    ],
    extraQA: [
      { q: "Object storage uses what structure to organise data?", c: ["A) Folder hierarchy","B) Volumes","C) Buckets with flat structure and metadata","D) Tables and rows"], a: "C" },
      { q: "Which type of storage is ephemeral and lost if the compute resource is terminated?", c: ["A) File storage","B) Block storage","C) Object storage","D) Direct-attached storage"], a: "D" },
      { q: "Which AWS service provides object storage?", c: ["A) Amazon EBS","B) Amazon EFS","C) Amazon S3","D) Amazon RDS"], a: "C" },
    ]
  },
  {
    title: "Week 5 — Cloud Databases",
    slideQA: [
      { q: "Which database type is also known as SQL databases?", c: ["A) Relational databases","B) Non-relational databases","C) Graph databases","D) Key-value stores"], a: "A" },
      { q: "Which database type is best suited for highly structured data with predefined schemas?", c: ["A) Relational databases","B) Non-relational databases","C) Graph databases","D) Columnar databases"], a: "A" },
      { q: "Which database type allows for flexible schemas and is ideal for semi-structured or unstructured data?", c: ["A) Relational databases","B) Non-relational databases","C) Graph databases","D) Document databases"], a: "B" },
      { q: "Which database type is often used for social networks, recommendation engines, and network analysis?", c: ["A) Relational databases","B) Non-relational databases","C) Graph databases","D) Key-value stores"], a: "C" },
      { q: "Which database type typically uses tables, rows, and columns to organise data?", c: ["A) Relational databases","B) Non-relational databases","C) Graph databases","D) Document databases"], a: "A" },
    ],
    extraQA: [
      { q: "What does CRUD stand for?", c: ["A) Create, Read, Update, Delete","B) Copy, Retrieve, Upload, Download","C) Configure, Run, Update, Deploy","D) Compute, Replicate, Upload, Distribute"], a: "A" },
      { q: "Which of the following is a non-relational (NoSQL) database service offered by AWS?", c: ["A) Amazon RDS","B) Amazon Aurora","C) Amazon DynamoDB","D) Amazon Redshift"], a: "C" },
      { q: "Why is data replication important in cloud databases?", c: ["A) It reduces storage costs","B) It improves fault tolerance and reduces latency","C) It eliminates the need for backups","D) It simplifies the database schema"], a: "B" },
      { q: "What does ACID compliance ensure in relational databases?", c: ["A) High availability and scalability","B) Atomicity, Consistency, Isolation, and Durability of transactions","C) Automatic indexing and compression","D) Access control and identity management"], a: "B" },
      { q: "Which type of NoSQL database stores data as JSON-like nested documents?", c: ["A) Key-value store","B) Column-family store","C) Document data store","D) Graph database"], a: "C" },
    ]
  },
  {
    title: "Week 6 — Cloud Security, Identity & Governance",
    slideQA: [
      { q: "Under the Shared Responsibility Model, which of the following is the customer's responsibility?", c: ["A) Securing the physical data centres","B) Patching the guest operating system","C) Maintaining network hardware","D) Decommissioning storage devices"], a: "B" },
      { q: "Which IAM entity is best suited for an EC2 instance that needs to access an S3 bucket?", c: ["A) IAM User","B) IAM Group","C) IAM Role","D) Root User"], a: "C" },
      { q: "What is the primary function of AWS CloudTrail?", c: ["A) To block DDoS attacks","B) To log API calls and user activity for auditing","C) To encrypt data at rest","D) To cache content at the edge"], a: "B" },
      { q: "Which principle states that users should be granted only the minimum permissions needed?", c: ["A) Principle of Maximum Authority","B) Principle of Least Privilege","C) Principle of Shared Responsibility","D) Principle of Elasticity"], a: "B" },
      { q: "Which service is used to centrally manage multiple AWS accounts and apply Service Control Policies?", c: ["A) AWS IAM","B) AWS Config","C) AWS Organizations","D) AWS Artifact"], a: "C" },
      { q: "In the context of the CIA triad, what does 'Integrity' ensure?", c: ["A) Data is not disclosed to unauthorised users","B) Data is available when needed","C) Data has not been altered or tampered with","D) Data is encrypted at rest"], a: "C" },
    ],
    extraQA: [
      { q: "What does the 'C' in the CIA triad stand for?", c: ["A) Compliance","B) Cloud","C) Confidentiality","D) Configuration"], a: "C" },
      { q: "Under the Shared Responsibility Model, who is responsible for the security OF the cloud?", c: ["A) The customer","B) The cloud provider (AWS)","C) Both equally","D) Third-party auditors"], a: "B" },
      { q: "What is the difference between Security Groups and NACLs in AWS?", c: ["A) Security Groups are stateless, NACLs are stateful","B) Security Groups operate at instance level (stateful), NACLs at subnet level (stateless)","C) They are identical","D) NACLs only apply to outbound traffic"], a: "B" },
      { q: "What does AWS KMS provide?", c: ["A) Kubernetes management","B) Key Management Service for creating and controlling encryption keys","C) Kinesis monitoring statistics","D) Knowledge management system"], a: "B" },
      { q: "AWS Shield protects against which type of attack?", c: ["A) SQL injection","B) Cross-site scripting","C) DDoS attacks","D) Social engineering"], a: "C" },
    ]
  },
  {
    title: "Week 7 — Migrating to the Cloud (Guest Lecture)",
    slideQA: [],
    extraQA: [
      { q: "What are the two broad approaches to cloud migration?", c: ["A) Build and Deploy","B) Lift-and-shift vs Re-architect","C) Manual vs Automated","D) Public vs Private"], a: "B" },
      { q: "What is 'lift and shift' migration?", c: ["A) Building a new application from scratch","B) Moving an existing application to the cloud with minimal changes","C) Transferring data using physical devices","D) Converting from SaaS to IaaS"], a: "B" },
      { q: "Why is re-architecting risky for large legacy codebases?", c: ["A) It's always cheaper","B) It can take as long as the original development, creates dual maintenance, and risks functionality changes","C) It's simpler than lift-and-shift","D) Cloud providers don't support it"], a: "B" },
      { q: "What are the '6 Rs' of cloud migration?", c: ["A) Rehost, Replatform, Refactor, Repurchase, Retire, Retain","B) Run, Replicate, Restore, Reconfigure, Retry, Return","C) Read, Revise, Rebuild, Redeploy, Retest, Release","D) Reboot, Reinstall, Reclaim, Review, Redo, Resubmit"], a: "A" },
      { q: "What is the Retry Pattern used for in distributed systems?", c: ["A) Ignoring errors permanently","B) Automatically retrying failed requests to handle transient network failures","C) Replacing failed servers","D) Compressing network data"], a: "B" },
      { q: "What is the Circuit Breaker Pattern?", c: ["A) A physical device to protect servers","B) A pattern that stops calling a failing service to prevent cascading failures","C) A load-balancing algorithm","D) An encryption mechanism"], a: "B" },
      { q: "What does Infrastructure as Code (IaC) enable?", c: ["A) Manual server configuration","B) Automated, repeatable provisioning of infrastructure using code (e.g. Terraform)","C) Writing code without servers","D) Free cloud hosting"], a: "B" },
      { q: "What are the 'Fallacies of Distributed Computing'?", c: ["A) Design patterns for microservices","B) False assumptions developers make (e.g. network is reliable, latency is zero)","C) Security vulnerabilities","D) Database normalisation rules"], a: "B" },
    ]
  },
  {
    title: "Week 8 — Cloud-Native Architecture",
    slideQA: [
      { q: "What is a primary advantage of microservices over monolithic architecture?", c: ["A) Simpler deployment for small applications","B) Independent scaling of individual components","C) Reduced network latency between components","D) Single technology stack requirement"], a: "B" },
      { q: "Which technology virtualises the operating system rather than the hardware?", c: ["A) Hypervisor","B) Virtual Machine","C) Container","D) VPC"], a: "C" },
      { q: "What does 'Serverless' mean in the context of AWS Lambda?", c: ["A) The application runs without any hardware","B) The user manages the physical servers remotely","C) The user does not provision or manage the underlying servers","D) The application can only run offline"], a: "C" },
      { q: "Which AWS service is best suited for decoupling microservices using a message queue?", c: ["A) Amazon EC2","B) Amazon RDS","C) Amazon SQS","D) Amazon SNS"], a: "C" },
      { q: "Which design pattern is used to prevent cascading failures by stopping calls to a failing service?", c: ["A) Singleton Pattern","B) Circuit Breaker Pattern","C) Repository Pattern","D) Observer Pattern"], a: "B" },
      { q: "Amazon EKS is a managed service for which open-source platform?", c: ["A) Docker Swarm","B) Apache Hadoop","C) Kubernetes","D) Terraform"], a: "C" },
    ],
    extraQA: [
      { q: "What is the key difference between containers and virtual machines?", c: ["A) Containers are heavier and slower","B) Containers virtualise the OS and share the host kernel; VMs virtualise the hardware","C) VMs are more portable than containers","D) They are the same"], a: "B" },
      { q: "What is the 'Strangler Pattern' in cloud migration?", c: ["A) Shutting down a system abruptly","B) Gradually replacing pieces of a legacy monolith with microservices","C) Throttling network traffic","D) Compressing old databases"], a: "B" },
      { q: "AWS Lambda functions are triggered by which of the following?", c: ["A) Only API Gateway requests","B) Only S3 events","C) Events such as S3 uploads, API Gateway requests, SQS messages, and scheduled events","D) Only manual invocation"], a: "C" },
      { q: "What does SNS stand for and what does it do?", c: ["A) Simple Notification Service — pub/sub messaging that pushes messages to subscribers","B) Secure Network Service — encrypts network traffic","C) Server Node Scheduling — manages EC2 fleets","D) Storage Naming System — manages S3 bucket names"], a: "A" },
    ]
  },
  {
    title: "Week 9 — Networking in Cloud Computing",
    slideQA: [
      { q: "Which of the following is NOT a characteristic of a private network?", c: ["A) Secure access","B) Limited accessibility","C) Public availability","D) Controlled environment"], a: "C" },
      { q: "Which type of IP address is typically used within a private network?", c: ["A) Public IP address","B) Dynamic IP address","C) Static IP address","D) Private IP address"], a: "D" },
      { q: "What is the purpose of a firewall in a private network?", c: ["A) To prevent unauthorised access","B) To increase network speed","C) To allocate IP addresses","D) To manage DNS queries"], a: "A" },
      { q: "What is the advantage of using a private network over a public network?", c: ["A) Higher bandwidth","B) Lower cost","C) Improved security","D) Global accessibility"], a: "C" },
      { q: "Which device is commonly used to connect a private network to the internet while providing security?", c: ["A) Modem","B) Router","C) Switch","D) Hub"], a: "B" },
      { q: "Which of the following is a common application of a private network?", c: ["A) Social media platforms","B) Online shopping websites","C) Corporate intranets","D) Video streaming services"], a: "C" },
      { q: "How many IP addresses are available in a CIDR block with a /27 prefix?", c: ["A) 8","B) 16","C) 32","D) 64"], a: "C (2^(32-27) = 32)" },
      { q: "Which IP address range is reserved for private networks according to RFC 1918?", c: ["A) 10.0.0.0 – 10.255.255.255","B) 172.16.0.0 – 172.31.255.255","C) 192.168.0.0 – 192.168.255.255","D) All of the above"], a: "D" },
      { q: "Which CIDR notation represents the largest number of available IP addresses?", c: ["A) /24","B) /28","C) /16","D) /20"], a: "C" },
      { q: "What is the purpose of an IP address in computer networking?", c: ["A) To identify the manufacturer of the device","B) To locate the physical address of the device","C) To uniquely identify a device on a network","D) To determine the age of the device"], a: "C" },
      { q: "How many bits are used to represent an IPv4 address?", c: ["A) 16 bits","B) 32 bits","C) 64 bits","D) 128 bits"], a: "B" },
      { q: "Which of the following is a valid IPv4 address?", c: ["A) 2001:0db8:85a3:0000:0000:8a2e:0370:7334","B) 192.168.1.256","C) FE80:CD00:0000:0CDE:1257:0000:211E:729C","D) 172.16.0.1"], a: "D" },
      { q: "What is a subnet?", c: ["A) A network with a single IP address","B) A division of a larger network into smaller networks","C) A network connected via satellite","D) A network without any routers"], a: "B" },
      { q: "What is the purpose of subnetting?", c: ["A) To increase the speed of data transmission","B) To decrease the number of available IP addresses","C) To reduce network congestion","D) To efficiently allocate IP addresses and manage network traffic"], a: "D" },
      { q: "What is the primary purpose of ingress and egress rules in network security?", c: ["A) To monitor network bandwidth usage","B) To filter incoming and outgoing traffic","C) To optimise network performance","D) To allocate IP addresses dynamically"], a: "B" },
      { q: "In a firewall configuration, what does an ingress rule typically specify?", c: ["A) Allowed outgoing traffic","B) Allowed incoming traffic","C) Blocked outgoing traffic","D) Blocked incoming traffic"], a: "B" },
      { q: "What is the primary function of DHCP in a network?", c: ["A) To assign static IP addresses to devices","B) To dynamically assign IP addresses to devices","C) To encrypt data transmission over the network","D) To establish secure connections between devices"], a: "B" },
      { q: "What is the purpose of a gateway in a network?", c: ["A) To connect devices within the same subnet","B) To connect devices from different networks","C) To encrypt network traffic","D) To manage network bandwidth"], a: "B" },
      { q: "What is the role of a route table in networking?", c: ["A) To store information about IP addresses","B) To encrypt data transmitted over the network","C) To dynamically assign IP addresses","D) To determine the best path for data forwarding"], a: "D" },
      { q: "What information is typically stored in a route table entry?", c: ["A) Source IP address","B) Destination IP address","C) Subnet mask","D) MAC address"], a: "B" },
    ],
    extraQA: [
      { q: "How many bits are used in an IPv6 address?", c: ["A) 32 bits","B) 64 bits","C) 128 bits","D) 256 bits"], a: "C" },
      { q: "What is the difference between a whitelist and a blacklist firewall approach?", c: ["A) Whitelist allows everything by default","B) Whitelist defines what is allowed (everything else blocked), blacklist defines what is blocked (everything else allowed)","C) They are the same thing","D) Whitelist is for ingress only"], a: "B" },
      { q: "Which firewall approach provides better security?", c: ["A) Blacklist","B) Whitelist","C) Neither — they are equal","D) It depends on network speed"], a: "B" },
    ]
  },
  {
    title: "Week 10 — Cloud Architecting (AWS Well-Architected Framework)",
    slideQA: [
      { q: "Which of the following best describes cloud architecting as defined in the AWS module?", c: ["A) The design of traditional on-premises IT infrastructure","B) Applying cloud best practices to build scalable, highly available solutions using AWS services","C) A method for manually configuring data centres","D) An approach to exclusively managing physical servers"], a: "B" },
      { q: "What is the primary purpose of the AWS Well-Architected Tool?", c: ["A) To provide access to AWS best practices","B) To enforce security policies automatically","C) To review and measure workload architectures against AWS best practices","D) To optimise pricing for AWS services"], a: "C" },
      { q: "Which pillar focuses on running and monitoring systems to deliver business value?", c: ["A) Security","B) Operational Excellence","C) Cost Optimization","D) Sustainability"], a: "B" },
      { q: "Which pillar is primarily concerned with implementing a strong identity foundation?", c: ["A) Reliability","B) Performance Efficiency","C) Security","D) Cost Optimization"], a: "C" },
      { q: "Which of the following is a best practice for resource management on AWS?", c: ["A) Manually configuring each resource","B) Keeping resources permanently provisioned","C) Deploying updates directly to production","D) Treating resources as disposable and automating deployments"], a: "D" },
      { q: "Which AWS global infrastructure component is a geographical area comprising two or more Availability Zones?", c: ["A) Availability Zone","B) Local Zone","C) Region","D) Edge Location"], a: "C" },
      { q: "What is the primary purpose of using Availability Zones in AWS architectures?", c: ["A) To provide a single point of failure","B) To ensure fault isolation and resiliency by replicating across physically separate locations","C) To reduce latency by caching content","D) To serve as a local extension for latency-sensitive apps"], a: "B" },
      { q: "Which of the following best describes a Local Zone in AWS?", c: ["A) A geographical region with multiple AZs","B) A dedicated data centre for high-security operations","C) A virtualised environment for running cloud applications","D) An extension of an AWS Region closer to end users"], a: "D" },
      { q: "Which design trade-off is commonly evaluated when architecting solutions on AWS?", c: ["A) The trade-off between consistency and latency to achieve higher performance","B) The trade-off between physical server count and virtualisation complexity","C) The trade-off between cloud and on-premise deployment exclusively","D) The trade-off between manual and automated provisioning only"], a: "A" },
      { q: "Which AWS service practice is recommended to enhance security in cloud architectures?", c: ["A) Using multi-factor authentication (MFA) for access control","B) Relying solely on user passwords","C) Disabling logging to improve performance","D) Exposing administrative ports to the public internet"], a: "A" },
    ],
    extraQA: [
      { q: "How many pillars does the AWS Well-Architected Framework have?", c: ["A) 4","B) 5","C) 6","D) 7"], a: "C — Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability" },
      { q: "What does 'mechanical sympathy' mean in the Performance Efficiency pillar?", c: ["A) Being kind to servers","B) Using a tool/system with an understanding of how it operates best","C) Optimising for lowest cost only","D) Automating all processes"], a: "B" },
      { q: "What does 'treating resources as disposable' mean?", c: ["A) Never terminating instances","B) Thinking of infrastructure as software — easily replaceable, stoppable, and recreatable","C) Using only free-tier resources","D) Ignoring cost optimisation"], a: "B" },
      { q: "What is caching used for in AWS architectures?", c: ["A) Increasing storage capacity","B) Minimising redundant data retrieval operations, improving performance and cost","C) Encrypting data at rest","D) Managing IAM roles"], a: "B" },
    ]
  },
  {
    title: "Week 11 — Module Revision (Cross-Topic)",
    slideQA: [],
    extraQA: [
      { q: "Match the correct service model: 'You manage Data & App only, the provider manages everything else.'", c: ["A) IaaS","B) PaaS","C) SaaS","D) FaaS"], a: "B" },
      { q: "Which NIST essential characteristic states that usage is monitored and billed?", c: ["A) On-demand self-service","B) Broad network access","C) Resource pooling","D) Measured service"], a: "D" },
      { q: "A Type 1 hypervisor runs directly on hardware. What is an example?", c: ["A) VirtualBox","B) VMware ESXi","C) VMware Workstation","D) Parallels Desktop"], a: "B" },
      { q: "Which storage type uses buckets, has a flat structure, and is accessed via API?", c: ["A) Block storage","B) File storage","C) Object storage","D) Direct-attached storage"], a: "C" },
      { q: "Amazon RDS is an example of which type of database service?", c: ["A) Non-relational (NoSQL)","B) Graph database","C) Relational (SQL)","D) Key-value store"], a: "C" },
      { q: "Under the Shared Responsibility Model, who is responsible for encrypting customer data?", c: ["A) AWS","B) The customer","C) Both equally","D) Neither"], a: "B" },
      { q: "Which migration strategy involves moving VMs to the cloud as-is?", c: ["A) Refactor","B) Rehost (lift and shift)","C) Repurchase","D) Retire"], a: "B" },
      { q: "What are containers best described as?", c: ["A) Full virtual machines with their own OS","B) Lightweight, portable packages that share the host OS kernel","C) Physical servers","D) Database instances"], a: "B" },
      { q: "In AWS networking, a VPC is best described as:", c: ["A) A physical data centre","B) An isolated virtual network in the cloud","C) A type of storage","D) A monitoring tool"], a: "B" },
      { q: "When justifying a design choice in an exam, you should reference at least how many pillars of the Well-Architected Framework?", c: ["A) 1","B) 2","C) 3","D) All 6"], a: "C" },
      { q: "Which pillar focuses on minimising environmental impact?", c: ["A) Cost Optimisation","B) Sustainability","C) Operational Excellence","D) Performance Efficiency"], a: "B" },
      { q: "What does 'Refactor' mean in the 6 Rs of migration?", c: ["A) Lift and shift","B) Re-architect for cloud-native (e.g. monolith to microservices)","C) Buy a SaaS replacement","D) Turn off unneeded services"], a: "B" },
      { q: "NACLs are ______ firewalls; Security Groups are ______ firewalls.", c: ["A) Stateful; Stateless","B) Stateless; Stateful","C) Both stateless","D) Both stateful"], a: "B" },
      { q: "A larger CIDR prefix number (e.g. /28 vs /16) means:", c: ["A) More IP addresses","B) Fewer IP addresses","C) The same number of IPs","D) Better security"], a: "B" },
      { q: "Which AWS service provides DDoS protection?", c: ["A) AWS CloudTrail","B) AWS Shield","C) AWS KMS","D) AWS Organizations"], a: "B" },
    ]
  },
];

// ── reference table data ──
const refTable = [
  ["1","Intro to Cloud Computing","— (concepts)"],
  ["2","Cloud Models (IaaS/PaaS/SaaS)","EC2, Elastic Beanstalk, Snowball"],
  ["3","Virtualisation","EC2 (VMs), Hypervisors"],
  ["4","Cloud Storage","S3 (Object), EBS (Block), EFS (File)"],
  ["5","Cloud Databases","RDS (SQL), DynamoDB (NoSQL)"],
  ["6","Security & IAM","IAM, KMS, CloudTrail, Shield, Organizations"],
  ["7","Cloud Migration","Snowball, Terraform, Landing Zones"],
  ["8","Cloud-Native Architecture","Lambda, SQS, SNS, ECS, EKS, Docker"],
  ["9","Networking","VPC, Subnets, CIDR, DHCP, Firewalls"],
  ["10","Cloud Architecting","Well-Architected Tool, CloudFront, Auto Scaling, ELB"],
  ["11","Module Revision","All of the above"],
];

// ── build numbered list configs ──
const numberingConfigs = [];
let listIdx = 0;
for (const w of weeks) {
  if (w.slideQA.length > 0) {
    numberingConfigs.push({ reference: `slide-${listIdx}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
  }
  if (w.extraQA.length > 0) {
    numberingConfigs.push({ reference: `extra-${listIdx}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
  }
  listIdx++;
}
numberingConfigs.push({ reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });

// ── assemble document sections ──
const children = [];

// Title
children.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 100 }, children: [new TextRun({ text: "Cloud Computing", font: "Arial", size: 56, bold: true, color: C.accent2 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Master Q&A Study Guide", font: "Arial", size: 36, color: C.accent })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "MOD006125 — All Weeks (1–11) Compiled", font: "Arial", size: 22, color: C.grey, italics: true })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "Extracted from lecture slides + additional practice questions for full topic coverage.", font: "Arial", size: 20, color: C.grey })] }));

// Quick reference table
children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 200 }, children: [new TextRun({ text: "Quick Reference: Topics & AWS Services", font: "Arial" })] }));

const tblRows = [];
tblRows.push(new TableRow({ tableHeader: true, children: [headerCell("Week", 1200), headerCell("Topic", 4400), headerCell("Key AWS Services", 3760)] }));
for (const r of refTable) {
  tblRows.push(new TableRow({ children: [dataCell(r[0], 1200), dataCell(r[1], 4400), dataCell(r[2], 3760)] }));
}
children.push(new Table({ columnWidths: [1200,4400,3760], rows: tblRows }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// Weekly sections
listIdx = 0;
for (const w of weeks) {
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text: w.title, font: "Arial" })] }));

  if (w.slideQA.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "Slide Q&A", font: "Arial", color: C.accent })] }));
    for (const qa of w.slideQA) {
      const qb = questionBlock(0, qa.q, qa.c, qa.a, `slide-${listIdx}`);
      children.push(...qb);
    }
  }

  if (w.extraQA.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: "Additional Practice Questions", font: "Arial", color: C.accent })] }));
    for (const qa of w.extraQA) {
      const qb = questionBlock(0, qa.q, qa.c, qa.a, `extra-${listIdx}`);
      children.push(...qb);
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));
  listIdx++;
}

// Final note
children.push(new Paragraph({ spacing: { before: 300, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Total: 150+ questions covering all 11 weeks.", font: "Arial", size: 28, bold: true, color: C.accent2 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Good luck with your revision!", font: "Arial", size: 24, color: C.grey, italics: true })] }));

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { size: 56, bold: true, color: C.accent2, font: "Arial" }, paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: C.accent2, font: "Arial" }, paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: C.accent, font: "Arial" }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
    ]
  },
  numbering: { config: numberingConfigs },
  sections: [{
    properties: {
      page: { margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Cloud Computing — Master Study Guide", font: "Arial", size: 16, color: C.grey, italics: true })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", font: "Arial", size: 16, color: C.grey }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.grey }), new TextRun({ text: " of ", font: "Arial", size: 16, color: C.grey }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 16, color: C.grey })] })] })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("C:\\Users\\uthma\\Documents\\Dev Mode\\faajaa\\school\\Cloud Computing\\Cloud_Computing_Study_Guide.docx", buf);
  console.log("DONE — Cloud_Computing_Study_Guide.docx created");
});
