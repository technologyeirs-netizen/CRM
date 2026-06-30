 

export default function SalesInvoicePartySection({
  selectedParty,
  setSelectedParty,

  showPartyDropdown,
  setShowPartyDropdown,

  clients,
  clientsLoading,

  clientFilters,
  setClientFilters,
}) {
  return (
    <div className="lg:col-span-7">
            <h2 className="text-gray-600 font-medium mb-2">Bill To</h2>
            {selectedParty ? (
              <div className="border border-blue-400 bg-blue-50/50 rounded-lg p-4 relative group max-w-md">
                <button
                  onClick={() => setSelectedParty(null)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
                <div className="space-y-1">
                  <p className="font-bold text-indigo-700 text-lg">
                    {selectedParty.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    📞 {selectedParty.phone || "N/A"}
                  </p>

                  <p className="text-sm text-gray-500">
                    ✉️ {selectedParty.email || "N/A"}
                  </p>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    📍{" "}
                    {typeof selectedParty.address === "object"
                      ? [
                          selectedParty.address?.street,
                          selectedParty.address?.city,
                          selectedParty.address?.state,
                          selectedParty.address?.zipCode,
                          selectedParty.address?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : selectedParty.address ||
                        selectedParty.billingAddress ||
                        "No Address"}
                  </p>

                  <div className="pt-2">
                    <span className="text-xs text-gray-400">
                      Outstanding Balance
                    </span>

                    <p className="text-red-500 font-bold text-lg">
                      ₹ {selectedParty.balance || 0}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative max-w-md">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPartyDropdown(!showPartyDropdown);
                  }}
                  className="w-full h-28 border-2 border-dashed border-blue-400 rounded-md flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50 transition"
                >
                  <span className="text-lg font-medium">+ Add Party</span>
                </button>

                {/* Party Dropdown List */}
                {showPartyDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {/* SEARCH BAR */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <input
                        type="text"
                        placeholder="Search client..."
                        value={clientFilters.search}
                        onChange={(e) =>
                          setClientFilters({
                            ...clientFilters,
                            search: e.target.value,
                          })
                        }
                        className="w-full h-11 rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* CLIENT LIST */}
                    <div className="max-h-[350px] overflow-y-auto">
                      {clientsLoading ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          Loading clients...
                        </div>
                      ) : clients.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No clients found
                        </div>
                      ) : (
                        clients.map((client) => (
                          <button
                            key={client._id}
                            onClick={() => {
                              setSelectedParty(client);
                              setShowPartyDropdown(false);
                            }}
                            className="w-full p-4 border-b border-gray-100 hover:bg-indigo-50 transition text-left"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {client.firstName} {client.lastName}
                                </h3>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-gray-400">Balance</p>

                                <p className="font-bold text-red-500">
                                  ₹ {client.balance || 0}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
  );
}