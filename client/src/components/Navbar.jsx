import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Send", path: "/send" },
    { name: "Receive", path: "/receive" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-5 left-1/5 z-50 w-full -translate-x-1/2 flex justify-center"
    >
      <div className="flex items-center gap-4 rounded-full border border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
        <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 bg-clip-text text-sm font-semibold tracking-wide text-transparent">
          DuoShare
        </span>

        <div className="h-5 w-px bg-neutral-200" />

        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              location.pathname === link.path
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}

export default Navbar;