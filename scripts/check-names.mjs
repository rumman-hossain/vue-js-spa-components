#!/usr/bin/env node
/**
 * Fails when the name of the admin template this project replaced appears in any tracked or
 * untracked (non-ignored) file or in the commit history of the current branch.
 *
 * The banned names are stored base64-encoded so this file never matches itself.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const encoded = ['YWRtaW5bXHNfLV0/b25l', 'anVzdGJvaWw=']
const patterns = encoded.map((value) => new RegExp(Buffer.from(value, 'base64').toString(), 'i'))

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' })

const files = git('ls-files', '--cached', '--others', '--exclude-standard')
  .split('\n')
  .filter(Boolean)
  .filter((file) => file !== 'pnpm-lock.yaml')

const problems = []

for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue // deleted in the working tree
  }
  text.split('\n').forEach((line, index) => {
    if (patterns.some((pattern) => pattern.test(line))) problems.push(`${file}:${index + 1}`)
  })
}

let history = ''
try {
  history = git('log', '--format=%an%n%ae%n%B')
} catch {
  // No commits yet.
}
if (patterns.some((pattern) => pattern.test(history)))
  problems.push('git history (author or message)')

if (problems.length > 0) {
  console.error(`Banned name found in:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.warn(`check:names passed (${files.length} files and history scanned)`)
