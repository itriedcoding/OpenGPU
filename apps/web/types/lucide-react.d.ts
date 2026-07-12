declare module "lucide-react" {
  import type { FC, SVGProps } from "react";

  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  type Icon = FC<IconProps>;

  export const Cpu: Icon;
  export const Menu: Icon;
  export const X: Icon;
  export const ChevronDown: Icon;
  export const ArrowRight: Icon;
  export const Zap: Icon;
  export const Star: Icon;
  export const MapPin: Icon;
  export const Code: Icon;
  export const CreditCard: Icon;
  export const Globe: Icon;
  export const Shield: Icon;
  export const UserPlus: Icon;
  export const Monitor: Icon;
  export const Rocket: Icon;
  export const DollarSign: Icon;
  export const Server: Icon;
  export const TrendingUp: Icon;
  export const SlidersHorizontal: Icon;
  export const Grid3X3: Icon;
  export const List: Icon;
  export const ArrowLeft: Icon;
  export const Clock: Icon;
  export const Thermometer: Icon;
  export const Wifi: Icon;
  export const ChevronRight: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Github: Icon;
  export const Twitter: Icon;
  export const MessageCircle: Icon;
  export const Mail: Icon;
  export const Check: Icon;
  export const LayoutDashboard: Icon;
  export const Settings: Icon;
  export const HelpCircle: Icon;
  export const BookOpen: Icon;
  export const Download: Icon;
  export const HardDrive: Icon;
  export const ArrowUpRight: Icon;
  export const Plus: Icon;
  export const Activity: Icon;
  export const Users: Icon;
  export const Loader2: Icon;
  export const LogOut: Icon;
  export const User: Icon;
}
