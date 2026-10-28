# Database Schema Design

The relational database is PostgreSQL 15, managed via SQLAlchemy 2.0 declarative models and Alembic migrations.

## Entity-Relationship Schema

```
 [users] 1 ────< N [patients] 1 ────< N [laboratory_reports]
                                               │ 1
                                               ├────< N [extraction_results]
                                               ├────< N [baseline_results]
                                               ├────< N [consistency_results]
                                               ├────< N [risk_results]
                                               └────── 1 [health_summaries]

 [biomarkers] 1 ────< N [reference_ranges]
      │
      └────< N [extraction_results]
```

## Tables & Primary Keys

1. `users` (id: UUID PK, email, password_hash, full_name, role, is_active, created_at, updated_at)
2. `patients` (id: UUID PK, user_id: FK, patient_code: Unique, date_of_birth, sex, created_at, updated_at)
3. `biomarkers` (id: UUID PK, canonical_name: Unique, display_name, panel, default_unit, description)
4. `reference_ranges` (id: UUID PK, biomarker_id: FK, sex, age_min, age_max, ref_low, ref_high, unit, source)
5. `laboratory_reports` (id: UUID PK, patient_id: FK, filename, original_filename, file_path, file_type, file_size_bytes, report_date, lab_name, processing_status, extraction_method, error_message, created_at, updated_at)
6. `extraction_results` (id: UUID PK, report_id: FK, biomarker_id: FK nullable, biomarker_name_raw, biomarker_name_canonical, numeric_value, unit, ref_low_extracted, ref_high_extracted, abnormal_flag, confidence_score, is_corrected, corrected_by, corrected_value, corrected_unit, source_location, extraction_status)
7. `baseline_results` (id: UUID PK, report_id: FK, biomarker_name, historical_mean, historical_std, z_score, sample_count, deviation_status, data_source, trend_direction, current_value, current_unit)
8. `consistency_results` (id: UUID PK, report_id: FK, rule_id, biomarker_a_name, biomarker_b_name, observed_a, observed_b, expected_relationship, is_consistent, explanation, status, consistency_score, reliability_score)
9. `risk_results` (id: UUID PK, report_id: FK, risk_category_id, risk_category_name, normalized_score, severity_weight, severity_weighted_score, is_flagged, contributing_factors_json, explanation, overall_hri)
10. `health_summaries` (id: UUID PK, report_id: FK Unique, overall_risk_index, risk_tier, summary_sections_json, patient_friendly_text, key_findings_json, recommendations_json, disclaimer, generated_by)
11. `audit_logs` (id: UUID PK, user_id: UUID nullable, action, resource_type, resource_id, details_json, ip_address, status, created_at)
