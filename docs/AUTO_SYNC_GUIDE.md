# CourseConnect Auto-Sync Development Workflow

## 🚀 Seamless PC ↔ MacBook Development

This setup ensures that every change you make is automatically synced to GitHub, so you can seamlessly switch between your PC and MacBook without losing any work.

## 📋 Quick Commands

### Windows (PC):
```bash
# Make changes, then commit with auto-sync:
commit.bat "Your commit message"

# Or deploy with auto-sync:
deploy-latest.bat

# Manual sync if needed:
auto-sync.bat
```

### Mac/Linux (MacBook):
```bash
# Make changes, then commit with auto-sync:
./commit.sh "Your commit message"

# Or deploy with auto-sync:
./deploy-latest.sh

# Manual sync if needed:
./auto-sync.sh
```

## 🔄 How It Works

1. **Automatic Sync**: Every commit automatically pushes to both `main` and `master` branches
2. **Deployment Sync**: Deploy scripts include auto-sync to GitHub
3. **Branch Safety**: Both branches stay synchronized for compatibility

## 📱 Switching Between Devices

### From PC to MacBook:
1. On MacBook: `git pull origin main`
2. Continue development normally
3. Use `./commit.sh "message"` for commits

### From MacBook to PC:
1. On PC: `git pull origin main`
2. Continue development normally
3. Use `commit.bat "message"` for commits

## 🛠️ Setup Verification

Test the auto-sync by making a small change:

```bash
# Windows:
commit.bat "Test auto-sync functionality"

# Mac/Linux:
./commit.sh "Test auto-sync functionality"
```

You should see:
- ✅ Commit successful!
- 🔄 Auto-syncing to GitHub...
- ✅ Successfully pushed to origin/main
- ✅ Successfully synced to master branch
- 🎉 Auto-sync complete!

## 🚨 Troubleshooting

If auto-sync fails:
1. Check internet connection
2. Run manual sync: `git push origin main && git push origin main:master`
3. Verify GitHub credentials

## 📊 Benefits

- ✅ **Zero Lost Work**: Every change is immediately backed up
- ✅ **Seamless Switching**: Move between devices without manual sync
- ✅ **Branch Safety**: Both main and master stay synchronized
- ✅ **Deployment Ready**: Auto-sync included in deployment scripts
- ✅ **MacBook Ready**: Perfect for cross-platform development

## 🎯 Best Practices

1. **Always use the commit scripts** instead of `git commit` directly
2. **Test auto-sync** after setup to ensure it works
3. **Pull before starting work** on any device: `git pull origin main`
4. **Use descriptive commit messages** for better tracking

---

**Happy coding! 🚀 Your changes will always be synced and ready for your MacBook.**
