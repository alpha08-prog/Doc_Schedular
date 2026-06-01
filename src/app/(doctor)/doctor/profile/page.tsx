"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";

const PLACEHOLDER = "Not set yet";

interface DoctorFields {
  specialty?: string;
  licenseNumber?: string;
  experience?: string;
  fee?: number;
}

export default function DoctorProfile() {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields seeded from auth. Save is UI-only until Phase 5 adds
  // a real doctor-profile endpoint.
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  // Doctor-specific fields (optional on the User type, populated in Phase 5).
  const doctorFields: DoctorFields = (user as DoctorFields | null) ?? {};

  const displayName = user?.name ?? "Doctor";
  const displayEmail = user?.email ?? PLACEHOLDER;
  const displayRole = user?.role ?? "doctor";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate a brief save; persistence arrives in Phase 5.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    setIsEditing(false);
    notify("Profile updated. (Changes are not yet persisted server-side.)", "success");
  };

  const handleCancel = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your professional information</p>
          </div>
          {!isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </header>

        {/* Identity card */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-center gap-5">
            <Avatar name={displayName} size="xl" />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">Dr. {displayName}</h2>
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
          /* Edit form */
          <form onSubmit={handleSave}>
            <Card padding="lg" className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>

              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <p className="text-xs text-gray-500">
                Specialty, license number, and other professional details will become editable once
                doctor profiles are added in Phase 5.
              </p>

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
          /* Display mode */
          <div className="space-y-6">
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <ProfileField label="Full Name" value={`Dr. ${displayName}`} />
                <ProfileField label="Email" value={displayEmail} />
                <ProfileField label="Role" value={displayRole} capitalize />
              </dl>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                <Badge variant="neutral">Coming in Phase 5</Badge>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <ProfileField label="Specialty" value={doctorFields.specialty ?? PLACEHOLDER} />
                <ProfileField
                  label="License Number"
                  value={doctorFields.licenseNumber ?? PLACEHOLDER}
                />
                <ProfileField label="Experience" value={doctorFields.experience ?? PLACEHOLDER} />
                <ProfileField
                  label="Consultation Fee"
                  value={
                    typeof doctorFields.fee === "number" ? `$${doctorFields.fee}` : PLACEHOLDER
                  }
                />
              </dl>
              <p className="text-xs text-gray-500 mt-4">
                These fields are placeholders until proper doctor profiles are implemented.
              </p>
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
