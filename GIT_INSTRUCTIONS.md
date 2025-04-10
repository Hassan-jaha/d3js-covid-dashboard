# Git Instructions for D3.js Project

## Quick Start Guide (Copy and Paste These Commands)

Open Command Prompt or Terminal and run these commands in sequence:

```bash
# Navigate to your project directory
cd c:\Users\ibrah\OneDrive\Documents\Doc_BIG_DATA\Virtualisation\tp__D3js

# Initialize Git repository
git init

# Add the .gitignore file first
# (Copy the .gitignore file to your project directory before proceeding)

# Add all files to staging
git add .

# Commit your changes
git commit -m "Initial commit"

# Check which branch you're on (likely master instead of main)
git branch

# If you see 'master', use this command to push:
git push -u origin master

# If you want to rename to main before pushing:
git branch -M main
git push -u origin main
```

## Prerequisites
- Git installed on your computer
- A GitHub/GitLab/BitBucket account (or other Git hosting service)

## Note About Data Files
Remember that the `.gitkeep` file in the data directory is there to ensure the directory is tracked by Git. Make sure to place your `covid-data.csv` file in that directory as mentioned.

## Troubleshooting

### Authentication Issues
If you're prompted for authentication:
- For HTTPS URLs: Enter your GitHub/GitLab username and password (or token)
- For SSH URLs: Make sure your SSH key is set up correctly

### "src refspec main does not match any" Error
If you see this error:
```
error: src refspec main does not match any
error: failed to push some refs to 'your-repository'
```

This means you either:
1. Haven't made any commits yet, or
2. Your branch isn't named 'main'

Fix it with these steps:
```bash
# Check if you have any commits
git log

# If no commits are shown, make your first commit:
git add .
git commit -m "Initial commit"

# Check your branch name
git branch

# Push using your actual branch name (likely 'master')
git push -u origin master

# OR rename your branch to main and push
git branch -M main
git push -u origin main
```

### "No Commits Yet" Push Error
If you're getting this error even after renaming your branch:
```
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/EL-lotfi/Covid-19_analysis_By_D3js.git'
```

Follow these exact steps to fix it:

```bash
# 1. Check if you have any commits
git log

# 2. If you see "fatal: your current branch 'main' does not have any commits yet", then:
# Make sure you have files to commit
ls

# 3. Add all files to staging
git add .

# 4. Verify files are staged
git status

# 5. Make your initial commit
git commit -m "Initial commit"

# 6. Try pushing again
git push -u origin main
```

If you still have issues, try:
```bash
# Verify your remote repository is set up correctly
git remote -v

# If needed, remove and re-add the remote
git remote remove origin
git remote add origin https://github.com/EL-lotfi/Covid-19_analysis_By_D3js.git

# Then commit and push again
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Branch Rename Mismatch Error
If you see this error after renaming your branch:
```
error: src refspec master does not match any
error: failed to push some refs to 'https://github.com/EL-lotfi/Covid-19_analysis_By_D3js.git'
```

This happens because you renamed your branch to 'main' but are still trying to push 'master'.
Use this command instead to push your renamed branch:

```bash
# Push the main branch (after renaming)
git push -u origin main
```

### 'main' vs 'master' Branch Issues
If you get an error about the branch name:
```bash
# Check your current branch name
git branch

# If your branch is named 'master', use:
git push -u origin master
```
