"""
CLI entry point for the Psychological Evaluation Report Generation System.

Usage:
  # Generate report from pre-structured JSON:
  python main.py --input path/to/patient.json --output ./reports/

  # Generate from raw text notes (calls ingestion LLM agent):
  python main.py --raw path/to/notes.txt --output ./reports/

  # Run on built-in Emma Richardson mock patient:
  python main.py --demo --output ./reports/
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


async def run_demo(output_dir: Path) -> None:
    from psych_eval_system.models.patient import PatientPII
    from psych_eval_system.models.test_scores import ClinicalInput
    from psych_eval_system.pipeline import PipelineOrchestrator

    mock_path = Path(__file__).parent / "psych_eval_system" / "tests" / "mock_data" / "emma_richardson.json"
    with open(mock_path) as f:
        data = json.load(f)

    patient = PatientPII.model_validate(data["patient"])
    clinical = ClinicalInput.model_validate(data["clinical_input"])

    print(f"Running pipeline for: {patient.full_name}, age {patient.age_years}y {patient.age_months}m")
    print("Tests administered:", clinical.administered_tests())
    print()

    orchestrator = PipelineOrchestrator()
    result = await orchestrator.run_from_structured(patient, clinical, output_dir)

    if result.success:
        print(f"✓ Report generated: {result.docx_path}")
        print(f"  QC passed: {result.qc_passed}")
        if result.report and result.report.qc_result:
            qc = result.report.qc_result
            print(f"  Claims verified: {qc.verified_claims}/{qc.total_claims_checked}")
    else:
        print(f"✗ Pipeline failed: {result.error}")
        for issue in result.validation_issues:
            print(f"  [{issue.severity.upper()}] {issue.field}: {issue.message}")
        sys.exit(1)


async def run_from_json(input_path: Path, output_dir: Path) -> None:
    from psych_eval_system.models.patient import PatientPII
    from psych_eval_system.models.test_scores import ClinicalInput
    from psych_eval_system.pipeline import PipelineOrchestrator

    with open(input_path) as f:
        data = json.load(f)

    patient = PatientPII.model_validate(data["patient"])
    clinical = ClinicalInput.model_validate(data["clinical_input"])

    orchestrator = PipelineOrchestrator()
    result = await orchestrator.run_from_structured(patient, clinical, output_dir)

    if result.success:
        print(f"✓ Report: {result.docx_path}")
    else:
        print(f"✗ Failed: {result.error}")
        sys.exit(1)


async def run_from_raw(raw_path: Path, output_dir: Path) -> None:
    from psych_eval_system.pipeline import PipelineOrchestrator

    with open(raw_path) as f:
        raw_text = f.read()

    orchestrator = PipelineOrchestrator()
    result = await orchestrator.run_from_raw(raw_text, output_dir)

    if result.success:
        print(f"✓ Report: {result.docx_path}")
    else:
        print(f"✗ Failed: {result.error}")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Psych Eval Report Generator")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--demo", action="store_true", help="Run with built-in Emma Richardson mock patient")
    group.add_argument("--input", type=Path, help="Path to structured patient JSON file")
    group.add_argument("--raw", type=Path, help="Path to raw clinician notes text file")
    parser.add_argument("--output", type=Path, default=Path("./reports"), help="Output directory for .docx")
    args = parser.parse_args()

    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        print("Copy .env.example to .env and add your API key.")
        sys.exit(1)

    if args.demo:
        asyncio.run(run_demo(args.output))
    elif args.input:
        asyncio.run(run_from_json(args.input, args.output))
    elif args.raw:
        asyncio.run(run_from_raw(args.raw, args.output))


if __name__ == "__main__":
    main()
