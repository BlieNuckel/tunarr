import FilterBar from "@/components/FilterBar";

type RequestFilterValues = {
  requester: string;
  status: string;
};

interface RequestFilterProps {
  values: RequestFilterValues;
  onChange: (key: string, value: string) => void;
}

const REQUEST_FILTERS = [
  {
    key: "requester",
    label: "Requester",
    options: [
      { value: "all", label: "All" },
      { value: "mine", label: "Mine" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "all", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "declined", label: "Declined" },
    ],
  },
];

export default function RequestFilter({
  values,
  onChange,
}: RequestFilterProps) {
  return (
    <FilterBar filters={REQUEST_FILTERS} values={values} onChange={onChange} />
  );
}
