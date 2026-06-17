// TeamPage.tsx
import { motion } from "framer-motion";
import {
  Behance01Icon,
  Facebook01Icon,
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  StarIcon,
} from "hugeicons-react";
import Navbar from "@/pages/landing/components/Navbar";
import { left_blur as LeftBlur, right_blur as RightBlur } from "@/assets/icons";
import { teamMembers, type TeamMember } from "./teamData";

/* ─── Animation Variants ─── */
const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const },
  },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
} as const;

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
} as const;

/* ─── Social Icons Map ─── */
const SocialLink = ({
  href,
  title,
  hoverColor,
  children,
}: {
  href: string;
  title: string;
  hoverColor: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    title={title}
    className={`text-[#8A8A8A] transition-all duration-300 hover:scale-110 ${hoverColor}`}
  >
    {children}
  </a>
);

/* ─── Member Card ─── */
const MemberCard = ({ member }: { member: TeamMember }) => (
  <motion.div
    variants={staggerItem}
    whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
    className={`group relative flex flex-col bg-white rounded-2xl border shadow-sm transition-all duration-500 ${
      member.isSpecial
        ? "border-[#FFD700]/40 shadow-[0_0_30px_-12px_rgba(255,215,0,0.25)] hover:shadow-[0_16px_48px_-12px_rgba(255,215,0,0.4)] hover:border-[#FFD700]/60"
        : "border-[#E8EDF5] hover:shadow-[0_16px_48px_-12px_rgba(74,144,226,0.18)]"
    }`}
  >
    {/* Top accent bar - Special gold for Roaa */}
    <div
      className={`h-1 w-full rounded-t-2xl ${
        member.isSpecial
          ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
          : "bg-gradient-to-r from-[#4A90E2] to-[#1C61B0]"
      } opacity-0 group-hover:opacity-100 transition-opacity duration-400`}
    />

    {/* Special Contributor Badge - Gold star icon */}
    {member.isSpecial && (
      <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg rotate-3 flex items-center gap-1.5">
        <StarIcon size={14} strokeWidth={2} fill="white" />
        <span>Special Contributor</span>
      </div>
    )}

    {/* Avatar */}
    <div className="flex justify-center pt-8 pb-4">
      <div className="relative">
        {/* Outer ring - Special gold glow for Roaa */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${
            member.isSpecial
              ? "border-[#FFD700]/30 group-hover:border-[#FFD700]/60 group-hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
              : "border-[#4A90E2]/15 group-hover:border-[#4A90E2]/30"
          } scale-110 group-hover:scale-125 transition-all duration-500`}
        />

        {/* Second ring for special members */}
        {member.isSpecial && (
          <div className="absolute inset-0 rounded-full border-2 border-[#FFD700]/10 scale-125 group-hover:scale-150 transition-all duration-700" />
        )}

        {/* Avatar circle */}
        <div
          className={`relative w-40 h-40 rounded-full overflow-hidden border-[3px] ${
            member.isSpecial
              ? "border-[#FFD700]/50 group-hover:border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)]"
              : "border-[#D6E8FA] group-hover:border-[#4A90E2]/60"
          } transition-all duration-400 shadow-md`}
        >
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                member.isSpecial
                  ? "bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/30"
                  : "bg-gradient-to-br from-[#4A90E2]/10 to-[#1C61B0]/20"
              }`}
            >
              <span
                className={`font-parkinsans font-bold text-2xl ${
                  member.isSpecial ? "text-[#D4A500]" : "text-[#4A90E2]"
                }`}
              >
                {member.initials}
              </span>
            </div>
          )}
        </div>
        {/* Online dot - Special gold for Roaa */}
        <span
          className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
            member.isSpecial ? "bg-[#FFD700]" : "bg-[#22C55E]"
          }`}
        />
      </div>
    </div>

    {/* Text */}
    <div className="flex-1 flex flex-col px-6 pb-6 text-center">
      <h3
        className={`font-parkinsans font-semibold text-lg leading-tight transition-colors duration-300 ${
          member.isSpecial
            ? "text-[#D4A500] group-hover:text-[#FFD700]"
            : "text-[#1A1A1A] group-hover:text-[#4A90E2]"
        }`}
      >
        {member.name}
      </h3>
      <div className="mt-2">
        <span
          className={`inline-block text-xs font-medium px-3.5 py-1 rounded-full ${
            member.isSpecial
              ? "text-[#B8860B] bg-[#FFF8DC] border border-[#FFD700]/20"
              : "text-[#4A90E2] bg-[#EEF5FF]"
          }`}
        >
          {member.role}
        </span>
      </div>
      <p
        className={`mt-4 text-sm leading-relaxed flex-grow ${
          member.isSpecial ? "text-[#8B7D3C]" : "text-[#6B7280]"
        }`}
      >
        {member.description}
      </p>

      {/* Divider */}
      <div
        className={`mt-5 pt-4 border-t flex justify-center gap-4 ${
          member.isSpecial ? "border-[#FFD700]/20" : "border-[#F0F4FA]"
        }`}
      >
        {member.social.linkedin && (
          <SocialLink
            href={member.social.linkedin}
            title="LinkedIn"
            hoverColor="hover:text-[#0A66C2]"
          >
            <Linkedin01Icon size={22} strokeWidth={1.5} />
          </SocialLink>
        )}
        {member.social.github && (
          <SocialLink
            href={member.social.github}
            title="GitHub"
            hoverColor="hover:text-[#181717]"
          >
            <GithubIcon size={22} strokeWidth={1.5} />
          </SocialLink>
        )}
        {member.social.instagram && (
          <SocialLink
            href={member.social.instagram}
            title="Instagram"
            hoverColor="hover:text-[#E4405F]"
          >
            <InstagramIcon size={22} strokeWidth={1.5} />
          </SocialLink>
        )}
        {member.social.behance && (
          <SocialLink
            href={member.social.behance}
            title="Behance"
            hoverColor="hover:text-[#1769FF]"
          >
            <Behance01Icon size={22} strokeWidth={1.5} />
          </SocialLink>
        )}
        {member.social.facebook && (
          <SocialLink
            href={member.social.facebook}
            title="Facebook"
            hoverColor="hover:text-[#1877F2]"
          >
            <Facebook01Icon size={22} strokeWidth={1.5} />
          </SocialLink>
        )}
        {member.social.email && (
          <SocialLink
            href={`mailto:${member.social.email}`}
            title="Email"
            hoverColor="hover:text-[#4A90E2]"
          >
            <Mail01Icon size={22} strokeWidth={1.5} />
          </SocialLink>
        )}
      </div>
    </div>
  </motion.div>
);

/* ─── Page ─── */
const TeamPage: React.FC = () => {
  // All members in one grid - special ones will be highlighted
  const allMembers = teamMembers;

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-white">
      {/* Background blur decoratives */}
      <LeftBlur
        className="pointer-events-none absolute -left-24 top-24 z-0 w-60 opacity-40 sm:w-72 lg:w-96"
        aria-hidden
      />
      <RightBlur
        className="pointer-events-none absolute -right-24 top-72 z-0 w-60 opacity-40 sm:w-72 lg:w-96"
        aria-hidden
      />
      <LeftBlur
        className="pointer-events-none absolute -left-28 bottom-40 z-0 w-64 opacity-30 sm:w-80 lg:w-[28rem]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col">
        <Navbar />

        <main className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 mt-10 sm:mt-14 pb-20 max-w-[1440px] mx-auto w-full">
          {/* Intro heading */}
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            className="mb-12 sm:mb-16"
          >
            <h1 className="font-medium text-2xl sm:text-3xl lg:text-[36px] text-[#1A1A1A] mb-4">
              Behind the <span className="text-[#4A90E2]">Magic</span>
            </h1>
            <p className="font-medium text-[#6B7280] text-base sm:text-lg max-w-xl leading-relaxed">
              A passionate team of engineers, designers, and strategists
              dedicated to pushing the boundaries of what's possible.
            </p>
          </motion.div>

          {/* All Team Members in One Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          >
            {allMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-20 flex items-center justify-center gap-6 text-[#8A8A8A] text-sm flex-wrap"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              All systems operational
            </span>
            <span>·</span>
            <span>Together, we build the future</span>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default TeamPage;