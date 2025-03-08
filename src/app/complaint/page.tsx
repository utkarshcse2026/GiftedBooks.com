'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { storage, db } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

export default function RaiseComplaint() {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    incidentDate: '',
    incidentTime: '',
    incidentDescription: '',
    harasserDetails: '',
    witnesses: '',
    priorIncidents: false,
    priorIncidentDescription: '',
    preferredAction: '',
    securityLevel: 'private',
    proofFileUrl: '',
    status: 'Complaint Raised',
    complaintNumber: ''
  });
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storeComplaintData = async (complaintData: any) => {
      try {
        const docRef = await addDoc(collection(db, 'complaints'), complaintData);
        setComplaintSubmitted(true);
        alert(`Your complaint has been successfully submitted. Your complaint number is ${complaintData.complaintNumber}.`);
      } catch (error) {
        console.error('Error storing complaint:', error);
        alert('There was an error submitting your complaint. Please try again.');
      }
    };

    const name = searchParams.get('name') || '';
    const phone = searchParams.get('phone') || '';
    const location = searchParams.get('location') || '';
    const incidentDate = searchParams.get('incidentDate') || '';
    const offenderName = searchParams.get('offenderName') || '';
    const offenderContact = searchParams.get('offenderContact') || '';
    const offenderLocation = searchParams.get('offenderLocation') || '';
    const description = searchParams.get('description') || '';
    const report = searchParams.get('report') || '';

    if (name && phone && location && incidentDate) {
      const complaintData = {
        name,
        contact: phone,
        location,
        incidentDate,
        incidentDescription: description,
        harasserDetails: `Name: ${offenderName}, Contact: ${offenderContact}, Location: ${offenderLocation}`,
        priorIncidentDescription: report,
        createdAt: new Date(),
        status: 'Complaint Raised',
        complaintNumber: `C-${Date.now()}`,
      };
      storeComplaintData(complaintData);
    } else {
      setFormData(prevData => ({
        ...prevData,
        name,
        contact: phone,
        location,
        incidentDate,
        incidentDescription: description,
        harasserDetails: `Name: ${offenderName}, Contact: ${offenderContact}, Location: ${offenderLocation}`,
        priorIncidentDescription: report,
      }));
    }
  }, [searchParams]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProofFile(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (complaintSubmitted) {
      alert('Your complaint has already been submitted.');
      return;
    }

    const complaintNumber = `C-${Date.now()}`;

    const complaintData = {
      ...formData,
      createdAt: new Date(),
      status: 'Complaint Raised',
      complaintNumber,
    };

    try {
      let proofFileUrl = '';

      if (proofFile) {
        const fileRef = ref(storage, `complaints/${proofFile.name}`);
        await uploadBytes(fileRef, proofFile);
        proofFileUrl = await getDownloadURL(fileRef);
      }

      complaintData.proofFileUrl = proofFileUrl;

      await addDoc(collection(db, 'complaints'), complaintData);

      alert(`Your complaint has been successfully submitted. Your complaint number is ${complaintNumber}.`);
      router.push('/status');
    } catch (error) {
      console.error('Error during submission:', error);
      alert('There was an error submitting your complaint. Please try again.');
    }
  };

  return (
    <div className="complaint-page mx-auto my-12 p-8 max-w-lg shadow-lg border rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Raise a Complaint</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block font-bold mb-2" htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block font-bold mb-2" htmlFor="contact">Contact Number</label>
          <input
            type="tel"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-bold mb-2" htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Incident Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2" htmlFor="incidentDate">Incident Date</label>
            <input
              type="date"
              id="incidentDate"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-2" htmlFor="incidentTime">Incident Time</label>
            <input
              type="time"
              id="incidentTime"
              name="incidentTime"
              value={formData.incidentTime}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Incident Description */}
        <div>
          <label className="block font-bold mb-2" htmlFor="incidentDescription">Incident Description</label>
          <textarea
            id="incidentDescription"
            name="incidentDescription"
            value={formData.incidentDescription}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            rows={4}
            required
          />
        </div>

        {/* Harasser Details */}
        <div>
          <label className="block font-bold mb-2" htmlFor="harasserDetails">Harasser Details</label>
          <textarea
            id="harasserDetails"
            name="harasserDetails"
            value={formData.harasserDetails}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        {/* Witnesses */}
        <div>
          <label className="block font-bold mb-2" htmlFor="witnesses">Witnesses (if any)</label>
          <input
            type="text"
            id="witnesses"
            name="witnesses"
            value={formData.witnesses}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Prior Incidents */}
        <div>
          <label className="block font-bold mb-2">Have you faced a similar incident before?</label>
          <input
            type="checkbox"
            name="priorIncidents"
            checked={formData.priorIncidents}
            onChange={() => setFormData((prev) => ({ ...prev, priorIncidents: !prev.priorIncidents }))}
          />
          {formData.priorIncidents && (
            <textarea
              placeholder="Describe prior incidents..."
              className="w-full mt-2 border rounded px-3 py-2"
              name="priorIncidentDescription"
              value={formData.priorIncidentDescription}
              onChange={handleInputChange}
              rows={4}
            />
          )}
        </div>

        {/* Upload Proof */}
        <div>
          <label className="block font-bold mb-2" htmlFor="proofFile">Upload Proof (Optional)</label>
          <input
            type="file"
            id="proofFile"
            name="proofFile"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Preferred Action */}
        <div>
          <label className="block font-bold mb-2" htmlFor="preferredAction">Preferred Action</label>
          <select
            id="preferredAction"
            name="preferredAction"
            value={formData.preferredAction}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="" disabled>Select action</option>
            <option value="legal">Legal Action</option>
            <option value="counseling">Counseling</option>
            <option value="protection">Request for Protection</option>
          </select>
        </div>

        {/* Security Level */}
        <div>
          <label className="block font-bold mb-2">Complaint Privacy</label>
          <div className="space-x-4">
            <label>
              <input
                type="radio"
                name="securityLevel"
                value="private"
                checked={formData.securityLevel === 'private'}
                onChange={handleInputChange}
              /> Private
            </label>
            <label>
              <input
                type="radio"
                name="securityLevel"
                value="public"
                checked={formData.securityLevel === 'public'}
                onChange={handleInputChange}
              /> Public
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full mt-4">Submit Complaint</Button>
      </form>
    </div>
  );
}

