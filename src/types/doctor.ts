export interface Doctor {
  id: number | string;
  name: string;
  specialty: string;
  image: string;
  status: "Available" | "Busy" | "Offline" | string;
  bio: string;
  time: string;
  rating?: number;
  experience?: string;
  fee?: number;
  phone?: string;
  languages?: string[];
  education?: string;
  address?: string;
}
