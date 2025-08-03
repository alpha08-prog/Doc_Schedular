import Link from "next/link";
import doctorsData from "../../data/doctors.json";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
};

// Let TS infer the real JSON structure first
type RawDoctor = typeof doctorsData extends (infer U)[] ? U : never;

// Safely transform number `id` → string `id`, and select only required fields
const doctors: Doctor[] = (doctorsData as RawDoctor[]).map((doc) => ({
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
