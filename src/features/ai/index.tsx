import { useAiHealth, useChurnResults, useSegmentResults, useComputeChurn, useComputeSegments, useComputeRecommendations } from "./ai.hooks";

/* ═══════════════════════════════════════════
   AI Intelligence Dashboard
   ═══════════════════════════════════════════ */

const AiDashboard = () => {
    const { data: health } = useAiHealth();
    const churnMutation = useComputeChurn();
    const segmentMutation = useComputeSegments();
    const recMutation = useComputeRecommendations();
    const { data: churnData } = useChurnResults();
    const { data: segmentData } = useSegmentResults();

    const isLoading = churnMutation.isPending || segmentMutation.isPending || recMutation.isPending;

    return (
        <div data-tour="ai-page" className="space-y-6 max-w-[1200px]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Insights Engine</h1>
                    <p className="text-sm text-gray-400 mt-1">Machine learning-powered CRM insights</p>
                </div>
            </div>

            {/* Health Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Engine Health</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`w-3 h-3 rounded-full ${health?.churnModel.available ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-sm font-semibold text-gray-800">Churn Prediction</span>
                        </div>
                        <p className="text-xs text-gray-400">
                            {health?.churnModel.available
                                ? `${health.churnModel.features} features loaded`
                                : "Model not loaded"}
                        </p>
                    </div>
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`w-3 h-3 rounded-full ${health?.segmentation.available ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-sm font-semibold text-gray-800">Segmentation</span>
                        </div>
                        <p className="text-xs text-gray-400">K-Means clustering (3 segments)</p>
                    </div>
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`w-3 h-3 rounded-full ${health?.recommendations.available ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-sm font-semibold text-gray-800">Recommendations</span>
                        </div>
                        <p className="text-xs text-gray-400">IBCF cosine similarity engine</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Run AI Computations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => churnMutation.mutate()}
                        disabled={isLoading}
                        className="h-11 px-4 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {churnMutation.isPending ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : null}
                        Compute Churn
                    </button>
                    <button
                        onClick={() => segmentMutation.mutate()}
                        disabled={isLoading}
                        className="h-11 px-4 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {segmentMutation.isPending ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : null}
                        Compute Segments
                    </button>
                    <button
                        onClick={() => recMutation.mutate()}
                        disabled={isLoading}
                        className="h-11 px-4 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {recMutation.isPending ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : null}
                        Compute Recommendations
                    </button>
                </div>
            </div>

            {/* Churn Results */}
            {churnData?.customers && churnData.customers.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Churn Predictions ({churnData.total} customers)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-100">
                                    <th className="pb-2 font-medium">Customer</th>
                                    <th className="pb-2 font-medium">Risk Score</th>
                                    <th className="pb-2 font-medium">Risk Level</th>
                                    <th className="pb-2 font-medium">Lifecycle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {churnData.customers.slice(0, 10).map((c) => (
                                    <tr key={c.id} className="border-b border-gray-50">
                                        <td className="py-2.5 text-gray-900">{c.name}</td>
                                        <td className="py-2.5">{(c.churnRiskScore * 100).toFixed(1)}%</td>
                                        <td className="py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                c.churnRiskScore >= 0.8 ? "bg-red-50 text-red-600" :
                                                c.churnRiskScore >= 0.5 ? "bg-yellow-50 text-yellow-600" :
                                                "bg-green-50 text-green-600"
                                            }`}>
                                                {c.churnRiskScore >= 0.8 ? "High" : c.churnRiskScore >= 0.5 ? "Low" : "Stable"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-gray-500">{c.lifecycleStage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Segment Distribution */}
            {segmentData?.distribution && segmentData.distribution.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Segment Distribution ({segmentData.totalCustomers} customers)</h2>
                    <div className="space-y-3">
                        {segmentData.distribution.map((seg) => (
                            <div key={seg.segment} className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700 w-36">{seg.name}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                                    <div
                                        className="bg-[var(--color-primary-500)] h-2.5 rounded-full transition-all"
                                        style={{ width: `${seg.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 w-20 text-right">{seg.count} ({seg.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="p-2 rounded-lg bg-blue-50 text-blue-500">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Churn Prediction</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Logistic regression model trained on customer behavior data. Predicts which customers are likely to churn so you can take proactive action.
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="p-2 rounded-lg bg-blue-50 text-blue-500">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Customer Segmentation</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        K-Means clustering divides customers into 3 segments: Browsers, Bargain/Casual, and Premium Loyal — based on behavioral patterns.
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="p-2 rounded-lg bg-blue-50 text-blue-500">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Product Recommendations</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Item-Based Collaborative Filtering with time decay. Recommends frequently co-purchased products to boost cross-sell opportunities.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AiDashboard;
