'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { overviewApi, type OverviewRange } from '../api/overview.api';

export function useOverview(range: OverviewRange) {
    return useQuery({
        queryKey: ['admin', 'overview', range],
        queryFn: () => overviewApi.get(range),
        // Đổi kỳ thì giữ số cũ trên màn hình trong lúc tải số mới
        placeholderData: keepPreviousData,
    });
}
