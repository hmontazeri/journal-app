# Optional Cloud Sync - How It Works

The Journal app now makes cloud sync completely optional. Here's everything you need to know.

## Default Mode: Local Only

When you first launch the app, you'll see:

```
┌─────────────────────────────────────────┐
│  Cloud Sync (Optional)                   │
│                                          │
│  [ Continue with Cloud Sync ]            │
│  [ Skip (Local Only) ]                   │
└─────────────────────────────────────────┘
```

**Clicking "Skip (Local Only)"**:
- ✅ No setup required
- ✅ Start journaling immediately
- ✅ 100% private - data never leaves your device
- ✅ Maximum security - no network requests
- ✅ Can enable cloud sync later if needed

## Use Cases

### Local Only Mode is Perfect For:

1. **Maximum Privacy**
   - Sensitive personal thoughts
   - Therapy/mental health journaling
   - Don't want any data in the cloud

2. **Single Device Users**
   - Only use one computer
   - Don't need multi-device sync
   - Prefer simplicity

3. **No Setup Desired**
   - Want to start immediately
   - Don't want to deal with backend deployment
   - Just want to journal

### Cloud Sync Mode is Perfect For:

1. **Multi-Device Users**
   - Have a work laptop and personal desktop
   - Want to journal on both Mac and Windows
   - Travel between devices

2. **Backup & Redundancy**
   - Want entries backed up in cloud
   - Fear of device loss/failure
   - Peace of mind

3. **Family/Team Sharing**
   - Share a journal with spouse
   - Team retrospective journal
   - Collaborative use case

## How to Enable Cloud Sync Later

If you start in local-only mode, you can enable cloud sync at any time:

1. Click the **⚙️ Settings icon** in the sidebar
2. Enter your **Backend URL** and **API Key**
3. Click **"Enable Cloud Sync"**
4. Your local entries will sync to the cloud on next save

## How to Disable Cloud Sync

If you want to go back to local-only:

1. Click the **⚙️ Settings icon**
2. Click **"Disable Cloud Sync"**
3. Confirm
4. Your entries remain local, cloud sync stops

**Note**: This doesn't delete your cloud data. To delete cloud data, use the **👤 User Info** dialog → "Delete Server Data".

## Technical Details

### Local Only Mode

**Data Storage**:
- `localStorage` for vault configuration
- `localStorage` for encrypted journal entries
- All data stays on your device

**Security**:
- Still encrypted with AES-256-GCM
- Password never leaves your device
- Encryption key in macOS Keychain (or equivalent)

**Limitations**:
- No multi-device sync
- No cloud backup
- Data lives only on one device

### Cloud Sync Mode

**Data Flow**:
1. Write entry → Encrypt locally → Sync to your backend
2. Other device → Fetch from backend → Decrypt locally

**Storage**:
- Local: Same as local-only mode
- Cloud: Encrypted blob in your R2 bucket

**Security**:
- Everything encrypted before leaving device
- Your backend, your API key, your control
- End-to-end encryption maintained

## Migration Between Modes

### Local → Cloud

1. Enable cloud sync in Settings
2. Next time you save an entry, it syncs
3. All local entries upload to cloud
4. Other devices can now connect

### Cloud → Local

1. Disable cloud sync in Settings
2. Local data remains intact
3. No more network requests
4. Entries stay on this device only

## Privacy Considerations

### Local Only (Maximum Privacy):
- ✅ No network requests ever
- ✅ No server logs
- ✅ No IP addresses recorded
- ✅ Complete anonymity
- ✅ No attack surface

### Cloud Sync (Still Very Private):
- ✅ End-to-end encryption
- ✅ Server only sees encrypted blobs
- ✅ Can't read your entries without password
- ⚠️ Server logs might record IP addresses
- ⚠️ Metadata visible (timestamps, vault ID)

## Comparison Table

| Feature | Local Only | Cloud Sync |
|---------|-----------|------------|
| **Setup Required** | None | Deploy backend |
| **Start Time** | Immediate | ~10 minutes |
| **Privacy** | Maximum | Very High |
| **Multi-Device** | ❌ No | ✅ Yes |
| **Backup** | Manual | Automatic |
| **Network Needed** | ❌ No | ✅ Yes |
| **Cost** | Free | Free (Cloudflare) |
| **Your Data** | Your device | Your backend |

## Recommendations

### Use Local Only If:
- You value maximum privacy above all else
- You only use one device
- You don't want any setup
- You're okay with manual backups
- You trust your device's reliability

### Use Cloud Sync If:
- You use multiple devices
- You want automatic backups
- You're comfortable deploying a backend
- You want peace of mind
- You understand encryption protects you

## FAQ

**Q: Is local-only mode less secure?**  
A: No! It's actually *more* secure because data never leaves your device. The encryption is the same.

**Q: Can I switch modes anytime?**  
A: Yes! Enable or disable cloud sync in Settings whenever you want.

**Q: What happens to my entries if I switch?**  
A: Nothing! They stay intact. Switching only affects future syncing behavior.

**Q: If I enable cloud sync, do old entries upload?**  
A: Yes! The next time you save, all local entries sync to the cloud.

**Q: Can I use different backends on different devices?**  
A: Technically yes, but they won't sync together. Same backend = shared journal.

**Q: Is cloud sync less private than local-only?**  
A: Slightly. Your backend sees encrypted data and metadata, but can't read entries. Local-only has zero network activity.

**Q: Can I backup local-only entries?**  
A: Export your vault data manually, or enable cloud sync temporarily to backup.

## Best Practice

**For 95% of users, we recommend**:
1. Start with **Local Only**
2. Use it for a week
3. If you need multi-device access, enable cloud sync
4. If not, stay local-only forever

This gives you the best experience without overwhelming you with setup on day one.

---

**Remember**: The beauty of this app is that *you* control your data. Whether it's 100% local or synced to your own backend, you're always in control. 🔐
