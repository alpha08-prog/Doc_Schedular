import Link from "next/link";
import doctorsData from "../../data/doctors.json";

// Define proper TypeScript interface for doctors
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image?: string;
  bio?: string;
  rating?: number;
  experience?: string;
  status?: string;
}

// Type assertion for the imported JSON data
const doctors = doctorsData as Doctor[];

// Safely transform number `id` → string `id`, and select only required fields
const transformedDoctors: { id: string; name: string; specialty: string }[] = doctors.map((doc) => ({
  id: String(doc.id),
  name: doc.name,
  specialty: doc.specialty,
}));

export default function DoctorSelection() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-8">
      <h1 className="text-2xl font-bold mb-6">Select a Doctor</h1>
      <div className="grid gap-4 w-full max-w-2xl">
        {doctors.map((doctor) => (
          <Link
            key={doctor.id}
            href={`/doctor/${doctor.id}`}
            className="block bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition"
          >
            <div className="font-semibold">{doctor.name}</div>
            <div className="text-gray-500">{doctor.specialty}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
