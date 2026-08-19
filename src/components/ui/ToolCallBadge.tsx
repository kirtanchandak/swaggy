'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  MapPin, 
  Utensils, 
  Search, 
  ShoppingCart, 
  Ticket, 
  Clock, 
  History, 
  Wrench,
  Loader2
} from 'lucide-react';

interface ToolCallBadgeProps {
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
}

function getToolConfig(toolName: string) {
  switch (toolName) {
    case 'get_addresses':
      return { label: 'Checking saved addresses', icon: MapPin };
    case 'search_restaurants':
      return { label: 'Searching nearby restaurants', icon: Search };
    case 'get_restaurant_menu':
      return { label: 'Reading restaurant menu', icon: Utensils };
    case 'search_menu':
      return { label: 'Searching menu items', icon: Search };
    case 'update_food_cart':
      return { label: 'Updating cart', icon: ShoppingCart };
    case 'get_food_cart':
      return { label: 'Checking cart details', icon: ShoppingCart };
    case 'flush_food_cart':
      return { label: 'Clearing cart', icon: ShoppingCart };
    case 'fetch_food_coupons':
      return { label: 'Finding available coupons', icon: Ticket };
    case 'apply_food_coupon':
      return { label: 'Applying coupon', icon: Ticket };
    case 'place_food_order':
      return { label: 'Placing order', icon: CheckCircle2 };
    case 'track_food_order':
      return { label: 'Tracking order', icon: Clock };
    case 'get_food_orders':
      return { label: 'Checking order history', icon: History };
    default:
      return { label: `Using ${toolName.replace(/_/g, ' ')}`, icon: Wrench };
  }
}

export function ToolCallBadge({ toolName, state }: ToolCallBadgeProps) {
  const { label, icon: Icon } = getToolConfig(toolName);
  const isLoading = state === 'call' || state === 'partial-call';

  // Quick heuristic to change 'ing' verbs to past tense
  const getPastTense = (str: string) => {
    return str
      .replace('Checking', 'Checked')
      .replace('Searching', 'Searched')
      .replace('Reading', 'Read')
      .replace('Updating', 'Updated')
      .replace('Clearing', 'Cleared')
      .replace('Finding', 'Found')
      .replace('Applying', 'Applied')
      .replace('Placing', 'Placed')
      .replace('Tracking', 'Tracked');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-center gap-2.5 px-3.5 py-2 w-fit rounded-xl border ${
        isLoading 
          ? 'bg-swiggy-primary/10 border-swiggy-primary/20 text-swiggy-light' 
          : 'bg-surface-elevated border-border-strong text-gray-400'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-swiggy-primary" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      )}
      <span className="text-[13px] font-medium tracking-wide">
        {isLoading ? `${label}...` : getPastTense(label)}
      </span>
      {isLoading && (
        <Icon className="w-4 h-4 opacity-50 ml-1" />
      )}
    </motion.div>
  );
}
