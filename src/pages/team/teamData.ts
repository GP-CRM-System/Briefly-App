// teamData.ts
import { seif, essam, abdelrahman, pierre, zidan, sultan, samy, youssef , mennaA, mennaF, roaa} from "@/assets/team";

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string | null;
  initials: string;
  isSpecial?: boolean; // For special contributors like Roaa
  social: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
    email?: string;
    behance?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Seif Sheikhelarab",
    role: "Backend Engineer & Team Leader",
    description:
      "Visionary leader architecting robust, scalable backend systems to power our entire infrastructure. Guides the technical vision and team execution.",
    image: seif,
    initials: "SS",
    social: { linkedin: "#", github: "#", instagram: "#", facebook: "#", email: "#" },
  },
  {
    id: 2,
    name: "Abdelrahman Ataa",
    role: "Software Engineer & CTO",
    description:
      "Driving technological innovation and ensuring seamless integration across all engineering disciplines and product pipelines.",
    image: abdelrahman,
    initials: "AA",
    social: { 
      linkedin: "https://www.linkedin.com/in/abdelrahman-ataa-b557b8219/",
      github: "https://github.com/abdelrahman-ops", 
      email: "abdelrahmanataa17@gmail.com" 
    },
  },
  {
    id: 3,
    name: "Pierre Raoof Louis",
    role: "CRM Specialist",
    description:
      "Bridging the gap between groundbreaking tech and market needs with strategic, data-driven marketing initiatives.",
    image: pierre,
    initials: "PR",
    social: { linkedin: "#", github: "#", instagram: "#", facebook: "#", email: "#" },
  },
  {
    id: 4,
    name: "Menna Fathy",
    role: "UI/UX Designer",
    description:
      "Crafting intuitive, user-centric interfaces that make complex systems feel effortless, beautiful, and highly engaging.",
    image: mennaF,
    initials: "MF",
    social: { 
      linkedin: "#", 
      facebook: "https://www.facebook.com/share/18wjoinxgj/?mibextid=wwXIfr",
      instagram: "https://www.instagram.com/mennaf581?igsh=dncydnMyeWJ2dDg1&utm_source=qr",
      email: "#", 
      behance: "#" 
    },
  },
  {
    id: 5,
    name: "Ahmed Samy",
    role: "Frontend Engineer",
    description:
      "Translating brilliant designs into seamless, highly responsive, and accessible interactive user experiences.",
    image: samy,
    initials: "AS",
    social: { linkedin: "#", github: "#", instagram: "#" },
  },
  {
    id: 6,
    name: "Mohammed Zidan",
    role: "AI Engineer",
    description:
      "Building intelligent models and algorithms that push the boundaries of automation, prediction, and deep data analysis.",
    image: zidan,
    initials: "MZ",
    social: { linkedin: "#", github: "#", email: "#" },
  },
  {
    id: 7,
    name: "Mohamed Essam",
    role: "AI Engineer",
    description:
      "Developing cutting-edge machine learning solutions and neural networks to solve complex, real-world analytical problems.",
    image: essam,
    initials: "ME",
    social: { linkedin: "#", github: "#", instagram: "#", facebook: "#", email: "#" },
  },
  {
    id: 8,
    name: "Youssef Wael",
    role: "SOC Analyst",
    description:
      "Monitoring and responding to security events in real-time, acting as the vigilant guardian of our digital perimeter.",
    image: youssef,
    initials: "YW",
    social: { linkedin: "#", github: "#", instagram: "#", facebook: "#", email: "#" },
  },
  {
    id: 9,
    name: "Ahmed Sultan",
    role: "Cyber Security",
    description:
      "Implementing robust security protocols and safeguarding our cloud infrastructure from rapidly emerging global threats.",
    image: sultan,
    initials: "AS",
    social: { linkedin: "#", github: "#", instagram: "#", facebook: "#", email: "#" },
  }, 
  {
    id: 10,
    name: "Menna Ata",
    role: "Offensive Security",
    description:
      "Proactively identifying vulnerabilities through advanced penetration testing to ensure our systems remain completely impenetrable.",
    image: mennaA,
    initials: "MA",
    social: { linkedin: "#", github: "#", instagram: "#", facebook: "#", email: "#" },
  },
  {
    id: 11,
    name: "Roaa Emad",
    role: "Creative Graphic Desiner",
    description:
      "Our incredible friend and creative genius who brought our vision to life with stunning logo designs, beautiful graphics, and exceptional visual identity work. Roaa's artistic touch is woven into every pixel of our brand.",
    image: roaa,
    initials: "RE",
    isSpecial: true,
    social: { 
      linkedin: "https://www.linkedin.com/in/roaa-emad-201588218?utm_source=share_via&utm_content=profile&utm_medium=member_ios", 
      instagram: "https://www.instagram.com/roaaemad_studio?igsh=c3h1c21sbXg2ejV1&utm_source=qr", 
      behance: "#",
      email: "#" 
    },
  },
];