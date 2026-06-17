import { motion, AnimatePresence } from "framer-motion";
import { sectionReveal, staggerContainer } from "../motion";
import { useState } from "react";
import { person1 } from "@/assets/images";
import {
  stars as Stars,
  arrow_left as ArrowLeft,
  arrow_right as ArrowRight,
  right_blur as RightBlur,
} from "@/assets/icons";

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      img: person1,
      name: "Ahmed SaMy",
      country: "Egypt",
      text: "User-friendly CRM that makes client management simple and efficient",
    },
    {
      img: person1,
      name: "Sara Ali",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
    {
      img: person1,
      name: "Mohamed Adel",
      country: "Egypt",
      text: "Made our workflow much smoother and easier to handle",
    },
    {
      img: person1,
      name: "Laila Hassan",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
    {
      img: person1,
      name: "Youssef Samir",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
    {
      img: person1,
      name: "Mona Tamer",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
    {
      img: person1,
      name: "Hany Farouk",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
    {
      img: person1,
      name: "Nadia Khaled",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
    {
      img: person1,
      name: "Omar Said",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
    {
      img: person1,
      name: "Dina Fathy",
      country: "Egypt",
      text: "Efficient tool to manage all customer interactions in one place",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const next = () =>
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

  const getIndex = (offset: number) =>
    (activeIndex + offset + testimonials.length) % testimonials.length;

  return (
    <motion.div
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="flex flex-col items-center px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 mt-12 sm:mt-16 md:mt-20 lg:mt-24 relative max-w-360 mx-auto overflow-hidden"
    >
      <RightBlur
        className="absolute right-0 top-[20%] w-32 sm:w-40 md:w-48 lg:w-64 xl:w-80 -z-10 opacity-60 pointer-events-none"
        aria-hidden
      />
      <h1 className="max-w-157 mx-auto text-center text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-medium leading-tight">
        Success Stories From <span className="text-[#4A90E2]">Happy</span>{" "}
        Customers
      </h1>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="hidden lg:flex items-center gap-4 mt-12 lg:mt-16 xl:mt-20 w-full overflow-hidden py-10"
      >
        <div className="flex gap-6 w-full justify-center">
          <AnimatePresence mode="popLayout">
            {[-1, 0, 1].map((offset) => {
              const item = testimonials[getIndex(offset)];
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={getIndex(offset)}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isCenter ? 1 : 0.5,
                    scale: isCenter ? 1 : 0.9,
                    y: isCenter ? 35 : 0,
                    zIndex: isCenter ? 10 : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                  className="bg-[#FFFFFF] rounded-2xl p-5 flex w-full max-w-100 min-h-74 flex-col shadow-lg origin-center"
                >
                  <Stars className="w-45 -ml-8 mb-3" aria-hidden />
                  <p className="text-left text-lg sm:text-[20px] text-[#6C6C6C] -mt-5 mb-12">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col text-left">
                      <h1 className="font-semibold text-[14px]">{item.name}</h1>
                      <p className="text-[#6C6C6C] text-[12px]">
                        {item.country}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="lg:hidden w-full mt-8 overflow-visible py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-[#FFFFFF] rounded-2xl p-5 flex flex-col min-h-74 mx-auto max-w-100 shadow-md"
          >
            <Stars className="w-45 -ml-8 mb-3" aria-hidden />
            <p className="text-left text-lg text-[#6C6C6C] -mt-5 mb-12">
              {testimonials[activeIndex].text}
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <img
                src={testimonials[activeIndex].img}
                alt={testimonials[activeIndex].name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col text-left">
                <h1 className="font-semibold text-[14px]">
                  {testimonials[activeIndex].name}
                </h1>
                <p className="text-[#6C6C6C] text-[12px]">
                  {testimonials[activeIndex].country}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex w-full justify-between mt-10 sm:mt-12 lg:mt-16 max-w-100 lg:max-w-full mb-4">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          onClick={prev}
          className="rounded-full bg-white border-2 border-[#4A90E2] h-12.5 w-12.5 cursor-pointer z-20 hover:bg-[#4A90E2] hover:scale-110 transition-all flex items-center justify-center shadow-md group"
          aria-label="Previous"
        >
          <ArrowLeft
            className="w-6 h-6 filter group-hover:brightness-0 group-hover:invert"
            aria-hidden
          />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          onClick={next}
          className="rounded-full bg-[#4A90E2] border-2 border-[#4A90E2] h-12.5 w-12.5 cursor-pointer z-10 hover:bg-[#3a7bc8] hover:scale-110 transition-all flex items-center justify-center shadow-md"
          aria-label="Next"
        >
          <ArrowRight
            className="w-6 h-6 filter brightness-0 invert"
            aria-hidden
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Testimonials;
