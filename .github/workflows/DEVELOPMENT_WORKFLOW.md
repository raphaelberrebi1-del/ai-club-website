# Development Workflow

## Standard Git Workflow

After completing each task or meaningful change:

1. **Stage changes**
   ```bash
   git add <files>
   ```

2. **Commit with descriptive message**
   ```bash
   git commit -m "Brief description of changes

   - Detailed point 1
   - Detailed point 2

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Push to remote**
   ```bash
   git push
   ```

## Commit Message Guidelines

### Format
```
Brief one-line summary (50 chars max)

- Detailed explanation point 1
- Detailed explanation point 2
- What changed and why

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Examples

**Good:**
```
Add success metrics to mobile pages

- Add achievement indicators to mobile.html and mobile-he.html
- Display 87% project launch rate, portfolio readiness, certificates
- Consistent with desktop version styling
```

**Bad:**
```
updates
```

## When to Commit

✅ **DO commit after:**
- Completing a feature or fix
- Making meaningful UI/UX changes
- Fixing bugs
- Updating content or copy
- Refactoring code sections

❌ **DON'T commit:**
- Incomplete work that breaks functionality
- Temporary debugging code
- Commented-out code blocks
- Work-in-progress experiments

## Branch Strategy

**Main Branch:**
- Always deployable
- All changes pushed directly to `main`
- Each commit should be production-ready

**Feature Branches (if needed in future):**
- Create from `main`: `git checkout -b feature/feature-name`
- Work on feature
- Merge back to `main` when complete

## Files to Ignore

Check `.gitignore` includes:
- `node_modules/`
- `.DS_Store`
- `*.log`
- `.env`
- Temporary files
- Build artifacts

## Quick Reference Commands

```bash
# Status check
git status

# View changes
git diff

# Stage all changes
git add .

# Stage specific files
git add path/to/file

# Commit
git commit -m "message"

# Push
git push

# Pull latest
git pull

# View commit history
git log --oneline -10
```

## Deployment

Changes pushed to `main` branch are automatically deployed to:
- **Production:** https://www.aikidz.club
- **Vercel Dashboard:** Check deployment status

## Rollback Procedure

If a commit needs to be reverted:

```bash
# Revert last commit (creates new commit)
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Push the revert
git push
```

## Best Practices

1. **Commit often** - Small, focused commits are better than large ones
2. **Write clear messages** - Future you will thank you
3. **Test before pushing** - Ensure changes work as expected
4. **Keep commits atomic** - One logical change per commit
5. **Push regularly** - Don't let local changes pile up

---

**Last Updated:** 2025-10-03
**Maintained By:** Development Team
