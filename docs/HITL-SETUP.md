# Human-in-the-Loop (HITL) Setup Guide

## Overview

Tender Intelligence implements GH-600 exam concepts for secure AI agent operation:

1. **Environment Protection Rules** — Force human approval before any external action
2. **Least Privilege Access** — Minimal permissions for each job
3. **Audit Logging** — Complete traceability of all actions
4. **Separation of Concerns** — Draft vs. Send is strictly separated

## Required GitHub Configuration

### Step 1: Create Protected Environments

Go to **Settings → Environments → New Environment**

#### Environment 1: `tender-response-approval`
- **Required reviewers:** 1 (add yourself or authorized personnel)
- **Wait timer:** 0 minutes
- **Deployment branches:** `main` only

#### Environment 2: `email-approval-required`
- **Required reviewers:** 1
- **Wait timer:** 0 minutes
- **Deployment branches:** `main` only

### Step 2: Verify Workflow Permissions

The workflow uses minimal permissions:
```yaml
permissions:
  contents: write      # Only for creating branches
  pull-requests: write # Only for creating PRs
  issues: read/write   # For commenting
```

### Step 3: Test the Workflow

#### Test 1: Tender Analysis (No approval needed)
```bash
# Create an issue with label "tender-analysis"
gh issue create --title "Analyze Tender CN123456" \
  --body "Tender ID: CN123456
Agency: NSW Department of Customer Service" \
  --label "tender-analysis"
```

#### Test 2: Draft Response (Requires approval)
```bash
# Trigger via workflow_dispatch
gh workflow run "🤖 Tender Response Drafter (HITL)" \
  --field tender_id=CN123456 \
  --field agency="NSW Department" \
  --field tender_title="Cybersecurity Services" \
  --field action=draft_response
```

Or create an issue with label `draft-response`.

## How HITL Works

```
┌─────────────────┐
│  User Triggers  │  (Creates issue or runs workflow)
│    Workflow     │
└────────┬────────┘
         ▼
┌─────────────────┐
│  AI Agent Runs  │  (Analyzes tender, drafts response)
│  (No approval   │
│   needed)       │
└────────┬────────┘
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Create PR with │────▶│  WAITING FOR    │
│  Draft Response │     │  HUMAN APPROVAL │
└─────────────────┘     └─────────────────┘
                                 │
                    ┌────────────┘
                    ▼
           ┌─────────────────┐
           │ Human Reviews & │
           │ Approves in GitHub
           └────────┬────────┘
                    ▼
           ┌─────────────────┐
           │  Merge PR       │
           │  (External      │
           │   action still  │
           │   manual)       │
           └─────────────────┘
```

## Security Features

### 1. Environment Protection
- Jobs with `environment:` key pause until manual approval
- Approval is per-job, per-run
- Cannot be bypassed by the agent

### 2. Audit Trail
Every workflow run logs:
- Who triggered it
- What actions were taken
- Which HITL gates were passed
- Timestamps for compliance

### 3. No Direct External Actions
- The agent **cannot** send emails
- The agent **cannot** submit tenders
- The agent **can only** draft content for human review

## Troubleshooting

### "Environment not found" error
Create the environments in GitHub Settings first (see Step 1).

### Approval not requested
Check that the job has:
```yaml
environment:
  name: tender-response-approval
```

### Workflow doesn't trigger
Check the `if:` conditions match your trigger (issue label or workflow_dispatch).

## Compliance Notes

This implementation satisfies GH-600 requirements:
- ✅ Branch protection rules
- ✅ MCP logging (stderr only)
- ✅ GitHub Environments for HITL
- ✅ Infinite loop prevention (no self-triggering)
- ✅ Secrets management (no hardcoded keys)
