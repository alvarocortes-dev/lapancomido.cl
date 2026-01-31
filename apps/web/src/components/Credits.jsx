// src/components/Credits.jsx

import { SlGlobe } from "react-icons/sl";
import { FaLinkedinIn } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";

export const Credits = () => {
  return (
    <div className="bg-[#262011] text-[#F5E1A4] text-center text-xs sm:text-sm p-3">
      <p>
        Sitio desarrollado por Alvaro Pelusa™ Cortés
      </p>
      <div className="flex items-center justify-center gap-4 mt-2">
        <a
          href="https://www.alvarocortes.cl/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors p-1"
          aria-label="Sitio web"
        >
          <SlGlobe className="w-5 h-5" />
        </a>
        <a
          href="https://www.linkedin.com/in/alvarocortesopazo/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors p-1"
          aria-label="LinkedIn"
        >
          <FaLinkedinIn className="w-5 h-5" />
        </a>
        <a
          href="mailto:alvaro.cortes.dev@outlook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors p-1"
          aria-label="Email"
        >
          <MdOutlineMailOutline className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};
