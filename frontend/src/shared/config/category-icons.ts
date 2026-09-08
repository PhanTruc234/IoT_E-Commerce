import {
    Activity, Antenna, Battery, BatteryCharging, Bell, Bluetooth, Boxes, Cable,
    Camera, Cctv, CircuitBoard, Cog, Cpu, Droplets, Fan, Gauge, HardDrive,
    Lightbulb, MemoryStick, Package, Plug, PlugZap, Radio, Router, SatelliteDish,
    Server, Speaker, Sun, Thermometer, ToggleRight, Usb, Waves, Wifi, Wrench, Zap,
    type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    Cpu, CircuitBoard, Wifi, Bluetooth, Radio, Antenna, Thermometer, Droplets, Waves,
    Activity, Zap, Lightbulb, ToggleRight, Cable, Plug, PlugZap, Boxes, Package, Server,
    Router, HardDrive, MemoryStick, Gauge, Sun, Battery, BatteryCharging, Camera, Bell,
    Fan, Speaker, Cctv, SatelliteDish, Usb, Cog, Wrench,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);