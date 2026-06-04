-- CreateIndex
CREATE INDEX "Diagnosis_doctorId_idx" ON "Diagnosis"("doctorId");

-- CreateIndex
CREATE INDEX "Prescription_appointmentId_idx" ON "Prescription"("appointmentId");

-- CreateIndex
CREATE INDEX "Review_appointmentId_idx" ON "Review"("appointmentId");
