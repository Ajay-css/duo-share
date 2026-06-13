import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

import UploadIcon from "../assets/icons/upload.svg";
import DownloadIcon from "../assets/icons/download.svg";

function Home() {
  return (
    <>
      <Navbar />

      <section className="relative min-h-screen overflow-hidden bg-[#fafafa]">
        {/* Background Glow */}

        <div className="absolute left-[-100px] top-[120px] h-[350px] w-[350px] rounded-full bg-violet-100 blur-[180px]" />

        <div className="absolute right-[-100px] top-[180px] h-[350px] w-[350px] rounded-full bg-blue-100 blur-[180px]" />

        <div className="absolute bottom-[-100px] left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-100 blur-[180px]" />

        <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center px-6 pt-28">
          {/* Badge */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
              <p>Secure WebRTC Transfer</p>
            </div>
          </motion.div>

          {/* Hero Title */}

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl text-center text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-neutral-900"
          >
            Move Files
            {" "}

            <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
              Across Devices
            </span>

            <br />

            Instantly.
          </motion.h1>

          {/* Subtitle */}

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-6 max-w-xl text-center text-lg leading-relaxed text-neutral-500"
          >
            Transfer files directly between your devices without cloud storage.
            Fast, private and built for modern workflows.
          </motion.p>

          {/* CTA Buttons */}

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/send"
              className="rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-1"
            >
              Send Files
            </Link>

            <Link
              to="/receive"
              className="rounded-full border border-neutral-200 bg-white px-8 py-3 text-sm font-medium text-neutral-700 transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-50"
            >
              Receive Files
            </Link>
          </motion.div>

          {/* Action Cards */}

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-16 grid w-full max-w-5xl gap-6 md:grid-cols-2"
          >
            {/* Send Card */}

            <Link
              to="/send"
              className="group rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <img
                src={UploadIcon}
                alt="Send"
                className="h-12 w-12 transition duration-300 group-hover:scale-110"
              />

              <h3 className="mt-8 text-2xl font-semibold text-neutral-900">
                Send Files
              </h3>

              <p className="mt-3 text-neutral-500 leading-relaxed">
                Share videos, projects and large files directly from your
                computer without uploading to the cloud.
              </p>

              <div className="mt-8 text-sm font-medium text-indigo-600">
                Open Sender →
              </div>
            </Link>

            {/* Receive Card */}

            <Link
              to="/receive"
              className="group rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <img
                src={DownloadIcon}
                alt="Receive"
                className="h-12 w-12 transition duration-300 group-hover:scale-110"
              />

              <h3 className="mt-8 text-2xl font-semibold text-neutral-900">
                Receive Files
              </h3>

              <p className="mt-3 text-neutral-500 leading-relaxed">
                Connect instantly using a room code or QR code and receive files
                securely at maximum speed.
              </p>

              <div className="mt-8 text-sm font-medium text-indigo-600">
                Open Receiver →
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Home;