
export const modules = [
  {
    id: 1,
    title: "Introduction to freelance",
    description: "Learn the fundamentals of freelance, explore why it's crucial in today’s interconnected world, and gain an understanding of the key concepts that form the foundation of a secure digital environment.",
    keyPoints: [
      "Importance of freelance",
      "Basic terminology and concepts",
      "Common security threats",
      "Overview of security tools"
    ],
    banner: "/Images/module1.avif",
    videoUrl: "https://youtu.be/6fM_I3APtqU?si=RN8Rx3FNLF0sL96I",
    mainContent: {
      section1: {
        title: "What is freelance?",
        content: "freelance involves the practice of defending computers, servers, mobile devices, networks, and data from malicious attacks, damage, or unauthorized access. It’s essential to secure all levels of a network to protect sensitive data and ensure privacy. freelance is an ongoing process of identifying, managing, and reducing risks associated with cyber threats."
      },
      section2: {
        title: "Why is freelance Important?",
        content: "freelance helps protect personal information like passwords, financial data, and intellectual property from cybercriminals. Organizations use freelance to prevent hackers from gaining unauthorized access to confidential business information, ensuring continuity and building trust with customers. It is essential for businesses to invest in freelance to prevent costly breaches and protect their reputation."
      }
    },
    additionalResources: [
      { title: "freelance Basics", type: "PDF", link: "https://www.ftc.gov/system/files/attachments/freelance-small-business/cybersecuirty_sb_factsheets_all.pdf" }
    ],
    quiz: [
      {
        question: "What is the primary purpose of freelance?",
        options: [
          "To make computers run faster",
          "To defend systems and data from malicious attacks and unauthorized access",
          "To create better software programs",
          "To improve internet connectivity"
        ],
        answer: 1
      },
      {
        question: "Why do organizations invest in freelance?",
        options: [
          "To increase profit margins",
          "To improve software development",
          "To prevent costly breaches and protect their reputation",
          "To comply with tax regulations"
        ],
        answer: 2
      },
      {
        question: "Which aspect describes freelance as a process?",
        options: [
          "One-time system setup",
          "Weekly system updates",
          "Yearly security audits",
          "Ongoing identification and management of risks"
        ],
        answer: 3
      },
      {
        question: "What type of data does freelance help protect?",
        options: [
          "Only financial information",
          "Only personal passwords",
          "Passwords, financial data, and intellectual property",
          "Only business documents"
        ],
        answer: 2
      }
    ]
  },
  {
    id: 2,
    title: "Network Security",
    description: "Dive into the world of network security, understanding how to protect your network infrastructure from various attacks while ensuring the confidentiality, integrity, and availability of data.",
    keyPoints: [
      "Network layers and protocols",
      "Firewalls and intrusion detection systems",
      "Secure network architecture",
      "Virtual Private Networks (VPNs)"
    ],
    videoUrl: "https://youtu.be/3oTLTijODA4?si=NSEXQ8JxwDv2VzZg",
    mainContent: {
      section1: {
        title: "Network Threats",
        content: "Common network threats include phishing (fraudulent communication), man-in-the-middle attacks (intercepting communications), and unauthorized access (hacking into systems). These threats can compromise data integrity and confidentiality. A successful network attack can lead to loss of business, theft of sensitive data, and significant reputational damage."
      },
      section2: {
        title: "Network Protection Strategies",
        content: "Network security strategies like firewalls (block unauthorized access), IDS/IPS (detect and prevent attacks), and VPNs (secure data transmission) are used to create secure network architectures. A comprehensive network security plan involves the use of layered defenses to prevent unauthorized access and mitigate potential threats before they cause harm."
      }
    },
    additionalResources: [
      { title: "Guide to Network Security", type: "Video", link: "https://youtu.be/zd0U1zNBYNk?si=4KLzrMSIEvL5C-dm" }
    ],
    quiz: [
      {
        question: "Which of these is a common network threat?",
        options: [
          "System updates",
          "Phishing attacks",
          "Password strength",
          "Network speed"
        ],
        answer: 1
      },
      {
        question: "What is the purpose of a firewall in network security?",
        options: [
          "To speed up network traffic",
          "To block unauthorized access",
          "To improve internet connectivity",
          "To store network data"
        ],
        answer: 1
      },
      {
        question: "What does a VPN provide in network security?",
        options: [
          "Faster internet speed",
          "Better hardware performance",
          "Secure data transmission",
          "Free internet access"
        ],
        answer: 2
      },
      {
        question: "What is a man-in-the-middle attack?",
        options: [
          "A physical security breach",
          "A software malfunction",
          "Intercepting communications",
          "A hardware failure"
        ],
        answer: 2
      }
    ]
  },
  {
    id: 3,
    title: "Web Application Security",
    description: "Understand how to protect web applications from common vulnerabilities and learn best practices for securing the development and deployment of modern web applications.",
    keyPoints: [
      "Understanding OWASP Top 10",
      "Cross-site scripting (XSS)",
      "SQL injection",
      "Authentication and authorization best practices"
    ],
    videoUrl: "https://youtu.be/OtcP8c4wZys?si=GfiVrmIONmnh51ke",
    mainContent: {
      section1: {
        title: "Web Application Vulnerabilities",
        content: "Web applications are frequently targeted by attackers using methods like Cross-site Scripting (XSS) and SQL Injection, where malicious scripts or SQL queries can exploit vulnerabilities in web applications to steal or corrupt data. Attackers can inject malicious code into web pages or submit crafted input to trick the server into executing harmful instructions."
      },
      section2: {
        title: "Mitigation Techniques",
        content: "To secure web applications, developers must implement secure coding practices, such as input validation and proper error handling. Tools like penetration testing frameworks (e.g., Burp Suite) can help identify vulnerabilities before exploitation. Developers should also adopt security measures such as Content Security Policy (CSP), Cross-Origin Resource Sharing (CORS), and secure cookie handling."
      }
    },
    additionalResources: [
      { title: "OWASP Top 10", type: "Website", link: "https://owasp.org/www-project-top-ten/" }
    ],
    quiz: [
      {
        question: "What is Cross-site Scripting (XSS)?",
        options: [
          "A programming language",
          "A security feature",
          "A method to inject malicious scripts into web pages",
          "A web development tool"
        ],
        answer: 2
      },
      {
        question: "Which security measure helps prevent unauthorized resource sharing between origins?",
        options: [
          "SQL Injection",
          "Cross-Origin Resource Sharing (CORS)",
          "Content Security Policy",
          "Error handling"
        ],
        answer: 1
      },
      {
        question: "What is the purpose of input validation in web security?",
        options: [
          "To make websites faster",
          "To prevent malicious code injection",
          "To improve user interface",
          "To store user data"
        ],
        answer: 1
      },
      {
        question: "What tool can help identify web application vulnerabilities?",
        options: [
          "Word processor",
          "Spreadsheet software",
          "Burp Suite",
          "Email client"
        ],
        answer: 2
      }
    ]
  },
  {
    id: 4,
    title: "Cryptography",
    videoUrl: "https://youtu.be/6fM_I3APtqU?si=ApO1E_HDupOjtH79",
    description: "Discover the essential concepts of cryptography and how encryption secures data both in transit and at rest, ensuring the confidentiality and integrity of sensitive information.",
    keyPoints: [
      "Basics of cryptography",
      "Symmetric and asymmetric encryption",
      "Hashing algorithms",
      "Public Key Infrastructure (PKI)"
    ],
    mainContent: {
      section1: {
        title: "Introduction to Cryptography",
        content: "Cryptography is the art of encoding information to ensure that only authorized parties can access it. It uses algorithms to transform data into unreadable formats, which can only be decrypted with a specific key. Cryptography is the foundation of modern freelance, allowing secure communication and protecting the integrity of sensitive data."
      },
      section2: {
        title: "Encryption Techniques",
        content: "Encryption methods include symmetric encryption (same key for encryption and decryption, e.g., AES) and asymmetric encryption (different keys for encryption and decryption, e.g., RSA). Public Key Infrastructure (PKI) uses a pair of cryptographic keys to enable secure communications between parties. These methods are employed in numerous security protocols like SSL/TLS for web communications."
      }
    },
    additionalResources: [
      { title: "Cryptography Basics", type: "PDF", link: "https://www.cs.unibo.it/babaoglu/courses/security/resources/documents/intro-to-crypto.pdf" }
    ],
    quiz: [
      {
        question: "What is the main purpose of cryptography?",
        options: [
          "To speed up data transfer",
          "To compress data",
          "To encode information for authorized access only",
          "To organize data"
        ],
        answer: 2
      },
      {
        question: "In symmetric encryption, what is used for both encryption and decryption?",
        options: [
          "Different keys",
          "The same key",
          "No keys",
          "Multiple keys"
        ],
        answer: 1
      },
      {
        question: "What is PKI used for?",
        options: [
          "Password storage",
          "Data compression",
          "Secure communications between parties",
          "File organization"
        ],
        answer: 2
      },
      {
        question: "Which is an example of symmetric encryption?",
        options: [
          "RSA",
          "AES",
          "SSH",
          "FTP"
        ],
        answer: 1
      }
    ]
  },
  {
    id: 5,
    title: "Ethical Hacking and Penetration Testing",
    videoUrl: "https://youtu.be/OtcP8c4wZys?si=CRVVSjqO9AV95KZE",
    description: "Learn how ethical hackers identify and mitigate vulnerabilities to improve security by conducting authorized and controlled attacks on systems and applications.",
    keyPoints: [
      "Phases of penetration testing",
      "Reconnaissance and footprinting",
      "Exploitation techniques",
      "Reporting vulnerabilities"
    ],
    mainContent: {
      section1: {
        title: "Introduction to Ethical Hacking",
        content: "Ethical hacking is the practice of intentionally probing systems for vulnerabilities in order to fix them before malicious hackers can exploit them. Ethical hackers follow a legal and authorized process to improve security. They use various tools and techniques to simulate real-world attacks and assess the security posture of an organization."
      },
      section2: {
        title: "Penetration Testing Lifecycle",
        content: "Penetration testing involves several phases: planning (identify scope), scanning (vulnerability analysis), exploitation (attempt to exploit vulnerabilities), and reporting (document findings and mitigation strategies). Penetration tests are critical in identifying gaps in security before they can be exploited by attackers."
      }
    },
    additionalResources: [
      { title: "Beginner's Guide to Ethical Hacking", type: "Video", link: "https://youtu.be/RWSqDF_6n4k?si=I6isaAT2G9eL3WYA" }
    ],
    quiz: [
      {
        question: "What is the purpose of ethical hacking?",
        options: [
          "To damage systems",
          "To steal data",
          "To identify and fix vulnerabilities before malicious hackers exploit them",
          "To slow down networks"
        ],
        answer: 2
      },
      {
        question: "Which phase of penetration testing involves vulnerability analysis?",
        options: [
          "Planning",
          "Scanning",
          "Reporting",
          "Implementation"
        ],
        answer: 1
      },
      {
        question: "What is the final phase of penetration testing?",
        options: [
          "Scanning",
          "Exploitation",
          "Planning",
          "Reporting"
        ],
        answer: 3
      },
      {
        question: "Ethical hackers must follow what kind of process?",
        options: [
          "Unauthorized and illegal",
          "Legal and authorized",
          "Informal and quick",
          "Secret and hidden"
        ],
        answer: 1
      }
    ]
  },
  {
    id: 6,
    title: "Incident Response and Forensics",
    videoUrl: "https://youtu.be/zuRQzc_Ox6o?si=HD3w3Hb-eUeDtAHq",
    description: "Learn the process of responding to and investigating security incidents, focusing on how to handle and analyze cyberattacks to preserve evidence for legal action.",
    keyPoints: [
      "Incident response process",
      "Collecting and preserving evidence",
      "Analyzing attacks",
      "Forensic tools and techniques"
    ],
    mainContent: {
      section1: {
        title: "Incident Response Basics",
        content: "Incident response is the process of identifying, containing, and resolving security breaches. This includes actions like system isolation, forensic investigation, and restoring systems to normal operations. Effective incident response helps organizations minimize the damage caused by attacks and reduce the time it takes to recover from them."
      },
      section2: {
        title: "Introduction to Digital Forensics",
        content: "Digital forensics focuses on collecting and analyzing digital evidence from compromised systems to understand the nature of an attack and preserve evidence for legal purposes. It involves examining logs, files, and network traffic to track the attacker's activities and help identify potential culprits."
      }
    },
    additionalResources: [
      { title: "Incident Response Checklist", type: "PDF", link: "https://nvlpubs.nist.gov/nistpubs/ir/2022/NIST.IR.8428.pdf" }
    ],
    quiz: [
      {
        question: "What is the first step in incident response?",
        options: [
          "System restoration",
          "Identifying security breaches",
          "Legal action",
          "Team training"
        ],
        answer: 1
      },
      {
        question: "What is the purpose of digital forensics?",
        options: [
          "System maintenance",
          "Network optimization",
          "Collecting and analyzing digital evidence",
          "Software development"
        ],
        answer: 2
      },
      {
        question: "Which action helps minimize attack damage?",
        options: [
          "System isolation",
          "Software updates",
          "User training",
          "Network expansion"
        ],
        answer: 0
      },
      {
        question: "What type of data is examined in digital forensics?",
        options: [
          "Only email communications",
          "Only system passwords",
          "Logs, files, and network traffic",
          "Only user documents"
        ],
        answer: 2
      }
    ]
  },
  {
    id: 7,
    title: "Advanced Topics and Career Paths",
    videoUrl: "https://youtu.be/b12JrM-6DBY?si=Dn0wUXaLKo3kxGRf",
    description: "Explore advanced freelance topics like cloud security, artificial intelligence, and the zero-trust architecture, while also learning about various career opportunities in the field of freelance.",
    keyPoints: [
      "Cloud security",
      "AI in freelance",
      "Zero trust architecture",
      "Certifications and career planning"
    ],
    mainContent: {
      section1: {
        title: "Cloud Security",
        content: "Cloud security involves securing cloud services and applications. This includes controlling access to cloud resources, protecting sensitive data, and ensuring compliance with regulations like GDPR. Cloud environments often face unique security challenges that require specialized approaches to safeguard data."
      },
      section2: {
        title: "Building a freelance Career",
        content: "freelance certifications like CISSP, CEH, and CompTIA Security+ are essential for career growth. This section explores career paths in areas such as network security, ethical hacking, and incident response. freelance professionals are in high demand, and there are diverse opportunities to specialize in various domains of security."
      }
    },
    additionalResources: [
      { title: "freelance Career Guide", type: "PDF", link: "https://www.wvjc.edu/wp-content/uploads/2020/07/The-Complete-Guide-To-Starting-Your-Career-in-freelance.pdf" }
    ],
    quiz: [
      {
        question: "What regulation is important for cloud security compliance?",
        options: [
          "GDPR",
          "HTML5",
          "TCP/IP",
          "DNS"
        ],
        answer: 0
      },
      {
        question: "Which certification is essential for freelance career growth?",
        options: [
          "HTML",
          "CISSP",
          "JavaScript",
          "Python"
        ],
        answer: 1
      },
      {
        question: "What is a primary focus of cloud security?",
        options: [
          "Increasing storage capacity",
          "Controlling access to resources",
          "Improving internet speed",
          "Creating backups"
        ],
        answer: 1
      },
      {
        question: "Which area represents a specialized freelance career path?",
        options: [
          "Web design",
          "Database administration",
          "Incident response",
          "Content creation"
        ],
        answer: 2
      }
    ]
  },
  {
    id: 8,
    title: "Advanced Malware Analysis",
    videoUrl: "https://youtu.be/z3lFMfWvwEo?si=ajgrzGQ1b5Xn_s8Z",
    description: "In this module, you will dive deep into advanced techniques for analyzing and dissecting malware, using both static and dynamic analysis methods. Gain hands-on experience in reverse engineering malware, behavior analysis, and using sandboxes to analyze the malicious activities of malware.",
    keyPoints: [
      "Static and dynamic analysis",
      "Reverse engineering malware",
      "Malware behavior analysis",
      "Using sandboxes for malware analysis",
      "Automating malware analysis"
    ],
    mainContent: {
      section1: {
        title: "Static Analysis",
        content: "Static analysis involves examining the malware code without executing it. This process allows you to understand the structure of the malware, its components, and potential damage it may cause. Tools like disassemblers (e.g., IDA Pro) and decompilers (e.g., Ghidra) are commonly used in static analysis. In this phase, you'll look for patterns in the code, strings, and known malicious behavior signatures that could indicate harmful intent."
      },
      section2: {
        title: "Dynamic Analysis",
        content: "Dynamic analysis involves executing the malware in a controlled environment, often within a sandbox, to observe its real-time behavior. The goal is to capture how the malware interacts with the system, such as file modifications, registry changes, network communication, and process spawning. Common tools used for dynamic analysis include Process Monitor, Wireshark, and Cuckoo Sandbox, which allow analysts to capture and interpret the malware’s actions."
      },
      section3: {
        title: "Reverse Engineering Malware",
        content: "Reverse engineering malware refers to the process of deconstructing and analyzing the inner workings of malicious software. By dissecting malware, security researchers can understand how it functions, how it exploits vulnerabilities, and how it can be mitigated. This can include analyzing malware code, understanding its algorithms, and even identifying custom encryption methods used to obfuscate its true behavior."
      },
      section4: {
        title: "Behavioral Analysis in Sandboxes",
        content: "Sandboxes allow malware to be safely executed in an isolated environment without risking the host system. This analysis involves observing how the malware behaves in this isolated environment. Analysts focus on the malware’s interactions with the operating system, network, and other processes. Sandboxes like Cuckoo provide detailed reports on file system changes, registry modifications, and any outbound network connections made by the malware."
      }
    },
    additionalResources: [
      { title: "Malware Analysis Tools", type: "Website", link: "/resources/malware-analysis" },
      { title: "Reverse Engineering Malware - Beginner to Expert", type: "Course", link: "https://www.udemy.com/course/advanced-malware-analysis/?srsltid=AfmBOopdadkXO3QzTFBAQUgJFXyb8JiimBzjYnCfZswqKqWDsnMdGFMk&couponCode=NEWYEARCAREER" }
    ],
    quiz: [
      {
        question: "What tool is commonly used for static malware analysis?",
        options: [
          "IDA Pro",
          "Microsoft Word",
          "Web browser",
          "Email client"
        ],
        answer: 0
      },
      {
        question: "What is the purpose of a sandbox in malware analysis?",
        options: [
          "To speed up malware",
          "To create malware",
          "To safely execute and observe malware",
          "To distribute malware"
        ],
        answer: 2
      },
      {
        question: "Which tool is used for capturing network traffic in dynamic analysis?",
        options: [
          "Notepad",
          "Calculator",
          "File Explorer",
          "Wireshark"
        ],
        answer: 3
      },
      {
        question: "What is examined during static analysis?",
        options: [
          "Running processes",
          "Network connections",
          "Malware code without execution",
          "System performance"
        ],
        answer: 2
      }
    ]
  },
  {
    id: 9,
    title: "Red Teaming and Blue Teaming",
    videoUrl: "https://youtu.be/ylz6NhQ5vQM?si=fi44KnZJOtzjD_yA",
    description: "This module introduces the concepts and methodologies used by Red and Blue teams to strengthen an organization’s freelance posture. Understand how Red teams simulate real-world attacks and how Blue teams defend against them, with practical scenarios and strategies for each team.",
    keyPoints: [
      "Red team tactics",
      "Blue team defense strategies",
      "Simulated attacks",
      "Security monitoring and response",
      "Continuous improvement of security posture"
    ],
    mainContent: {
      section1: {
        title: "Red Teaming",
        content: "Red teams are ethical hackers who simulate real-world attacks on systems, networks, and applications. They employ offensive tactics to identify vulnerabilities in an organization’s defenses and provide actionable insights on how to improve security. A red team may attempt techniques such as phishing, network penetration, and social engineering to breach security systems. Red teaming goes beyond simple penetration testing by mimicking advanced adversary tactics and employing sophisticated tools to test the resilience of security defenses."
      },
      section2: {
        title: "Blue Teaming",
        content: "Blue teams are responsible for defending an organization’s infrastructure against simulated attacks. They focus on monitoring and detecting attacks, preventing breaches, and responding to incidents. Blue team activities include configuring and maintaining firewalls, intrusion detection/prevention systems (IDS/IPS), and endpoint security solutions. Blue teams often rely on Security Information and Event Management (SIEM) tools to gather and analyze logs to identify and mitigate threats in real-time."
      },
      section3: {
        title: "Simulated Attacks and Real-World Scenarios",
        content: "The goal of Red and Blue teams is to continuously improve the organization's security posture. Red teams create simulated attack scenarios that challenge the Blue team to defend against them, helping organizations build a more robust defense. Through continuous practice, both teams can fine-tune their strategies. After each engagement, a debriefing session occurs where both teams discuss tactics, findings, and areas for improvement. This collaboration leads to a more effective and secure network environment."
      },
      section4: {
        title: "Security Monitoring and Incident Response",
        content: "Blue teams rely on effective security monitoring to detect and respond to incidents in real-time. This includes the use of SIEM systems, intrusion detection systems (IDS), and threat intelligence feeds to identify patterns of malicious activity. Incident response involves containing the threat, investigating the attack, and eradicating the malware or exploiting vulnerabilities before they cause further damage. Effective incident response is crucial in minimizing the impact of attacks."
      }
    },
    additionalResources: [
      { title: "Red Team vs Blue Team", type: "Video", link: "https://youtu.be/aEKwX95eYG4?si=ma8LbSOTGn3WTQTg" },
      { title: "Blue Team Best Practices", type: "PDF", link: "https://nukib.gov.cz/download/publikace/navody/cviceni/Tech_manual_FINAL.pdf" }
    ],
    quiz: [
      {
        question: "What is the primary role of a Red Team?",
        options: [
          "System maintenance",
          "Simulating real-world attacks",
          "Software development",
          "Network installation"
        ],
        answer: 1
      },
      {
        question: "What tool do Blue Teams use for log analysis?",
        options: [
          "Word processor",
          "Email client",
          "SIEM systems",
          "Web browser"
        ],
        answer: 2
      },
      {
        question: "What occurs after a Red Team engagement?",
        options: [
          "System shutdown",
          "Network restart",
          "Debriefing session",
          "Software update"
        ],
        answer: 2
      },
      {
        question: "What is a key Blue Team responsibility?",
        options: [
          "Creating malware",
          "Attacking systems",
          "Defending infrastructure",
          "Writing software"
        ],
        answer: 2
      }
    ]
  },
  {
    id: 10,
    title: "Zero Trust Architecture",
    videoUrl: "https://youtu.be/yn6CPQ9RioA?si=yI_nTzwwby7hbsas",
    description: "Zero Trust Architecture (ZTA) is a security model that assumes no one, either inside or outside the network, can be trusted by default. This module provides an in-depth understanding of Zero Trust principles and how organizations can implement them to secure their systems.",
    keyPoints: [
      "Zero trust principles",
      "Identity and access management (IAM)",
      "Micro-segmentation",
      "Implementing zero trust",
      "Continuous verification of trust"
    ],
    mainContent: {
      section1: {
        title: "What is Zero Trust?",
        content: "Zero Trust is a freelance model based on the principle of 'never trust, always verify.' It assumes that internal and external networks are equally vulnerable and that security must be enforced through continuous verification of trust. This model mandates that no entity, whether inside or outside the organization, is trusted by default, and every access request must be authenticated and authorized based on predefined security policies."
      },
      section2: {
        title: "Core Principles of Zero Trust",
        content: "Zero Trust Architecture is built on the foundation of three core principles: 1) Verify explicitly: Ensure every request for access is authenticated and authorized based on the user's identity, device health, and location. 2) Use least privilege access: Limit access to resources based on user roles and tasks. 3) Assume breach: Continuously monitor, detect, and respond to potential threats to prevent lateral movement across the network."
      },
      section3: {
        title: "Identity and Access Management (IAM)",
        content: "IAM is a critical component of Zero Trust. It involves managing digital identities and controlling access to resources based on the principle of least privilege. Multi-factor authentication (MFA), single sign-on (SSO), and role-based access control (RBAC) are key technologies used to enforce IAM in a Zero Trust environment. Ensuring only authorized users can access specific data or applications is essential for minimizing attack surfaces."
      },
      section4: {
        title: "Micro-segmentation and Implementing Zero Trust",
        content: "Micro-segmentation divides the network into smaller, isolated segments to prevent lateral movement of attackers. By applying strict access controls to each segment, Zero Trust prevents unauthorized access even if the network is compromised. Implementing Zero Trust involves deploying security technologies like network access control (NAC), application-layer firewalls, and encryption protocols to protect every interaction and data transmission within the network."
      }
    },
    additionalResources: [
      { title: "Zero Trust Architecture Framework", type: "PDF", link: "https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-207.pdf" },
      { title: "Guide to Implementing Zero Trust", type: "Website", link: "https://www.paloaltonetworks.com/cyberpedia/what-is-a-zero-trust-architecture" }
    ],
    quiz: [
      {
        question: "What is the core principle of Zero Trust?",
        options: [
          "Trust all internal users",
          "Never trust, always verify",
          "Trust by default",
          "Verify once"
        ],
        answer: 1
      },
      {
        question: "What is a key component of Zero Trust Architecture?",
        options: [
          "Open access",
          "Default trust",
          "Identity and Access Management",
          "Unlimited permissions"
        ],
        answer: 2
      },
      {
        question: "What is the purpose of micro-segmentation?",
        options: [
          "Increase network speed",
          "Expand network access",
          "Prevent lateral movement",
          "Allow unlimited access"
        ],
        answer: 2
      },
      {
        question: "Which technology enforces IAM in Zero Trust?",
        options: [
          "Single sign-on",
          "Open access",
          "Unrestricted privileges",
          "Default permissions"
        ],
        answer: 0
      }
    ]
  }
];
