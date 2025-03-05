import Head from "next/head";
import Image from "next/image";
import { FaLock } from "react-icons/fa"; // Importing the lock icon from React Icons

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Video */}
        <Image
          src="/Nexalyze-Blue-Black.png"
          alt="Nexalyze Blue Black Logo"
          width={200}
          className="absolute top-4 left-4 z-50"
          height={150}
        />
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src="https://nexalyze.com/wp-content/uploads/2024/10/3129957-uhd_3840_2160_25fps-2.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute"></div>
        </div>

        {/* Login Form */}
        <form className="relative z-10 w-[90%] max-w-md rounded-lg bg-gray-900 bg-opacity-80 p-6 shadow-lg">
          <div className="text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-400 text-gray-900 mx-auto">
              <FaLock className="text-3xl" />{" "}
              {/* Using React Icon for the Lock */}
            </span>
            <h2 className="mt-2 text-white text-xl font-semibold">Login</h2>
          </div>

          {/* Input Fields */}
          <div className="mt-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:outline-none transition"
            />
          </div>
          <div className="mt-4 mb-4">
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full rounded-md border border-white bg-transparent px-4 py-2 text-white transition hover:bg-white hover:text-gray-900"
          >
            Login
          </button>

          {/* Forgot Password */}
          <a
            href="#"
            className="mt-3 block text-center text-sm text-white opacity-70 hover:opacity-100"
          >
            Forgot password?
          </a>
        </form>
      </div>
    </>
  );
}
