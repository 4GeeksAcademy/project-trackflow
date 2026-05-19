import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { isValidEmail, isValidNumber } from '../../lib/validations';
import { trimFields } from '../../lib/utils';
import type { Candidate, RecordCreate } from '../../types/candidate';

export default function CandidateEditForm({
  candidate,
  onSubmit,
  loading,
}: {
  candidate: Candidate;
  onSubmit: (values: RecordCreate) => Promise<void>;
  loading: boolean;
}) {
  const [values, setValues] = useState<RecordCreate & { experience_years: number | '' }>({
    full_name: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone,
    position: candidate.position,
    experience_years: candidate.experience_years,
    linkedin_url: candidate.linkedin_url,
    cv_url: candidate.cv_url,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: name === 'experience_years' ? value.replace(/[^\d]/g, '') : value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const trimmed = trimFields(values as unknown as Record<string, unknown>);
    if (!trimmed.full_name || !trimmed.email || !trimmed.phone || !trimmed.position || !isValidNumber(trimmed.experience_years)) {
      setError('All required fields must be filled and valid.');
      return;
    }
    if (!isValidEmail(trimmed.email as string)) {
      setError('Invalid email format.');
      return;
    }
    try {
      await onSubmit({
        full_name: trimmed.full_name as string,
        email: trimmed.email as string,
        phone: trimmed.phone as string,
        position: trimmed.position as string,
        linkedin_url: trimmed.linkedin_url ? (trimmed.linkedin_url as string) : null,
        cv_url: trimmed.cv_url ? (trimmed.cv_url as string) : null,
        experience_years: Number(trimmed.experience_years),
      });
      setSuccess(true);
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to update');
      else setError('Failed to update');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <Input name="full_name" placeholder="Full Name" value={values.full_name} onChange={handleChange} required disabled={loading} />
      <Input name="email" placeholder="Email" value={values.email} onChange={handleChange} required disabled={loading} />
      <Input name="phone" placeholder="Phone" value={values.phone} onChange={handleChange} required disabled={loading} />
      <Input name="position" placeholder="Position" value={values.position} onChange={handleChange} required disabled={loading} />
      <Input name="experience_years" placeholder="Years of Experience" value={values.experience_years} onChange={handleChange} required disabled={loading} inputMode="numeric" />
      <Input name="linkedin_url" placeholder="LinkedIn URL (optional)" value={values.linkedin_url ?? ''} onChange={handleChange} disabled={loading} />
      <Input name="cv_url" placeholder="CV URL (optional)" value={values.cv_url ?? ''} onChange={handleChange} disabled={loading} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">Candidate updated successfully.</div>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
    </form>
  );
}
