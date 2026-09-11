export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'OFFICER' | 'ADMIN'
          designation: string | null
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          role: 'OFFICER' | 'ADMIN'
          designation?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'OFFICER' | 'ADMIN'
          designation?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenders: {
        Row: {
          id: string
          tender_number: string
          title: string
          department: string
          description: string | null
          issue_date: string
          closing_date: string
          minimum_turnover: number
          minimum_experience_years: number
          required_gst_status: string
          required_blacklist_status: string
          required_msme_status: string
          status: 'ACTIVE' | 'CLOSED' | 'UNDER_EVALUATION' | 'COMPLETED' | 'CANCELLED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tender_number: string
          title: string
          department: string
          description?: string | null
          issue_date: string
          closing_date: string
          minimum_turnover?: number
          minimum_experience_years?: number
          required_gst_status?: string
          required_blacklist_status?: string
          required_msme_status?: string
          status?: 'ACTIVE' | 'CLOSED' | 'UNDER_EVALUATION' | 'COMPLETED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tender_number?: string
          title?: string
          department?: string
          description?: string | null
          issue_date?: string
          closing_date?: string
          minimum_turnover?: number
          minimum_experience_years?: number
          required_gst_status?: string
          required_blacklist_status?: string
          required_msme_status?: string
          status?: 'ACTIVE' | 'CLOSED' | 'UNDER_EVALUATION' | 'COMPLETED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
      }
      bidders: {
        Row: {
          id: string
          tender_id: string
          bidder_code: string
          company_name: string
          email: string
          gstin: string
          pan: string
          udyam_number: string | null
          status: 'ELIGIBLE' | 'MISMATCH' | 'DEBARRED' | 'REVIEW_REQUIRED' | 'DISQUALIFIED' | 'PENDING'
          compliance_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
          evaluation_gate: 'FULL_PASS' | 'REVIEW_REQUIRED' | 'FATAL_NON_COMPLIANCE'
          mandatory_breaches: number
          clarification_flags: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tender_id: string
          bidder_code: string
          company_name: string
          email: string
          gstin: string
          pan: string
          udyam_number?: string | null
          status?: 'ELIGIBLE' | 'MISMATCH' | 'DEBARRED' | 'REVIEW_REQUIRED' | 'DISQUALIFIED' | 'PENDING'
          compliance_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH'
          evaluation_gate?: 'FULL_PASS' | 'REVIEW_REQUIRED' | 'FATAL_NON_COMPLIANCE'
          mandatory_breaches?: number
          clarification_flags?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tender_id?: string
          bidder_code?: string
          company_name?: string
          email?: string
          gstin?: string
          pan?: string
          udyam_number?: string | null
          status?: 'ELIGIBLE' | 'MISMATCH' | 'DEBARRED' | 'REVIEW_REQUIRED' | 'DISQUALIFIED' | 'PENDING'
          compliance_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH'
          evaluation_gate?: 'FULL_PASS' | 'REVIEW_REQUIRED' | 'FATAL_NON_COMPLIANCE'
          mandatory_breaches?: number
          clarification_flags?: number
          created_at?: string
          updated_at?: string
        }
      }
      tender_clauses: {
        Row: {
          id: string
          tender_id: string
          clause_code: string
          title: string
          description: string
          category: 'FINANCIAL' | 'EXPERIENCE' | 'STATUTORY' | 'OEM' | 'TECHNICAL'
          mandatory: boolean
          threshold: string
          weight: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tender_id: string
          clause_code: string
          title: string
          description: string
          category: 'FINANCIAL' | 'EXPERIENCE' | 'STATUTORY' | 'OEM' | 'TECHNICAL'
          mandatory?: boolean
          threshold: string
          weight?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tender_id?: string
          clause_code?: string
          title?: string
          description?: string
          category?: 'FINANCIAL' | 'EXPERIENCE' | 'STATUTORY' | 'OEM' | 'TECHNICAL'
          mandatory?: boolean
          threshold?: string
          weight?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tender_required_documents: {
        Row: {
          id: string
          tender_id: string
          document_type: string
          display_name: string
          storage_path: string | null
          file_size: number | null
          is_mandatory: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tender_id: string
          document_type: string
          display_name: string
          storage_path?: string | null
          file_size?: number | null
          is_mandatory?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tender_id?: string
          document_type?: string
          display_name?: string
          storage_path?: string | null
          file_size?: number | null
          is_mandatory?: boolean
          created_at?: string
        }
      }
      bidder_documents: {
        Row: {
          id: string
          bidder_id: string
          document_name: string
          document_type: 'GST_CERT' | 'FINANCIAL_AUDIT' | 'OEM_AUTH' | 'WORK_ORDER_EXPERIENCE' | 'AFFIDAVIT_BLACKLIST' | 'UDYAM_CERT'
          storage_path: string
          file_size: number
          mime_type: string
          sha256_hash: string | null
          uploaded_at: string
          verification_status: string
        }
        Insert: {
          id?: string
          bidder_id: string
          document_name: string
          document_type: 'GST_CERT' | 'FINANCIAL_AUDIT' | 'OEM_AUTH' | 'WORK_ORDER_EXPERIENCE' | 'AFFIDAVIT_BLACKLIST' | 'UDYAM_CERT'
          storage_path: string
          file_size?: number
          mime_type?: string
          sha256_hash?: string | null
          uploaded_at?: string
          verification_status?: string
        }
        Update: {
          id?: string
          bidder_id?: string
          document_name?: string
          document_type?: 'GST_CERT' | 'FINANCIAL_AUDIT' | 'OEM_AUTH' | 'WORK_ORDER_EXPERIENCE' | 'AFFIDAVIT_BLACKLIST' | 'UDYAM_CERT'
          storage_path?: string
          file_size?: number
          mime_type?: string
          sha256_hash?: string | null
          uploaded_at?: string
          verification_status?: string
        }
      }
      document_extractions: {
        Row: {
          id: string
          document_id: string
          extracted_text: string | null
          page_number: number
          field_name: string
          field_value: string
          confidence_score: number
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          extracted_text?: string | null
          page_number?: number
          field_name: string
          field_value: string
          confidence_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          extracted_text?: string | null
          page_number?: number
          field_name?: string
          field_value?: string
          confidence_score?: number
          created_at?: string
        }
      }
      registry_verifications: {
        Row: {
          id: string
          bidder_id: string
          registry_type: 'GST' | 'MSME_UDYAM' | 'CPPP_BLACKLIST'
          registration_number: string
          status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'CLEARED' | 'DEBARRED' | 'PENDING' | 'UNVERIFIED' | 'ERROR'
          score: number
          verified_name: string | null
          verification_reference: string | null
          checked_at: string
          response_data: Json
        }
        Insert: {
          id?: string
          bidder_id: string
          registry_type: 'GST' | 'MSME_UDYAM' | 'CPPP_BLACKLIST'
          registration_number: string
          status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'CLEARED' | 'DEBARRED' | 'PENDING' | 'UNVERIFIED' | 'ERROR'
          score?: number
          verified_name?: string | null
          verification_reference?: string | null
          checked_at?: string
          response_data?: Json
        }
        Update: {
          id?: string
          bidder_id?: string
          registry_type?: 'GST' | 'MSME_UDYAM' | 'CPPP_BLACKLIST'
          registration_number?: string
          status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'CLEARED' | 'DEBARRED' | 'PENDING' | 'UNVERIFIED' | 'ERROR'
          score?: number
          verified_name?: string | null
          verification_reference?: string | null
          checked_at?: string
          response_data?: Json
        }
      }
      compliance_results: {
        Row: {
          id: string
          bidder_id: string
          clause_id: string
          status: 'COMPLIANT' | 'NON_COMPLIANT' | 'MISSING_DOCUMENT' | 'OFFICER_REVIEW' | 'UNVERIFIED' | 'NOT_APPLICABLE'
          threshold_value: string | null
          extracted_value: string | null
          extracted_unit: string | null
          score: number
          remarks: string | null
          evidence_document_id: string | null
          evidence_page: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bidder_id: string
          clause_id: string
          status: 'COMPLIANT' | 'NON_COMPLIANT' | 'MISSING_DOCUMENT' | 'OFFICER_REVIEW' | 'UNVERIFIED' | 'NOT_APPLICABLE'
          threshold_value?: string | null
          extracted_value?: string | null
          extracted_unit?: string | null
          score?: number
          remarks?: string | null
          evidence_document_id?: string | null
          evidence_page?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bidder_id?: string
          clause_id?: string
          status?: 'COMPLIANT' | 'NON_COMPLIANT' | 'MISSING_DOCUMENT' | 'OFFICER_REVIEW' | 'UNVERIFIED' | 'NOT_APPLICABLE'
          threshold_value?: string | null
          extracted_value?: string | null
          extracted_unit?: string | null
          score?: number
          remarks?: string | null
          evidence_document_id?: string | null
          evidence_page?: number
          created_at?: string
          updated_at?: string
        }
      }
      entity_comparisons: {
        Row: {
          id: string
          bidder_id: string
          source_document_id: string | null
          source_name: string
          target_document_id: string | null
          target_name: string
          normalized_distance: number
          similarity_percentage: number
          comparison_status: 'MATCH' | 'REVIEW_REQUIRED' | 'MISMATCH'
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bidder_id: string
          source_document_id?: string | null
          source_name: string
          target_document_id?: string | null
          target_name: string
          normalized_distance?: number
          similarity_percentage?: number
          comparison_status: 'MATCH' | 'REVIEW_REQUIRED' | 'MISMATCH'
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bidder_id?: string
          source_document_id?: string | null
          source_name?: string
          target_document_id?: string | null
          target_name?: string
          normalized_distance?: number
          similarity_percentage?: number
          comparison_status?: 'MATCH' | 'REVIEW_REQUIRED' | 'MISMATCH'
          reason?: string | null
          created_at?: string
        }
      }
      adjudications: {
        Row: {
          id: string
          bidder_id: string
          officer_id: string | null
          action: 'APPROVE_QUALIFICATION' | 'REQUEST_CLARIFICATION' | 'REJECT_DISQUALIFY'
          remarks: string
          previous_state: string | null
          new_state: string
          signed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          bidder_id: string
          officer_id?: string | null
          action: 'APPROVE_QUALIFICATION' | 'REQUEST_CLARIFICATION' | 'REJECT_DISQUALIFY'
          remarks: string
          previous_state?: string | null
          new_state: string
          signed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          bidder_id?: string
          officer_id?: string | null
          action?: 'APPROVE_QUALIFICATION' | 'REQUEST_CLARIFICATION' | 'REJECT_DISQUALIFY'
          remarks?: string
          previous_state?: string | null
          new_state?: string
          signed_at?: string
          created_at?: string
        }
      }
      clarifications: {
        Row: {
          id: string
          bidder_id: string
          clause_id: string | null
          reason: string
          status: 'OPEN' | 'RESPONDED' | 'RESOLVED' | 'REJECTED'
          requested_by: string | null
          requested_at: string
          response: string | null
          responded_at: string | null
        }
        Insert: {
          id?: string
          bidder_id: string
          clause_id?: string | null
          reason: string
          status?: 'OPEN' | 'RESPONDED' | 'RESOLVED' | 'REJECTED'
          requested_by?: string | null
          requested_at?: string
          response?: string | null
          responded_at?: string | null
        }
        Update: {
          id?: string
          bidder_id?: string
          clause_id?: string | null
          reason?: string
          status?: 'OPEN' | 'RESPONDED' | 'RESOLVED' | 'REJECTED'
          requested_by?: string | null
          requested_at?: string
          response?: string | null
          responded_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          entity_type: string
          entity_id: string
          action: string
          old_value: Json
          new_value: Json
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          entity_type: string
          entity_id: string
          action: string
          old_value?: Json
          new_value?: Json
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: string
          old_value?: Json
          new_value?: Json
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}
