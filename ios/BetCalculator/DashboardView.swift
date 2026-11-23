import SwiftUI
import Charts

struct DashboardView: View {
    @EnvironmentObject var store: SimulationStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    if let error = store.errorMessage, store.simulation == nil {
                        Text(error)
                            .font(.footnote)
                            .foregroundColor(.appDanger)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.appDanger.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }

                    if let sim = store.simulation {
                        statsGrid(sim)
                        charts(sim)
                    } else if store.isLoading {
                        ProgressView("Calculando…")
                            .frame(maxWidth: .infinity, minHeight: 200)
                    }
                }
                .padding()
            }
            .background(Color.appSurface.ignoresSafeArea())
            .navigationTitle("Dashboard")
        }
    }

    private func statsGrid(_ sim: SimulationResponse) -> some View {
        let summary = sim.summary
        let gains = sim.bets.reduce(0) { $0 + ($1.net > 0 ? $1.net : 0) }
        let losses = sim.bets.reduce(0) { $0 + ($1.net < 0 ? -$1.net : 0) }

        return LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
            StatCard(title: "Capital inicial", value: formatCOP(summary.initialCapital), color: .appBrand, icon: "wallet.pass")
            StatCard(title: "Capital actual", value: formatCOP(summary.finalCapital), color: .appBrand, icon: "briefcase")
            StatCard(title: "Meta económica", value: formatCOP(summary.goal), color: .appWarning, icon: "target")
            StatCard(title: "Ganancias acumuladas", value: formatCOP(gains), color: .appSuccess, icon: "arrow.up.right")
            StatCard(title: "Pérdidas acumuladas", value: formatCOP(losses), color: .appDanger, icon: "arrow.down.right")
            StatCard(title: "% de cumplimiento", value: formatPercent(summary.completionPercent), color: .appBrand, icon: "gauge")
            StatCard(title: "Victorias", value: "\(summary.wins)", color: .appSuccess, icon: "trophy")
            StatCard(title: "Derrotas", value: "\(summary.losses)", color: .appDanger, icon: "xmark")
            StatCard(title: "Rentabilidad", value: formatPercent(summary.profitability), color: summary.profitability >= 0 ? .appSuccess : .appDanger, icon: "percent")
        }
    }

    private func charts(_ sim: SimulationResponse) -> some View {
        let sortedScenarios = (store.scenarios?.scenarios ?? []).sorted { $0.wins < $1.wins }

        return VStack(spacing: 16) {
            CardView(title: "Evolución del capital") {
                Chart {
                    ForEach(Array(sim.bets.enumerated()), id: \.offset) { index, bet in
                        LineMark(
                            x: .value("Apuesta", index + 1),
                            y: .value("Capital", bet.capitalAfter)
                        )
                        .foregroundStyle(Color.appBrand)
                    }
                }
                .frame(height: 220)
            }

            CardView(title: "Ganancias y pérdidas por apuesta") {
                Chart {
                    ForEach(Array(sim.bets.enumerated()), id: \.offset) { index, bet in
                        BarMark(
                            x: .value("Apuesta", index + 1),
                            y: .value("Neto", bet.net)
                        )
                        .foregroundStyle(bet.net >= 0 ? Color.appSuccess : Color.appDanger)
                    }
                }
                .frame(height: 220)
            }

            CardView(title: "Comparación de escenarios") {
                Chart {
                    ForEach(sortedScenarios) { scenario in
                        BarMark(
                            x: .value("Escenario", scenario.label),
                            y: .value("Capital final", scenario.best.finalCapital)
                        )
                        .foregroundStyle(Color.appBrand)
                    }
                }
                .frame(height: 220)
            }
        }
    }
}
