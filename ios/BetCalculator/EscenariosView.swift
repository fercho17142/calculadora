import SwiftUI
import Charts

struct EscenariosView: View {
    @EnvironmentObject var store: SimulationStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    if let scenarios = store.scenarios?.scenarios {
                        table(scenarios)
                        chart(scenarios)
                    } else if store.isLoading {
                        ProgressView("Calculando…")
                            .frame(maxWidth: .infinity, minHeight: 200)
                    }
                }
                .padding()
            }
            .background(Color.appSurface.ignoresSafeArea())
            .navigationTitle("Escenarios")
        }
    }

    private func table(_ scenarios: [Scenario]) -> some View {
        CardView(title: "Comparación de escenarios") {
            VStack(spacing: 0) {
                HStack {
                    Text("Escenario").frame(maxWidth: .infinity, alignment: .leading)
                    Text("Mejor").frame(maxWidth: .infinity, alignment: .trailing)
                    Text("Peor").frame(maxWidth: .infinity, alignment: .trailing)
                    Text("Meta").frame(width: 44, alignment: .trailing)
                }
                .font(.caption2)
                .foregroundColor(.secondary)
                .padding(.bottom, 6)

                ForEach(scenarios) { scenario in
                    Divider()
                    HStack {
                        Text(scenario.label)
                            .bold()
                            .frame(maxWidth: .infinity, alignment: .leading)

                        Text(formatCOP(scenario.best.finalCapital))
                            .foregroundColor(.appSuccess)
                            .frame(maxWidth: .infinity, alignment: .trailing)

                        Text(formatCOP(scenario.worst.finalCapital))
                            .foregroundColor(.appDanger)
                            .frame(maxWidth: .infinity, alignment: .trailing)

                        Image(systemName: scenario.best.goalAchieved ? "checkmark.circle.fill" : "xmark.circle")
                            .foregroundColor(scenario.best.goalAchieved ? .appSuccess : .secondary)
                            .frame(width: 44, alignment: .trailing)
                    }
                    .font(.subheadline)
                    .padding(.vertical, 8)
                }
            }
        }
    }

    private func chart(_ scenarios: [Scenario]) -> some View {
        let sorted = scenarios.sorted { $0.wins < $1.wins }
        return CardView(title: "Capital final por escenario") {
            Chart {
                ForEach(sorted) { scenario in
                    BarMark(
                        x: .value("Escenario", scenario.label),
                        y: .value("Mejor caso", scenario.best.finalCapital)
                    )
                    .foregroundStyle(Color.appSuccess)

                    BarMark(
                        x: .value("Escenario", scenario.label),
                        y: .value("Peor caso", scenario.worst.finalCapital)
                    )
                    .foregroundStyle(Color.appDanger)
                }
            }
            .frame(height: 260)
        }
    }
}
