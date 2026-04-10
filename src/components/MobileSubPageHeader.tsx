import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@/components/icons";

type MobileSubPageHeaderProps = {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle?: string;
};

export default function MobileSubPageHeader({
  backTo,
  backLabel,
  title,
  subtitle,
}: MobileSubPageHeaderProps) {
  return (
    <div className="sm:hidden">
      <Link
        to={backTo}
        className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 transition duration-150 hover:text-amber-700 dark:hover:text-amber-300"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {backLabel}
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
