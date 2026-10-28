"""Initial schema migration for HealthRisk AI.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='user'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Patients
    op.create_table(
        'patients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('patient_code', sa.String(64), nullable=False, unique=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('sex', sa.String(10), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_patients_patient_code', 'patients', ['patient_code'])

    # Biomarkers
    op.create_table(
        'biomarkers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('canonical_name', sa.String(128), nullable=False, unique=True),
        sa.Column('display_name', sa.String(128), nullable=False),
        sa.Column('panel', sa.String(64), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('default_unit', sa.String(32), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_biomarkers_canonical_name', 'biomarkers', ['canonical_name'])

    # Reference Ranges
    op.create_table(
        'reference_ranges',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('biomarker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('biomarkers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sex', sa.String(10), nullable=True),
        sa.Column('age_min', sa.Integer(), nullable=True),
        sa.Column('age_max', sa.Integer(), nullable=True),
        sa.Column('ref_low', sa.Float(), nullable=True),
        sa.Column('ref_high', sa.Float(), nullable=True),
        sa.Column('unit', sa.String(32), nullable=False),
        sa.Column('source', sa.String(128), nullable=False, server_default='Standard Reference'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # Laboratory Reports
    op.create_table(
        'laboratory_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(512), nullable=False),
        sa.Column('file_type', sa.String(16), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('report_date', sa.Date(), nullable=True),
        sa.Column('lab_name', sa.String(255), nullable=True),
        sa.Column('processing_status', sa.String(50), nullable=False, server_default='PENDING'),
        sa.Column('extraction_method', sa.String(50), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_lab_reports_patient_id', 'laboratory_reports', ['patient_id'])

    # Extraction Results
    op.create_table(
        'extraction_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('laboratory_reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('biomarker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('biomarkers.id', ondelete='SET NULL'), nullable=True),
        sa.Column('biomarker_name_raw', sa.String(128), nullable=False),
        sa.Column('biomarker_name_canonical', sa.String(128), nullable=True),
        sa.Column('numeric_value', sa.Float(), nullable=True),
        sa.Column('unit', sa.String(32), nullable=True),
        sa.Column('ref_low_extracted', sa.Float(), nullable=True),
        sa.Column('ref_high_extracted', sa.Float(), nullable=True),
        sa.Column('abnormal_flag', sa.Boolean(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('is_corrected', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('corrected_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('corrected_value', sa.Float(), nullable=True),
        sa.Column('corrected_unit', sa.String(32), nullable=True),
        sa.Column('source_location', sa.String(128), nullable=True),
        sa.Column('extraction_status', sa.String(32), nullable=False, server_default='EXTRACTED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_extraction_results_report_id', 'extraction_results', ['report_id'])

    # Baseline Results
    op.create_table(
        'baseline_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('laboratory_reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('biomarker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('biomarkers.id', ondelete='SET NULL'), nullable=True),
        sa.Column('biomarker_name', sa.String(128), nullable=False),
        sa.Column('historical_mean', sa.Float(), nullable=True),
        sa.Column('historical_std', sa.Float(), nullable=True),
        sa.Column('z_score', sa.Float(), nullable=True),
        sa.Column('sample_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('deviation_status', sa.String(100), nullable=False),
        sa.Column('data_source', sa.String(50), nullable=False, server_default='PERSONAL_BASELINE'),
        sa.Column('trend_direction', sa.String(32), nullable=True),
        sa.Column('current_value', sa.Float(), nullable=True),
        sa.Column('current_unit', sa.String(32), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_baseline_results_report_id', 'baseline_results', ['report_id'])

    # Consistency Results
    op.create_table(
        'consistency_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('laboratory_reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rule_id', sa.String(100), nullable=False),
        sa.Column('biomarker_a_name', sa.String(128), nullable=False),
        sa.Column('biomarker_b_name', sa.String(128), nullable=False),
        sa.Column('observed_a', sa.Float(), nullable=True),
        sa.Column('observed_b', sa.Float(), nullable=True),
        sa.Column('expected_relationship', sa.String(128), nullable=False),
        sa.Column('is_consistent', sa.Boolean(), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='PENDING'),
        sa.Column('consistency_score', sa.Float(), nullable=True),
        sa.Column('reliability_score', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_consistency_results_report_id', 'consistency_results', ['report_id'])

    # Risk Results
    op.create_table(
        'risk_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('laboratory_reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('risk_category_id', sa.String(100), nullable=False),
        sa.Column('risk_category_name', sa.String(128), nullable=False),
        sa.Column('normalized_score', sa.Float(), nullable=False),
        sa.Column('severity_weight', sa.Float(), nullable=False),
        sa.Column('severity_weighted_score', sa.Float(), nullable=False),
        sa.Column('is_flagged', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('contributing_factors_json', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('overall_hri', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_risk_results_report_id', 'risk_results', ['report_id'])

    # Health Summaries
    op.create_table(
        'health_summaries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('laboratory_reports.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('overall_risk_index', sa.Float(), nullable=True),
        sa.Column('risk_tier', sa.String(50), nullable=True),
        sa.Column('summary_sections_json', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('patient_friendly_text', sa.Text(), nullable=False),
        sa.Column('key_findings_json', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('recommendations_json', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('disclaimer', sa.Text(), nullable=False),
        sa.Column('generated_by', sa.String(50), nullable=False, server_default='DETERMINISTIC_TEMPLATE'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('details_json', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='SUCCESS'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('health_summaries')
    op.drop_table('risk_results')
    op.drop_table('consistency_results')
    op.drop_table('baseline_results')
    op.drop_table('extraction_results')
    op.drop_table('laboratory_reports')
    op.drop_table('reference_ranges')
    op.drop_table('biomarkers')
    op.drop_table('patients')
    op.drop_table('users')
