import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import socket from "../services/socket";
import toast from "react-hot-toast";
import { createPeerConnection } from "../services/webrtc";
import DownloadIcon from "../assets/icons/download.svg";

function Receive() {
  const [roomCode, setRoomCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const peerConnectionRef = useRef(null);
  const [receivedFile, setReceivedFile] = useState(null);
  const [receiveProgress, setReceiveProgress] = useState(null);
  const receivedChunksRef = useRef([])
  const receivedSizeRef = useRef(0)
  const totalSizeRef = useRef(0)
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const handleJoin = () => {
    if (!roomCode.trim()) return;

    socket.emit("join-room", roomCode);
  };

  useEffect(() => {
    const handleOffer = async (offer) => {
      try {
        const pc = createPeerConnection();

        peerConnectionRef.current = pc;

        pc.ondatachannel = (event) => {
          const channel = event.channel;

          channel.onopen = () => {
            console.log("🔥 Channel Open");
          };

          channel.onmessage = (event) => {

            if (typeof event.data === "string") {
              const data = JSON.parse(
                event.data
              );

              if (
                data.type === "file-info"
              ) {
                receivedChunksRef.current =
                  [];

                receivedSizeRef.current =
                  0;

                totalSizeRef.current =
                  data.fileSize;

                setFileName(
                  data.fileName
                );

                setReceiveProgress(0);

                return;
              }

              if (
                data.type ===
                "file-complete"
              ) {
                const blob = new Blob(
                  receivedChunksRef.current
                );

                const url =
                  URL.createObjectURL(blob);

                setDownloadUrl(url);

                setReceiveProgress(100);

                toast.success(
                  "File Received Successfully"
                );

                return;
              }
            }

            receivedChunksRef.current.push(
              event.data
            );

            receivedSizeRef.current +=
              event.data.byteLength;

            setReceiveProgress(
              Math.floor(
                (receivedSizeRef.current /
                  totalSizeRef.current) *
                100
              )
            );
          };
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              roomCode,
              candidate: event.candidate,
            });
          }
        };

        await pc.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          roomCode,
          answer,
        });

        console.log("📤 Answer Sent");
      } catch (err) {
        console.error(err);
      }
    };

    socket.on("offer", handleOffer);

    return () => {
      socket.off("offer", handleOffer);
    };
  }, [roomCode]);

  useEffect(() => {
    const handleIceCandidate = async (candidate) => {
      try {
        const pc = peerConnectionRef.current;

        if (!pc) return;

        await pc.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error(err);
      }
    };

    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, []);

  useEffect(() => {
    const handleRoomJoined = () => {
      setIsConnected(true);

      toast.success("Connected Successfully");
    };

    socket.on("room-joined", handleRoomJoined);

    return () => {
      socket.off("room-joined", handleRoomJoined);
    };
  }, []);

  return (
    <>
      <Navbar />

      <section className="relative min-h-screen overflow-hidden bg-[#fafafa] px-6 pt-32 pb-12">
        {/* Background Glow */}

        <div className="absolute top-24 left-[-100px] h-[300px] w-[300px] rounded-full bg-indigo-100 blur-[150px]" />

        <div className="absolute bottom-0 right-[-100px] h-[300px] w-[300px] rounded-full bg-cyan-100 blur-[150px]" />

        <div className="mx-auto max-w-5xl">
          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
              Ready To Receive
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-neutral-900">
              Receive Files
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-neutral-500">
              Enter the room code shared by the sender and connect instantly.
            </p>
          </motion.div>

          {/* Main Card */}

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-12 max-w-2xl rounded-[36px] border border-white/50 bg-white/80 p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg">
                <img
                  src={DownloadIcon}
                  alt="Receive"
                  className="h-10 w-10 brightness-0 invert"
                />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-neutral-900">
                Join Transfer Room
              </h2>

              <p className="mt-2 text-center text-neutral-500">
                Enter the 6-character room code generated by the sender.
              </p>

              <input
                type="text"
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(e.target.value.toUpperCase())
                }
                placeholder="AB12CD"
                maxLength={6}
                className="
                  mt-8
                  w-full
                  rounded-2xl
                  border
                  border-neutral-200
                  bg-white
                  px-5
                  py-4
                  text-center
                  text-xl
                  font-semibold
                  tracking-[0.3em]
                  outline-none
                  transition
                  focus:border-indigo-400
                  focus:ring-4
                  focus:ring-indigo-100
                "
              />

              <button
                onClick={handleJoin}
                className="
                  mt-6
                  w-full
                  rounded-2xl
                  bg-gradient-to-r
                  from-indigo-500
                  to-cyan-500
                  px-6
                  py-4
                  font-medium
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                "
              >
                Join Room
              </button>
            </div>
          </motion.div>

          {/* Status Cards */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 grid max-w-2xl gap-4 md:grid-cols-2"
          >
            <div className={`rounded-[28px] border bg-white p-6 transition-all ${isConnected
              ? "border-emerald-200 bg-emerald-50/40"
              : "border-neutral-200"
              }`}>
              <p className="text-sm text-neutral-500">
                Connection Status
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${isConnected
                    ? "bg-emerald-500"
                    : "bg-orange-400 animate-pulse"
                    }`}
                />

                <span className="font-medium text-neutral-800">
                  {isConnected
                    ? "Connected To Sender"
                    : "Waiting For Sender"}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-sm text-neutral-500">
                Transfer Status
              </p>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="
        h-full
        rounded-full
        bg-gradient-to-r
        from-emerald-500
        to-cyan-500
      "
                  style={{
                    width: `${receiveProgress}%`,
                  }}
                />
              </div>

              <p className="mt-3">
                {receiveProgress}%
              </p>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={fileName}
                  className="
        mt-4
        inline-flex
        rounded-xl
        bg-emerald-500
        px-5
        py-3
        text-white
      "
                >
                  Download File
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Receive;