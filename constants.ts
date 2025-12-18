
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: '餐飲飲食', type: 'EXPENSE', icon: 'fa-utensils', color: '#EF4444' },
  { id: 'cat2', name: '交通運輸', type: 'EXPENSE', icon: 'fa-car', color: '#F59E0B' },
  { id: 'cat3', name: '日常購物', type: 'EXPENSE', icon: 'fa-shopping-cart', color: '#10B981' },
  { id: 'cat4', name: '娛樂生活', type: 'EXPENSE', icon: 'fa-gamepad', color: '#8B5CF6' },
  { id: 'cat5', name: '居住費用', type: 'EXPENSE', icon: 'fa-home', color: '#3B82F6' },
  { id: 'cat6', name: '醫療健康', type: 'EXPENSE', icon: 'fa-heartbeat', color: '#EC4899' },
  { id: 'cat7', name: '工作薪資', type: 'INCOME', icon: 'fa-money-bill-wave', color: '#10B981' },
  { id: 'cat8', name: '投資收益', type: 'INCOME', icon: 'fa-chart-line', color: '#6366F1' },
  { id: 'cat9', name: '其他收入', type: 'INCOME', icon: 'fa-plus-circle', color: '#94A3B8' },
];

export const ACCOUNT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'
];
