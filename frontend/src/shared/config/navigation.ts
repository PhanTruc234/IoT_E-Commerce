import {
    Boxes, Cable, CircuitBoard, Cpu, Thermometer, Wifi, Zap,
    type LucideIcon,
} from 'lucide-react';

export interface NavCategory {
    label: string;
    slug: string;
    icon: LucideIcon;
}

export const CATEGORIES: NavCategory[] = [
    { label: 'IoT & Module', slug: 'iot-module', icon: Wifi },
    { label: 'ESP32 / ESP8266', slug: 'esp', icon: Cpu },
    { label: 'Arduino', slug: 'arduino', icon: CircuitBoard },
    { label: 'Raspberry Pi', slug: 'raspberry-pi', icon: Cpu },
    { label: 'Cảm biến', slug: 'cam-bien', icon: Thermometer },
    { label: 'Linh kiện điện tử', slug: 'linh-kien', icon: Zap },
    { label: 'Phụ kiện', slug: 'phu-kien', icon: Cable },
    { label: 'Combo sản phẩm', slug: 'combo', icon: Boxes },
];