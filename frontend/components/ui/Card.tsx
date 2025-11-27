import { ReactNode } from 'react';
import { cn } from '@/lib/utils/helpers';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
}

export function Card({ children, className, title, subtitle }: CardProps) {
    return (
        <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
            {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-gray-200">
                    {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'red' | 'yellow';
}

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {trend && (
                        <p className={cn('text-sm mt-2', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                <div className={cn('p-3 rounded-full', colors[color])}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}
