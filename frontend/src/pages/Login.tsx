export default function Login() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <input className="border p-2 w-full mb-4" placeholder="User ID" />
        <input className="border p-2 w-full mb-4" type="password" placeholder="Password" />

        <button className="bg-blue-600 text-white w-full py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}
