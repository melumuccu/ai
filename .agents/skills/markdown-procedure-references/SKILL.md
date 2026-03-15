---
name: markdown-procedure-references
description: Helps write and revise Markdown procedure manuals (手順書), runbooks, and setup guides so ordered steps stay maintenance-free and cross-references stay stable. Use this whenever the user is editing Markdown procedures, numbered instructions, SOPs, or asks how to refer to another step without hard-coding step numbers.
---

# Markdown Procedure References

Use this skill to write Markdown procedures (手順書) with low-maintenance numbering and reliable step-to-step references.

## When to Use This Skill

Use this skill when the user:

- Is writing or revising a Markdown procedure, runbook, SOP, or setup guide
- Wants numbered steps but does not want to renumber them by hand after inserts or reordering
- Needs one step to refer to another step later in the same document
- Wants a reusable template for operational manuals or onboarding docs
- Mentions 手順書, Markdown, ordered lists, step numbers, anchors, internal links, or cross-references

## Core Rules

### 1. Keep ordered-list source numbers fixed at `1.`

Write every item in an ordered list as `1.` in the source Markdown.

Why this works:

- Markdown renderers assign the visible numbers automatically
- Inserting or reordering a step no longer forces manual renumbering
- Diffs stay smaller and easier to review

Example:

```markdown
1. 端末を起動する
1. 設定ファイルを開く
1. サービスを再起動する
```

### 2. Refer to steps by anchor, not by visible number

When a later step needs to point to an earlier one, add an HTML anchor at the start of the referenced step and link to that anchor instead of writing "Step 3" or "手順3".

Use this pattern:

```markdown
1. <span id="step-install-db"></span>データベースをインストールする
1. [データベースのインストール手順](#step-install-db)で設定したパスワードを入力する
```

Why this matters:

- The reference keeps working even if the visible order changes
- Readers can jump directly to the referenced step in many Markdown preview environments
- The text stays readable because the link label describes the action, not a brittle number

### 3. Use stable, descriptive anchor names

Anchor naming rules:

- Start with `step-`
- Use short, descriptive English words
- Join words with hyphens (`kebab-case`)
- Make each anchor unique within the document

Good examples:

- `step-prepare`
- `step-install-db`
- `step-restart-service`

Avoid:

- `step-1`
- `step-before-this`
- `step-temp`

## How to Apply the Rules

When creating or revising a document:

1. Convert every ordered-list item in the procedure to `1.` in the Markdown source.
1. Identify steps that are referenced later or are likely to be referenced after future edits.
1. Insert `<span id="..."></span>` immediately before the text of those steps.
1. Rewrite cross-references so they point to anchors with Markdown links such as `[準備作業](#step-prepare)`.
1. Prefer link labels that describe the action or outcome instead of mentioning a step number.
1. Check that every anchor is unique and every link target exists.

## Authoring Template

Use this pattern as the default template:

```markdown
1. <span id="step-prepare"></span>準備作業を行う
1. 次のステップへ進む
1. [準備作業](#step-prepare)の結果を確認し、完了ボタンを押す
```

## Editing Guidance

If the source document already has explicit numbers such as `1.`, `2.`, `3.`:

- Normalize them all to `1.` in the source
- Keep the user-facing order the same unless they asked for structural changes
- Replace brittle references like "手順2を参照" with descriptive anchored links

If a new step is inserted in the middle:

- Add the new list item as `1.`
- Do not renumber surrounding source lines
- Update only the anchor names or link labels that truly need clarification

## Response Expectations

When you produce or rewrite Markdown:

- Return the finished Markdown directly unless the user asks for commentary
- Preserve the document's original language and tone
- Keep anchors minimal: add them where references exist or are clearly useful
- Do not add extra HTML beyond the small `<span id="..."></span>` anchor pattern

## Quick Checklist

Before you finish, verify:

- Every ordered-list item is written as `1.` in source
- Every referenced step has a unique `step-...` anchor
- Every internal link uses the matching `#step-...` target
- Link text describes the step content instead of the visible number
- The document can tolerate step insertion or reordering without manual renumbering
