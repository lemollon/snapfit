'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft, Watch, Heart, Moon, Footprints, Activity, Zap,
  Check, X, RefreshCw, ChevronRight, Settings, Plus, Smartphone,
  Wifi, WifiOff, TrendingUp, Clock, Loader2
} from 'lucide-react';
import { useToast } from '@/components/Toast';

// Hero image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=1200&auto=format&fit=crop&q=80';

interface WearableDevice {
  id: string;
  provider: string;
  name: string;
  logo: string;
  color: string;
  isConnected: boolean;
  lastSync?: string;
  deviceName?: string;
  batteryLevel?: number;
  syncSettings: {
    steps: boolean;
    heartRate: boolean;
    sleep: boolean;
    workouts: boolean;
    weight: boolean;
  };
}

interface DailyMetric {
  label: string;
  value: string;
  unit: string;
  icon: any;
  color: string;
  trend?: number;
  source?: string;
}

const AVAILABLE_DEVICES: WearableDevice[] = [
  {
    id: '1',
    provider: 'apple_health',
    name: 'Apple Health',
    logo: '🍎',
    color: 'from-gray-600 to-gray-800',
    isConnected: true,
    lastSync: '2 min ago',
    deviceName: 'Apple Watch Series 9',
    batteryLevel: 72,
    syncSettings: { steps: true, heartRate: true, sleep: true, workouts: true, weight: true },
  },
  {
    id: '2',
    provider: 'google_fit',
    name: 'Google Fit',
    logo: '💚',
    color: 'from-green-500 to-emerald-600',
    isConnected: false,
    syncSettings: { steps: true, heartRate: true, sleep: true, workouts: true, weight: false },
  },
  {
    id: '3',
    provider: 'garmin',
    name: 'Garmin Connect',
    logo: '⌚',
    color: 'from-blue-500 to-cyan-600',
    isConnected: true,
    lastSync: '1 hour ago',
    deviceName: 'Garmin Forerunner 955',
    batteryLevel: 45,
    syncSettings: { steps: true, heartRate: true, sleep: true, workouts: true, weight: false },
  },
  {
    id: '4',
    provider: 'whoop',
    name: 'WHOOP',
    logo: '🔴',
    color: 'from-red-500 to-rose-600',
    isConnected: false,
    syncSettings: { steps: false, heartRate: true, sleep: true, workouts: true, weight: false },
  },
  {
    id: '5',
    provider: 'fitbit',
    name: 'Fitbit',
    logo: '💙',
    color: 'from-cyan-500 to-teal-600',
    isConnected: false,
    syncSettings: { steps: true, heartRate: true, sleep: true, workouts: true, weight: true },
  },
  {
    id: '6',
    provider: 'oura',
    name: 'Oura Ring',
    logo: '💍',
    color: 'from-violet-500 to-purple-600',
    isConnected: false,
    syncSettings: { steps: false, heartRate: true, sleep: true, workouts: false, weight: false },
  },
];

const DAILY_METRICS: DailyMetric[] = [
  { label: 'Steps', value: '8,432', unit: 'steps', icon: Footprints, color: 'from-green-500 to-emerald-600', trend: 12, source: 'Apple Watch' },
  { label: 'Heart Rate', value: '68', unit: 'bpm', icon: Heart, color: 'from-red-500 to-rose-600', trend: -3, source: 'Apple Watch' },
  { label: 'Sleep', value: '7.5', unit: 'hours', icon: Moon, color: 'from-violet-500 to-purple-600', trend: 8, source: 'Apple Watch' },
  { label: 'Active Cal', value: '485', unit: 'kcal', icon: Zap, color: 'from-orange-500 to-amber-600', trend: 15, source: 'Garmin' },
  { label: 'HRV', value: '45', unit: 'ms', icon: Activity, color: 'from-blue-500 to-cyan-600', trend: 5, source: 'Garmin' },
  { label: 'Resting HR', value: '52', unit: 'bpm', icon: Heart, color: 'from-pink-500 to-rose-600', trend: -2, source: 'Garmin' },
];

export default function WearablesPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [devices, setDevices] = useState<WearableDevice[]>(AVAILABLE_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<WearableDevice | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch connected devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/wearables');
        if (response.ok) {
          const data = await response.json();
          if (data.connections && data.connections.length > 0) {
            // Merge API data with available devices
            const updatedDevices = AVAILABLE_DEVICES.map(device => {
              const apiConnection = data.connections.find((c: any) => c.provider === device.provider);
              if (apiConnection) {
                return {
                  ...device,
                  isConnected: true,
                  lastSync: apiConnection.lastSyncedAt ? new Date(apiConnection.lastSyncedAt).toLocaleString() : 'Never',
                  deviceName: apiConnection.deviceName,
                };
              }
              return device;
            });
            setDevices(updatedDevices);
          }
        }
      } catch (error) {
        console.error('Error fetching wearable connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [session]);

  const connectedDevices = devices.filter(d => d.isConnected);

  const handleConnect = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    // In production, this would redirect to the provider's OAuth page
    // For demo purposes, we simulate the connection flow
    if (session?.user) {
      try {
        const response = await fetch('/api/wearables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: device.provider,
            deviceName: device.name,
          }),
        });

        if (response.ok) {
          setDevices(devices.map(d =>
            d.id === deviceId
              ? { ...d, isConnected: true, lastSync: 'Just now' }
              : d
          ));
          toast.success('Device connected', `${device.name} is now syncing your health data.`);
        } else {
          throw new Error('Failed to connect');
        }
      } catch (error) {
        console.error('Error connecting device:', error);
        toast.error('Connection failed', 'Failed to connect device. Please try again.');
      }
    } else {
      // Demo mode - just update local state with feedback
      setDevices(devices.map(d =>
        d.id === deviceId
          ? { ...d, isConnected: true, lastSync: 'Just now' }
          : d
      ));
      toast.info('Demo mode', `${device.name} connected (demo data shown).`);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    // Optimistic update
    setDevices(devices.map(d =>
      d.id === deviceId
        ? { ...d, isConnected: false, lastSync: undefined, deviceName: undefined }
        : d
    ));
    setSelectedDevice(null);
    setShowSettings(false);

    if (session?.user) {
      try {
        await fetch(`/api/wearables?id=${deviceId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error disconnecting device:', error);
        // Could revert here but connection UI is already updated
      }
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // In production, this would trigger a real sync with the wearable provider APIs
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDevices(devices.map(d =>
      d.isConnected ? { ...d, lastSync: 'Just now' } : d
    ));
    setIsSyncing(false);
  };

  const toggleSyncSetting = (deviceId: string, setting: keyof WearableDevice['syncSettings']) => {
    setDevices(devices.map(d =>
      d.id === deviceId
        ? { ...d, syncSettings: { ...d.syncSettings, [setting]: !d.syncSettings[setting] } }
        : d
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900" />
        </div>

        {/* Header Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <button
            onClick={handleSync}
            disabled={isSyncing || connectedDevices.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-medium text-white flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <Watch className="w-6 h-6 text-violet-400" />
            <span className="text-violet-400 font-semibold">Connected</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Wearables</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Connection Status */}
        <div className={`rounded-3xl p-4 flex items-center gap-3 ${
          connectedDevices.length > 0
            ? 'bg-green-500/20 border border-green-500/30'
            : 'bg-white/5 border border-white/10'
        }`}>
          {connectedDevices.length > 0 ? (
            <>
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Wifi className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{connectedDevices.length} device{connectedDevices.length > 1 ? 's' : ''} connected</p>
                <p className="text-white/60 text-sm">
                  Last sync: {connectedDevices[0]?.lastSync || 'Never'}
                </p>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <RefreshCw className={`w-5 h-5 text-white/60 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </>
          ) : (
            <>
              <div className="p-2 bg-white/10 rounded-xl">
                <WifiOff className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <p className="text-white font-medium">No devices connected</p>
                <p className="text-white/60 text-sm">Connect a device to sync your health data</p>
              </div>
            </>
          )}
        </div>

        {/* Today's Metrics */}
        {connectedDevices.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              Today&apos;s Metrics
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {DAILY_METRICS.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${metric.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white/60 text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">{metric.value}</span>
                        <span className="text-white/50 text-sm ml-1">{metric.unit}</span>
                      </div>
                      {metric.trend && (
                        <span className={`text-sm flex items-center gap-1 ${
                          metric.trend > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <TrendingUp className={`w-3 h-3 ${metric.trend < 0 ? 'rotate-180' : ''}`} />
                          {Math.abs(metric.trend)}%
                        </span>
                      )}
                    </div>
                    <p className="text-white/30 text-xs mt-1">via {metric.source}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Connected Devices</h2>

            {connectedDevices.map((device) => (
              <div
                key={device.id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-green-500/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${device.color} flex items-center justify-center text-2xl`}>
                      {device.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{device.name}</h3>
                      <p className="text-sm text-white/50">{device.deviceName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDevice(device);
                      setShowSettings(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Settings className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {device.lastSync}
                    </span>
                    {device.batteryLevel && (
                      <span className="flex items-center gap-1">
                        🔋 {device.batteryLevel}%
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-green-400">
                    <Check className="w-4 h-4" />
                    Connected
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Devices */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-400" />
            Add Device
          </h2>

          {devices.filter(d => !d.isConnected).map((device) => (
            <button
              key={device.id}
              onClick={() => handleConnect(device.id)}
              className="w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-violet-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${device.color} flex items-center justify-center text-2xl`}>
                    {device.logo}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{device.name}</h3>
                    <p className="text-sm text-white/50">Tap to connect</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </button>
          ))}
        </div>

        {/* Data Sync Info */}
        <div className="bg-gradient-to-r from-violet-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-violet-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Automatic Sync</h3>
          <p className="text-white/60 text-sm mb-4">
            Your wearable data syncs automatically every hour. This includes steps, heart rate, sleep, and workout data.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Steps', 'Heart Rate', 'Sleep', 'Workouts', 'HRV'].map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Device Settings Modal */}
      {showSettings && selectedDevice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedDevice.color} flex items-center justify-center text-xl`}>
                  {selectedDevice.logo}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedDevice.name}</h3>
                  <p className="text-sm text-white/50">{selectedDevice.deviceName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-white/60">Sync Settings</p>

              {[
                { key: 'steps', label: 'Steps', icon: Footprints },
                { key: 'heartRate', label: 'Heart Rate', icon: Heart },
                { key: 'sleep', label: 'Sleep', icon: Moon },
                { key: 'workouts', label: 'Workouts', icon: Activity },
                { key: 'weight', label: 'Weight', icon: Activity },
              ].map((setting) => {
                const Icon = setting.icon;
                const isEnabled = selectedDevice.syncSettings[setting.key as keyof typeof selectedDevice.syncSettings];
                return (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-white/60" />
                      <span className="text-white">{setting.label}</span>
                    </div>
                    <button
                      onClick={() => toggleSyncSetting(selectedDevice.id, setting.key as keyof typeof selectedDevice.syncSettings)}
                      className={`w-12 h-7 rounded-full transition-all ${
                        isEnabled ? 'bg-violet-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-all ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDisconnect(selectedDevice.id)}
                className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-2xl font-medium hover:bg-red-500/30 transition-all"
              >
                Disconnect
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
