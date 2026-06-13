import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import socket from "../services/socket";
import toast from "react-hot-toast"
import QRCode from "react-qr-code";
import { createPeerConnection } from "../services/webrtc";
import UploadIcon from "../assets/icons/upload.svg";

function Send() {
  const [roomCode, setRoomCode] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transferStatus, setTransferStatus] = useState("Ready");
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null)
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState("0 MB/s");
  const [eta, setEta] = useState("--");

  useEffect(() => {
    if (roomCode) {
      socket.emit("create-room", roomCode);
    }
  }, [roomCode]);

  useEffect(() => {
    const handleReceiverJoined = async () => {
      try {
        setIsConnected(true);

        toast.success("Receiver Connected");

        const pc = createPeerConnection();

        peerConnectionRef.current = pc;

        const channel = pc.createDataChannel("duoshare");

        dataChannelRef.current = channel;

        channel.onopen = () => {
          console.log("🔥 Data Channel Opened");
        };

        channel.onmessage = (event) => {
          console.log("Message:", event.data);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              roomCode,
              candidate: event.candidate,
            });
          }
        };

        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

        socket.emit("offer", {
          roomCode,
          offer,
        });

        console.log("📤 Offer Sent");
      } catch (err) {
        console.error(err);
      }
    };

    socket.on("receiver-joined", handleReceiverJoined);

    return () => {
      socket.off("receiver-joined", handleReceiverJoined);
    };
  }, [roomCode]);

  useEffect(() => {
    const handleAnswer = async (answer) => {
      try {
        const pc = peerConnectionRef.current;

        if (!pc) return;

        await pc.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        console.log("✅ Answer Received");
      } catch (err) {
        console.error(err);
      }
    };

    socket.on("answer", handleAnswer);

    return () => {
      socket.off("answer", handleAnswer);
    };
  }, []);

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
    generateRoomCode();
  }, []);

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
      code += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    setRoomCode(code);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  const sendFile = () => {
    if (!selectedFile) {
      toast.error("Select File");
      return;
    }

    const channel = dataChannelRef.current;

    if (!channel || channel.readyState !== "open") {
      toast.error("Receiver Not Connected");
      return;
    }

    const chunkSize = 64 * 1024;

    channel.send(
      JSON.stringify({
        type: "file-info",
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      })
    );

    let offset = 0;

    const startTime = Date.now();

    const reader = new FileReader();

    const readSlice = (o) => {
      const slice = selectedFile.slice(
        o,
        o + chunkSize
      );

      reader.readAsArrayBuffer(slice);
    };

    reader.onload = async (e) => {
  const buffer = e.target.result;

  const sendChunk = async () => {
    while (
      channel.bufferedAmount >
      4 * 1024 * 1024
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, 10)
      );
    }

    channel.send(buffer);

    offset += buffer.byteLength;

    const percentage = Math.floor(
      (offset / selectedFile.size) * 100
    );

    setProgress(percentage);

    const elapsed =
      (Date.now() - startTime) / 1000;

    const speedBytes =
      offset / elapsed;

    const speedMB =
      speedBytes /
      (1024 * 1024);

    setSpeed(
      `${speedMB.toFixed(2)} MB/s`
    );

    const remaining =
      selectedFile.size - offset;

    const etaSeconds =
      remaining / speedBytes;

    setEta(
      `${Math.ceil(
        etaSeconds
      )} sec`
    );

    if (
      offset < selectedFile.size
    ) {
      readSlice(offset);
    } else {
      channel.send(
        JSON.stringify({
          type: "file-complete",
        })
      );

      toast.success(
        "File Sent Successfully"
      );
    }
  };

  sendChunk();
};

    readSlice(0);
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-[#fafafa] px-6 pt-32 pb-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-semibold text-neutral-900">
              Send Files
            </h1>

            <p className="mt-3 text-neutral-500">
              Select a file and share it securely with another device.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Side */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <label
                htmlFor="file-upload"
                className="
                  flex
                  min-h-[380px]
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-[32px]
                  border-2
                  border-dashed
                  border-neutral-300
                  bg-white
                  p-10
                  transition-all
                  hover:border-neutral-500
                "
              >
                <img
                  src={UploadIcon}
                  alt="Upload"
                  className="h-16 w-16"
                />

                <h2 className="mt-6 text-2xl font-semibold text-neutral-900">
                  Drag & Drop Files
                </h2>

                <p className="mt-3 text-center text-neutral-500">
                  Drop your files here or click to browse.
                </p>

                <div className="mt-8 rounded-full bg-black px-6 py-3 text-sm font-medium text-white">
                  Browse Files
                </div>

                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button
                onClick={sendFile}
                disabled={!isConnected}
                className="
    mt-4
    rounded-full
    bg-indigo-600
    px-6
    py-3
    text-white
    transition
    hover:bg-indigo-700
  "
              >
                Send File
              </button>
            </motion.div>

            {/* Right Side */}

            <div className="space-y-6">
              {/* Room Card */}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-[28px] border border-neutral-200 bg-white p-6"
              >
                <p className="text-sm text-neutral-500">
                  Room Code
                </p>

<div className="mt-6 flex justify-center">
  <div className="rounded-2xl bg-white p-3">
    <QRCode
      value={roomCode}
      size={120}
    />
  </div>
</div>

                <h2 className="mt-3 text-3xl font-semibold tracking-widest text-neutral-900">
                  {roomCode}
                </h2>

                <button
                  onClick={generateRoomCode}
                  className="mt-5 rounded-full border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-100"
                >
                  Generate New
                </button>
              </motion.div>

              {/* Status */}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-[28px] border bg-white p-6 transition-all ${isConnected
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-neutral-200"
                  }`}
              >
                <p className="text-sm text-neutral-500">
                  Connection Status
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${isConnected
                      ? "bg-emerald-500"
                      : "bg-orange-400 animate-pulse"
                      }`}
                  />

                  <span className="font-medium text-neutral-800">
                    {isConnected
                      ? "Receiver Connected"
                      : "Waiting For Receiver"}
                  </span>
                </div>
              </motion.div>

              {/* File Info */}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-[28px] border border-neutral-200 bg-white p-6"
              >
                <p className="text-sm text-neutral-500">
                  Selected File
                </p>

                {selectedFile ? (
                  <div className="mt-4">
                    <h3 className="font-medium text-neutral-900 break-all">
                      {selectedFile.name}
                    </h3>

                    <p className="mt-2 text-sm text-neutral-500">
                      {(
                        selectedFile.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-neutral-400">
                    No file selected
                  </p>
                )}
              </motion.div>

              <motion.div
                className="
    rounded-[28px]
    border
    border-neutral-200
    bg-white
    p-6
  "
              >
                <p className="text-sm text-neutral-500">
                  Transfer Progress
                </p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="
        h-full
        rounded-full
        bg-gradient-to-r
        from-indigo-500
        to-cyan-500
      "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-sm">
                  {progress}%
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                  Speed : {speed}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  ETA : {eta}
                </p>
              </motion.div>

              {/* <p className="mt-3 text-sm text-indigo-600">
                {transferStatus}
              </p>

              <button
                onClick={sendFile}
                disabled={!isConnected}
                className="
    mt-5
    w-full
    rounded-xl
    bg-indigo-500
    py-3
    font-medium
    text-white
    disabled:opacity-50
  "
              >
                Send File
              </button> */}

            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Send;