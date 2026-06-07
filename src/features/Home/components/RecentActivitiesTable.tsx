import React, { useState, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

const RecentActivitiesTable = ({ activities = [], isLoading }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  const displayActivities =
    activities && activities.length > 0
      ? activities
      : [
          {
            id: 1,
            activityType: "Created Contact",
            performedBy: "Sarah Ali",
            relatedTo: "Contact",
            details: "Added new contact: Ahmed Hassan",
            date: "Nov 8th, 2025",
            status: "Pending",
          },
          {
            id: 2,
            activityType: "Updated Deal",
            performedBy: "Mohamed Khaled",
            relatedTo: "Deal",
            details: "Changed deal status to Negotiation",
            date: "Nov 8th, 2025",
            status: "Completed",
          },
          {
            id: 3,
            activityType: "Added Note",
            performedBy: "Sarah Ali",
            relatedTo: "Company",
            details: "Left a note on RetailMate profile",
            date: "Nov 7th, 2025",
            status: "Completed",
          },
          {
            id: 4,
            activityType: "Deleted Ticket",
            performedBy: "Admin User",
            relatedTo: "Ticket",
            details: "Removed support ticket #1024",
            date: "Nov 7th, 2025",
            status: "Cancelled",
          },
          {
            id: 5,
            activityType: "Created Company",
            performedBy: "Sarah Ali",
            relatedTo: "Company",
            details: "Added new company: TechFlow",
            date: "Nov 6th, 2025",
            status: "Completed",
          },
          {
            id: 6,
            activityType: "Updated Contact",
            performedBy: "Mohamed Khaled",
            relatedTo: "Contact",
            details: "Updated phone number for John Doe",
            date: "Nov 6th, 2025",
            status: "Pending",
          },
        ];

  const toggleSelectAll = () => {
    if (selectedItems.length === displayActivities.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(displayActivities.map((_, index) => index));
    }
  };

  const toggleSelect = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter((i) => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden pb-4">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--color-border)]">
        <h3 className="text-base font-bold text-[var(--color-text-title)]">
          Recent Activites
        </h3>
        <button className="text-[var(--color-primary-600)] text-sm font-semibold hover:underline">
          View all
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedItems.length > 0 && (
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-50 mb-2">
            <span className="text-sm font-medium text-gray-600">
              {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "item" : "items"} selected
            </span>
            <button className="px-3 py-1.5 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-medium border border-red-200">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              {/* Checkbox */}
              <th className="py-3 px-6 text-left w-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  checked={
                    selectedItems.length === displayActivities.length &&
                    displayActivities.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 whitespace-nowrap">
                Activity Type
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 whitespace-nowrap">
                Performed By
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 whitespace-nowrap hidden md:table-cell">
                Related To
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 whitespace-nowrap hidden lg:table-cell">
                Details
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 whitespace-nowrap hidden sm:table-cell">
                Date
              </th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-500 whitespace-nowrap pr-6">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-400 text-sm"
                >
                  Refreshing activities...
                </td>
              </tr>
            ) : displayActivities.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-500 text-sm"
                >
                  No recent activities found.
                </td>
              </tr>
            ) : (
              displayActivities.map((activity, index) => (
                <tr
                  key={activity.id ?? index}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    selectedItems.includes(index)
                      ? "bg-blue-50/40"
                      : "hover:bg-gray-50/60"
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-4 px-6 align-middle w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                      checked={selectedItems.includes(index)}
                      onChange={() => toggleSelect(index)}
                    />
                  </td>

                  {/* Activity Type — plain text */}
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-sm text-gray-800">
                    {activity.activityType}
                  </td>

                  {/* Performed By — plain text, no avatar */}
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-sm text-gray-800">
                    {activity.performedBy}
                  </td>

                  {/* Related To */}
                  <td className="py-4 px-4 align-middle whitespace-nowrap hidden md:table-cell text-sm text-gray-800">
                    {activity.relatedTo}
                  </td>

                  {/* Details */}
                  <td className="py-4 px-4 align-middle whitespace-nowrap hidden lg:table-cell text-sm text-gray-800 max-w-[220px] truncate">
                    {activity.details}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 align-middle whitespace-nowrap hidden sm:table-cell text-sm text-gray-800">
                    {activity.date}
                  </td>

                  {/* Action — 3-dot menu only */}
                  <td className="py-4 px-4 pr-6 align-middle text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === index ? null : index);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === index && (
                      <div
                        className={`absolute right-10 ${
                          index >= displayActivities.length - 2
                            ? "bottom-0"
                            : "top-1/2 -translate-y-1/2"
                        } bg-white shadow-xl rounded-xl border border-gray-100 py-2 w-40 z-50`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("View activity:", activity);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-gray-700 font-medium flex items-center gap-2 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Edit activity:", activity);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-gray-700 font-medium flex items-center gap-2 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this activity?",
                              )
                            ) {
                              console.log("Delete activity:", activity);
                            }
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivitiesTable;
