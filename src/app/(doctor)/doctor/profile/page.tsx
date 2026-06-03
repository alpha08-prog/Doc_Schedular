"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";

const PLACEHOLDER = "Not set yet";

interface DoctorProfile {
  specialty: string;
  licenseNumber: string;
  experience: string;
  bio: string;
  fee: string; // kept as string for the input; sent as number
}

const EMPTY: DoctorProfile = { specialty: "", licenseNumber: "", experience: "", bio: "", fee: "" };

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const doctorProfileId = (user as { doctorProfileId?: string } | null)?.doctorProfileId;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorProfile>(EMPTY);
  const [draft, setDraft] = useState<DoctorProfile>(EMPTY);

  const displayName = user?.name ?? "Doctor";
  const displayEmail = user?.email ?? PLACEHOLDER;
  const displayRole = user?.role ?? "doctor";

  useEffect(() => {
    if (!doctorProfileId) {
      setLoading(false);
      return;
    }
    let active = true;
    fetch(`/api/doctors/${doctorProfileId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!active || !j.success) return;
        const d = j.data;
        const next: DoctorProfile = {
          specialty: d.specialty ?? "",
          licenseNumber: d.licenseNumber ?? "",
          experience: d.experience ?? "",
          bio: d.bio ?? "",
          fee: d.fee != null ? String(d.fee) : "",
        };
        setProfile(next);
        setDraft(next);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [doctorProfileId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorProfileId) {
      notify("No doctor profile linked to this account.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/doctors/${doctorProfileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty: draft.specialty,
          licenseNumber: draft.licenseNumber,
          experience: draft.experience,
          bio: draft.bio,
          ...(draft.fee.trim() !== "" ? { fee: Number(draft.fee) } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error ?? "Failed to save");
      setProfile(draft);
      setIsEditing(false);
      notify("Profile updated.", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const set = (key: keyof DoctorProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your professional information</p>
          </div>
          {!isEditing && doctorProfileId && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </header>

        <Card padding="lg" className="mb-6">
          <div className="flex items-center gap-5">
            <Avatar name={displayName} size="xl" />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{displayName}</h2>
              <p className="text-gray-600 truncate">{displayEmail}</p>
              <div className="mt-2">
                <Badge variant="info" className="capitalize">
                  {displayRole}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {isEditing ? (
          <form onSubmit={handleSave}>
            <Card padding="lg" className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
              <Input
                label="Specialty"
                value={draft.specialty}
                onChange={set("specialty")}
                placeholder="e.g. Cardiologist"
              />
              <Input
                label="License Number"
                value={draft.licenseNumber}
                onChange={set("licenseNumber")}
                placeholder="Medical license number"
              />
              <Input
                label="Experience"
                value={draft.experience}
                onChange={set("experience")}
                placeholder="e.g. 10+ years"
              />
              <Input
                label="Consultation Fee"
                type="number"
                value={draft.fee}
                onChange={set("fee")}
                placeholder="e.g. 500"
              />
              <Input
                label="Bio"
                value={draft.bio}
                onChange={set("bio")}
                placeholder="A short professional bio"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>
        ) : (
          <div className="space-y-6">
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <ProfileField label="Full Name" value={displayName} />
                <ProfileField label="Email" value={displayEmail} />
                <ProfileField label="Role" value={displayRole} capitalize />
              </dl>
            </Card>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : !doctorProfileId ? (
                <p className="text-sm text-gray-500">
                  No doctor profile is linked to this account.
                </p>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <ProfileField label="Specialty" value={profile.specialty || PLACEHOLDER} />
                  <ProfileField
                    label="License Number"
                    value={profile.licenseNumber || PLACEHOLDER}
                  />
                  <ProfileField label="Experience" value={profile.experience || PLACEHOLDER} />
                  <ProfileField
                    label="Consultation Fee"
                    value={profile.fee ? `₹${profile.fee}` : PLACEHOLDER}
                  />
                  <ProfileField label="Bio" value={profile.bio || PLACEHOLDER} />
                </dl>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  capitalize?: boolean;
}

function ProfileField({ label, value, capitalize }: ProfileFieldProps) {
  const isPlaceholder = value === PLACEHOLDER;
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd
        className={`mt-0.5 text-base ${isPlaceholder ? "text-gray-400 italic" : "text-gray-900"} ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
