export interface User {
  id: number;
  email: string;
  roles: string[];
  info?: Applicant;
}

export interface Applicant {
  id: number;
  first_name: string;
  last_name: string;
  orther_names?: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  lga?: Lga | string;
  address?: string;
  passport_url?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  applications?: Application[];
  payments?: Payment[];
}

export interface Application {
  id: number;
  applicant: Applicant | string;
  program: Program | string;
  status: string;
  created_at: string;
  updated_at: string;
  oLevelResults?: OLevelResult[];
  applicationDocuments?: ApplicationDocument[];
}

export interface Lga {
  id: number;
  name: string;
  state?: State | string;
}

export interface State {
  id: number;
  name: string;
  lgas?: Lga[];
}

export interface Program {
  id: number;
  program_name: string;
  duration: number;
  description?: string;
}

export interface Payment {
  id: number;
  applicant: Applicant | string;
  amount: string;
  transaction_reference: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: number;
  application: Application | string;
  document_type?: DocumentType | string;
  document?: DocumentType | string; // API uses 'document' field
  document_url: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: number;
  name: string;
  required: boolean;
}

export interface OLevelResult {
  id: number;
  application: Application | string;
  exam_type?: string;
  exam_year?: string;
  exam_number?: string;
  center_name?: string;
  center_number?: string;
  oLevelSubjects?: OLevelSubject[];
  // Legacy support
  oLevelSubject?: OLevelSubject | string;
  grade?: string;
}

export interface OLevelSubject {
  id: number;
  subject_name?: string;
  grade: string;
  // Legacy support
  name?: string;
  subject?: Subject | string;
}

export interface Subject {
  id: number;
  name: string;
}

