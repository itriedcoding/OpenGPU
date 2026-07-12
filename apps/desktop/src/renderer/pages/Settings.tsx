import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [apiUrl, setApiUrl] = useState('https://api.opengpu.io');
  const [apiKey, setApiKey] = useState('');
  const [autoStart, setAutoStart] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const versionResult = await window.electronAPI.app.version();
        setAppVersion(versionResult.version);

        const platformResult = await window.electronAPI.app.platform();
        setPlatform(`${platformResult.platform} ${platformResult.arch}`);

        const urlResult = await window.electronAPI.app.getApiUrl();
        setApiUrl(urlResult.url);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await window.electronAPI.app.setApiUrl(apiUrl);
      await new Promise((r) => setTimeout(r, 500));
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckUpdates = async () => {
    try {
      const result = await window.electronAPI.app.checkForUpdates();
      if (result.updateInfo) {
        alert(`Update available: v${result.updateInfo.version}`);
      } else {
        alert('You are running the latest version');
      }
    } catch (err) {
      alert('Failed to check for updates');
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'api', label: 'API Keys', icon: '🔑' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Configure your OpenGPU desktop app</p>
      </div>

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                ...styles.sectionButton,
                ...(activeSection === section.id ? styles.sectionButtonActive : {}),
              }}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {activeSection === 'general' && (
            <div style={styles.sectionContent}>
              <h2 style={styles.sectionTitle}>General Settings</h2>

              <div style={styles.settingRow}>
                <div style={styles.settingInfo}>
                  <span style={styles.settingLabel}>Auto-start agent on login</span>
                  <span style={styles.settingDesc}>Automatically start GPU sharing when the app launches</span>
                </div>
                <button
                  onClick={() => setAutoStart(!autoStart)}
                  style={{
                    ...styles.toggle,
                    ...(autoStart ? styles.toggleActive : {}),
                  }}
                >
                  <div style={{
                    ...styles.toggleKnob,
                    ...(autoStart ? styles.toggleKnobActive : {}),
                  }} />
                </button>
              </div>

              <div style={styles.settingRow}>
                <div style={styles.settingInfo}>
                  <span style={styles.settingLabel}>Notifications</span>
                  <span style={styles.settingDesc}>Show desktop notifications for events</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  style={{
                    ...styles.toggle,
                    ...(notifications ? styles.toggleActive : {}),
                  }}
                >
                  <div style={{
                    ...styles.toggleKnob,
                    ...(notifications ? styles.toggleKnobActive : {}),
                  }} />
                </button>
              </div>

              <div style={styles.settingRow}>
                <div style={styles.settingInfo}>
                  <span style={styles.settingLabel}>Minimize to system tray</span>
                  <span style={styles.settingDesc}>Keep the app running in the tray when closed</span>
                </div>
                <button
                  onClick={() => setMinimizeToTray(!minimizeToTray)}
                  style={{
                    ...styles.toggle,
                    ...(minimizeToTray ? styles.toggleActive : {}),
                  }}
                >
                  <div style={{
                    ...styles.toggleKnob,
                    ...(minimizeToTray ? styles.toggleKnobActive : {}),
                  }} />
                </button>
              </div>

              <div style={styles.settingRow}>
                <div style={styles.settingInfo}>
                  <span style={styles.settingLabel}>Auto-update</span>
                  <span style={styles.settingDesc}>Automatically check for and install updates</span>
                </div>
                <button
                  onClick={() => setAutoUpdate(!autoUpdate)}
                  style={{
                    ...styles.toggle,
                    ...(autoUpdate ? styles.toggleActive : {}),
                  }}
                >
                  <div style={{
                    ...styles.toggleKnob,
                    ...(autoUpdate ? styles.toggleKnobActive : {}),
                  }} />
                </button>
              </div>

              <div style={styles.settingRow}>
                <div style={styles.settingInfo}>
                  <span style={styles.settingLabel}>Theme</span>
                  <span style={styles.settingDesc}>Choose between dark and light theme</span>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                  style={styles.select}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div style={styles.actions}>
                <button onClick={handleSave} disabled={saving} style={styles.saveButton}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div style={styles.sectionContent}>
              <h2 style={styles.sectionTitle}>Account Settings</h2>
              <div style={styles.infoCard}>
                <p style={styles.infoText}>Manage your account settings and preferences on the OpenGPU website.</p>
                <button
                  onClick={() => window.electronAPI.app.openExternal('https://opengpu.io/settings')}
                  style={styles.linkButton}
                >
                  Open Account Settings →
                </button>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div style={styles.sectionContent}>
              <h2 style={styles.sectionTitle}>API Keys</h2>
              <p style={styles.sectionDesc}>Manage API keys for programmatic access</p>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>API Key</label>
                <div style={styles.inputRow}>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    style={styles.input}
                  />
                  <button
                    onClick={() => window.electronAPI.app.openExternal('https://opengpu.io/settings/api-keys')}
                    style={styles.generateButton}
                  >
                    Generate Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'network' && (
            <div style={styles.sectionContent}>
              <h2 style={styles.sectionTitle}>Network Settings</h2>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>API URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  style={styles.input}
                />
                <span style={styles.inputHint}>Default: https://api.opengpu.io</span>
              </div>

              <div style={styles.actions}>
                <button onClick={handleSave} disabled={saving} style={styles.saveButton}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div style={styles.sectionContent}>
              <h2 style={styles.sectionTitle}>About</h2>

              <div style={styles.aboutCard}>
                <div style={styles.aboutLogo}>⚡</div>
                <h3 style={styles.aboutName}>OpenGPU Desktop</h3>
                <span style={styles.aboutVersion}>Version {appVersion}</span>
                <span style={styles.aboutPlatform}>{platform}</span>
              </div>

              <div style={styles.aboutLinks}>
                <button
                  onClick={handleCheckUpdates}
                  style={styles.aboutLink}
                >
                  Check for Updates
                </button>
                <button
                  onClick={() => window.electronAPI.app.openExternal('https://opengpu.io')}
                  style={styles.aboutLink}
                >
                  Visit Website
                </button>
                <button
                  onClick={() => window.electronAPI.app.openExternal('https://github.com/opengpu/opengpu')}
                  style={styles.aboutLink}
                >
                  GitHub Repository
                </button>
                <button
                  onClick={() => window.electronAPI.app.openExternal('https://docs.opengpu.io')}
                  style={styles.aboutLink}
                >
                  Documentation
                </button>
              </div>

              <p style={styles.copyright}>© 2024 OpenGPU. All rights reserved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#e4e4e7',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#71717a',
    margin: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '20px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sectionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  sectionButtonActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    color: '#e4e4e7',
  },
  content: {
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
    minHeight: '500px',
  },
  sectionContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: 0,
    paddingBottom: '16px',
    borderBottom: '1px solid #27272a',
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#71717a',
    margin: '-8px 0 0 0',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #1a1a24',
  },
  settingInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  settingLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  settingDesc: {
    fontSize: '12px',
    color: '#71717a',
  },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#27272a',
    padding: '2px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    position: 'relative',
  },
  toggleActive: {
    backgroundColor: '#7c3aed',
  },
  toggleKnob: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    transition: 'transform 0.2s ease',
  },
  toggleKnobActive: {
    transform: 'translateX(20px)',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #27272a',
    backgroundColor: '#1a1a24',
    color: '#e4e4e7',
    fontSize: '13px',
    outline: 'none',
    minWidth: '120px',
  },
  actions: {
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveButton: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  infoCard: {
    backgroundColor: '#1a1a24',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoText: {
    fontSize: '14px',
    color: '#a1a1aa',
    margin: 0,
    lineHeight: 1.5,
  },
  linkButton: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #27272a',
    backgroundColor: 'transparent',
    color: '#7c3aed',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#a1a1aa',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #27272a',
    backgroundColor: '#1a1a24',
    color: '#e4e4e7',
    fontSize: '14px',
    outline: 'none',
  },
  inputHint: {
    fontSize: '11px',
    color: '#71717a',
  },
  generateButton: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#1a1a24',
    color: '#a1a1aa',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid #27272a',
  },
  aboutCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '32px',
    backgroundColor: '#1a1a24',
    borderRadius: '12px',
  },
  aboutLogo: {
    fontSize: '36px',
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    borderRadius: '16px',
  },
  aboutName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: 0,
  },
  aboutVersion: {
    fontSize: '14px',
    color: '#a1a1aa',
  },
  aboutPlatform: {
    fontSize: '12px',
    color: '#71717a',
  },
  aboutLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  aboutLink: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #27272a',
    backgroundColor: '#1a1a24',
    color: '#e4e4e7',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  copyright: {
    fontSize: '12px',
    color: '#71717a',
    textAlign: 'center',
    margin: '16px 0 0 0',
  },
};
