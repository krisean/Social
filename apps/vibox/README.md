# VIBox - Digital Jukebox

## ⚠️ **DEPRECATED - Moved to Event Platform**

VIBox has been integrated directly into the **event-platform** as a modal component. This standalone app is no longer maintained.

## 🎵 **New Location**

The VIBox jukebox functionality is now available in:
- **Location**: `apps/event-platform/src/features/host/components/VIBoxJukebox.tsx`
- **Access**: Click the "🎵 VIBox" button in the event-platform host console
- **Benefits**: Integrated with existing auth, sessions, and UI

## 📁 **Audio Files**

Audio files should now be placed in:
```
apps/event-platform/public/vibox/
```

See the new README in that directory for setup instructions.

## 🚀 **Why This Change?**

- **Better Integration**: Seamless access from event management interface
- **Shared Authentication**: Uses existing event-platform auth system
- **Consistent UI**: Matches the platform's design system
- **Simpler Deployment**: No separate app to deploy and manage
- **Better Performance**: Shared codebase and resources

## 📋 **Migration Guide**

1. **Audio Files**: Move MP3s from `apps/vibox/public/` to `apps/event-platform/public/vibox/`
2. **Setup**: Run the setup script in the new location
3. **Access**: Use the VIBox button in the event-platform host console

## 🔮 **Future Development**

All VIBox development will continue in the event-platform location. This standalone app will be removed in a future release.

---

**For the latest VIBox functionality, please use the event-platform version.**
