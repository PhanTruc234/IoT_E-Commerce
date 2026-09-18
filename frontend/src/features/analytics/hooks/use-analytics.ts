'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/events.api';

export function useAnalytics(days: number) {
    return useQuery({ queryKey: ['admin', 'analytics', days], queryFn: () => analyticsApi.get(days) });
}